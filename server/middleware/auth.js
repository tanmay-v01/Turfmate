const jwtService = require('../services/jwtService');
const usersRepo = require('../repositories/users');

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const payload = jwtService.verify(token);
    req.auth = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

async function loadUser(req, res, next) {
  try {
    const user = await usersRepo.findById(req.auth.sub);
    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ error: 'User not found or suspended' });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { authRequired, loadUser };
