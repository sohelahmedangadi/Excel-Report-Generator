const express = require('express');
const Report  = require('../models/Report');
const auth    = require('../middleware/auth');

const router = express.Router();

router.get('/stats', auth, async (req, res) => {
  try {
    const [allReports, recentDocs] = await Promise.all([
      Report.find({ user_id: req.user.id }).lean(),
      Report.find({ user_id: req.user.id }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const withTime = allReports.filter(r => r.processing_time_ms);
    const stats = {
      totalReports:       allReports.length,
      totalRowsProcessed: allReports.reduce((s, r) => s + (r.row_count || 0), 0),
      totalBytesUploaded: allReports.reduce((s, r) => s + (r.original_size || 0), 0),
      avgProcessingMs:    withTime.length
        ? Math.round(withTime.reduce((s, r) => s + r.processing_time_ms, 0) / withTime.length) : 0,
      completed: allReports.filter(r => r.status === 'completed').length,
      failed:    allReports.filter(r => r.status === 'failed').length,
      pending:   allReports.filter(r => ['queued','processing'].includes(r.status)).length,
    };

    const now = new Date();
    const monthMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthMap[`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`] = 0;
    }
    allReports.forEach(r => {
      const k = new Date(r.createdAt).toISOString().slice(0, 7);
      if (k in monthMap) monthMap[k]++;
    });

    res.json({
      stats,
      recentReports: recentDocs.map(d => ({
        id: d._id.toString(), title: d.title, original_name: d.original_name,
        status: d.status, row_count: d.row_count, created_at: d.createdAt,
      })),
      monthlyActivity: Object.entries(monthMap).map(([month, count]) => ({ month, count })),
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

module.exports = router;
