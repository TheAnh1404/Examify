export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Please log in first.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden. Access restricted to roles: [${allowedRoles.join(', ')}]. Your role: ${req.user.role}` 
      });
    }

    next();
  };
};
