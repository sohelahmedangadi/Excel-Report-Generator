/**
 * Persistent-style in-memory store.
 * Users dictionary is pre-seeded and survives the session.
 * Registered users are added at runtime — print them to console for manual record-keeping.
 */

// ── Pre-seeded users (add manually here to persist across restarts) ───────────
// Format: { id, name, email, password (bcrypt hash), plan }
const SEEDED_USERS = [
  // Example — add entries here after registering:
  // { id: 'abc-123', name: 'Sohel', email: 'sohel@example.com', password: '$2a$12$...', plan: 'free' }
];

const store = {
  users:   new Map(SEEDED_USERS.map(u => [u.id, { ...u, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])),
  reports: new Map(),
  columns: new Map(),
  logs:    [],
};

// ── Guest user singleton ──────────────────────────────────────────────────────
const GUEST_USER = {
  id:         'guest',
  name:       'Guest User',
  email:      'guest@datasheet.ai',
  password:   null,
  plan:       'guest',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
store.users.set('guest', GUEST_USER);

// ── User helpers ──────────────────────────────────────────────────────────────
function findUserByEmail(email) {
  for (const u of store.users.values()) {
    if (u.email === email) return u;
  }
  return null;
}

function findUserById(id) {
  return store.users.get(id) || null;
}

function createUser({ id, name, email, password }) {
  const user = {
    id, name, email, password, plan: 'free',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store.users.set(id, user);

  // Print to console so developer can copy into SEEDED_USERS for persistence
  console.log('\n📋 NEW USER REGISTERED — copy into SEEDED_USERS to persist:');
  console.log(JSON.stringify({ id, name, email, password, plan: 'free' }, null, 2));
  console.log('');

  return user;
}

function updateUser(id, fields) {
  const user = store.users.get(id);
  if (!user) return null;
  Object.assign(user, fields, { updated_at: new Date().toISOString() });
  return user;
}

function listUsers() {
  return [...store.users.values()].filter(u => u.id !== 'guest');
}

// ── Reports ───────────────────────────────────────────────────────────────────
function createReport(data) {
  const report = {
    ...data,
    status: 'queued',
    error_message: null,
    row_count: null, col_count: null,
    cat_column: null, num_column: null,
    processing_time_ms: null,
    input_path: null, output_path: null,
    pivot_data: null, stats_data: null, chart_data: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store.reports.set(data.id, report);
  return report;
}

function updateReport(id, fields) {
  const r = store.reports.get(id);
  if (!r) return null;
  Object.assign(r, fields, { updated_at: new Date().toISOString() });
  return r;
}

function getReport(id) { return store.reports.get(id) || null; }

function getReportsByUser(userId, { limit = 20, offset = 0 } = {}) {
  const all = [...store.reports.values()]
    .filter(r => r.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return { reports: all.slice(offset, offset + limit), total: all.length };
}

function deleteReport(id) {
  store.reports.delete(id);
  store.columns.delete(id);
}

// ── Columns ───────────────────────────────────────────────────────────────────
function saveColumns(reportId, cols) { store.columns.set(reportId, cols); }
function getColumns(reportId)        { return store.columns.get(reportId) || []; }

// ── Dashboard stats ───────────────────────────────────────────────────────────
function getDashboardStats(userId) {
  const userReports = [...store.reports.values()].filter(r => r.user_id === userId);
  const withTime    = userReports.filter(r => r.processing_time_ms);

  const stats = {
    totalReports:        userReports.length,
    totalRowsProcessed:  userReports.reduce((s, r) => s + (r.row_count || 0), 0),
    totalBytesUploaded:  userReports.reduce((s, r) => s + (r.original_size || 0), 0),
    avgProcessingMs:     withTime.length
      ? Math.round(withTime.reduce((s, r) => s + r.processing_time_ms, 0) / withTime.length) : 0,
    completed: userReports.filter(r => r.status === 'completed').length,
    failed:    userReports.filter(r => r.status === 'failed').length,
    pending:   userReports.filter(r => ['queued','processing'].includes(r.status)).length,
  };

  const monthMap = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    monthMap[key] = 0;
  }
  userReports.forEach(r => { const k = r.created_at.slice(0,7); if (k in monthMap) monthMap[k]++; });

  return {
    stats,
    recentReports: userReports
      .sort((a,b) => new Date(b.created_at)-new Date(a.created_at))
      .slice(0,5)
      .map(({ id, title, original_name, status, row_count, created_at }) =>
        ({ id, title, original_name, status, row_count, created_at })),
    monthlyActivity: Object.entries(monthMap).map(([month, count]) => ({ month, count })),
  };
}

function log(userId, action, meta = {}) {
  store.logs.push({ userId, action, meta, created_at: new Date().toISOString() });
}

module.exports = {
  findUserByEmail, findUserById, createUser, updateUser, listUsers,
  createReport, updateReport, getReport, getReportsByUser, deleteReport,
  saveColumns, getColumns, getDashboardStats, log,
};
