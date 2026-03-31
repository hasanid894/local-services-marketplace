function attachDemoUser(req, res, next) {
  const roleHeader = String(req.header('x-user-role') || 'customer').toLowerCase();
  const idHeader = Number(req.header('x-user-id') || 0);

  const allowedRoles = ['customer', 'provider', 'admin'];
  const role = allowedRoles.includes(roleHeader) ? roleHeader : 'customer';

  req.user = {
    id: Number.isFinite(idHeader) ? idHeader : 0,
    role
  };

  next();
}

function requireRole(...roles) {
  const normalized = roles.map(r => String(r).toLowerCase());
  return (req, res, next) => {
    const currentRole = req.user?.role || 'customer';
    if (!normalized.includes(currentRole)) {
      return res.status(403).json({ error: 'Forbidden for current role.' });
    }
    next();
  };
}

module.exports = {
  attachDemoUser,
  requireRole
};
