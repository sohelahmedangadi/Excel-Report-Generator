const express  = require('express');
const path     = require('path');
const fs       = require('fs');
const Report   = require('../models/Report');
const auth     = require('../middleware/auth');
const upload   = require('../middleware/upload');
const { runReportEngine } = require('../services/reportService');

const router = express.Router();

function docToReport(d, includeSummary = false) {
  const r = {
    id: d._id.toString(), user_id: d.user_id.toString(),
    title: d.title, original_name: d.original_name, original_size: d.original_size,
    status: d.status, error_message: d.error_message,
    row_count: d.row_count, col_count: d.col_count,
    cat_column: d.cat_column, num_column: d.num_column,
    processing_time_ms: d.processing_time_ms,
    created_at: d.createdAt, updated_at: d.updatedAt,
  };
  if (includeSummary) r.summary = d.summary;
  return r;
}

function cleanFiles(...paths) {
  paths.filter(Boolean).forEach(p => {
    try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch(_) {}
  });
}

// POST /api/reports/upload
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const { originalname, path: filePath, size } = req.file;
  const title = req.body.title || path.parse(originalname).name;
  try {
    const doc = await Report.create({
      user_id: req.user.id, title, original_name: originalname, original_size: size,
    });
    const reportId = doc._id.toString();
    res.status(202).json({ reportId, message: 'Report queued.' });
    runReportEngine(reportId, path.resolve(filePath), req.user.id)
      .catch(err => console.error(`Report ${reportId} failed:`, err.message));
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// GET /api/reports
router.get('/', auth, async (req, res) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit)  || 20, 100);
    const offset = parseInt(req.query.offset) || 0;
    const [total, docs] = await Promise.all([
      Report.countDocuments({ user_id: req.user.id }),
      Report.find({ user_id: req.user.id }).sort({ createdAt: -1 }).skip(offset).limit(limit).lean(),
    ]);
    res.json({ reports: docs.map(d => docToReport(d)), total, limit, offset });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch reports' }); }
});

// GET /api/reports/:id/status
router.get('/:id/status', auth, async (req, res) => {
  try {
    const doc = await Report.findOne({ _id: req.params.id, user_id: req.user.id }).lean();
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({
      id: doc._id.toString(), status: doc.status,
      pct: { queued: 5, processing: 50, completed: 100, failed: 0 }[doc.status] || 5,
      stage: doc.status, error_message: doc.error_message, row_count: doc.row_count,
    });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch status' }); }
});

// GET /api/reports/:id/summary
router.get('/:id/summary', auth, async (req, res) => {
  try {
    const doc = await Report.findOne({ _id: req.params.id, user_id: req.user.id }).lean();
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (doc.status !== 'completed') return res.status(400).json({ error: 'Report not ready' });
    res.json({ summary: doc.summary || null });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch summary' }); }
});

// GET /api/reports/:id/download
router.get('/:id/download', auth, async (req, res) => {
  try {
    const doc = await Report.findOne({ _id: req.params.id, user_id: req.user.id }).lean();
    if (!doc) return res.status(404).json({ error: 'Report not found' });
    if (doc.status !== 'completed') return res.status(400).json({ error: 'Report not ready yet' });
    if (!doc.output_path || !fs.existsSync(doc.output_path))
      return res.status(404).json({ error: 'File not found on disk' });
    const basename = path.parse(doc.original_name).name;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${basename}_report.xlsx"`);
    fs.createReadStream(doc.output_path).pipe(res);
  } catch (err) { res.status(500).json({ error: 'Database error' }); }
});

// GET /api/reports/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await Report.findOne({ _id: req.params.id, user_id: req.user.id }).lean();
    if (!doc) return res.status(404).json({ error: 'Report not found' });
    res.json({ report: docToReport(doc, true), columns: doc.columns || [] });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch report' }); }
});

// DELETE /api/reports/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const doc = await Report.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!doc) return res.status(404).json({ error: 'Report not found' });
    cleanFiles(doc.input_path, doc.output_path);
    await doc.deleteOne();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Failed to delete' }); }
});

module.exports = router;
