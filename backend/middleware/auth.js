const jwt  = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user    = await User.findById(payload.sub).lean();
    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = {
      id:    user._id.toString(),
      name:  user.name,
      email: user.email,
      plan:  user.plan,
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
