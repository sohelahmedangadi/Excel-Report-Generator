const { spawn } = require('child_process');
const path      = require('path');
const fs        = require('fs');
const Report    = require('../models/Report');

const REPORTS_DIR = process.env.REPORTS_DIR || './reports';
fs.mkdirSync(REPORTS_DIR, { recursive: true });

const PYTHON      = process.env.PYTHON_CMD || 'python3';
const ENGINE_PATH = path.join(__dirname, '../python/report_engine.py');

async function runReportEngine(reportId, inputPath, userId) {
  const outputPath = path.join(path.resolve(REPORTS_DIR), `${reportId}.xlsx`);

  await Report.findByIdAndUpdate(reportId, {
    status: 'processing', input_path: inputPath, output_path: outputPath,
  }).catch(err => console.error('DB update error:', err.message));

  return new Promise((resolve, reject) => {
    const start  = Date.now();
    const py     = spawn(PYTHON, [ENGINE_PATH, inputPath, outputPath]);
    let lastMeta = {};

    py.stdout.on('data', chunk => {
      chunk.toString().split('\n').filter(Boolean).forEach(line => {
        try {
          const data = JSON.parse(line);
          if (data.error) throw new Error(data.error);
          lastMeta = { ...lastMeta, ...data };
        } catch (_) {}
      });
    });

    py.stderr.on('data', d => console.error('[Python]', d.toString().trim()));

    py.on('close', async code => {
      const elapsed = Date.now() - start;

      if (code !== 0) {
        await Report.findByIdAndUpdate(reportId, {
          status: 'failed',
          error_message: `Python engine exited with code ${code}`,
        }).catch(() => {});
        return reject(new Error(`Report engine failed (exit ${code})`));
      }

      const columns = (lastMeta.cols_info || []).map(c => ({
        name:        c.name,
        dtype:       c.dtype,
        non_null:    c.non_null,
        null_pct:    parseFloat(c.null_pct) || 0,
        unique_vals: c.unique,
        sample:      c.sample,
      }));

      await Report.findByIdAndUpdate(reportId, {
        status:             'completed',
        row_count:          lastMeta.rows       || null,
        col_count:          lastMeta.cols       || null,
        cat_column:         lastMeta.cat_column || null,
        num_column:         lastMeta.num_column || null,
        processing_time_ms: elapsed,
        output_path:        outputPath,
        summary:            lastMeta.summary    || null,
        columns,
      }).catch(err => console.error('Final update error:', err.message));

      console.log(`✅ Report ${reportId} completed in ${elapsed}ms`);
      resolve({ ...lastMeta, outputPath, processingTimeMs: elapsed });
    });

    py.on('error', async err => {
      await Report.findByIdAndUpdate(reportId, {
        status: 'failed', error_message: err.message,
      }).catch(() => {});
      reject(err);
    });
  });
}

module.exports = { runReportEngine };
