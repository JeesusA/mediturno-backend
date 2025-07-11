// middleware/auth.js – Verificación de JWT y autorización por rol

const jwt = require('jsonwebtoken');

// Middleware para autorización por rol (opcional, si lo usas)
exports.authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
        return res.status(403).json({ error: 'Acceso prohibido' });
      }
      req.user = { id: payload.id, name: payload.name, role: payload.role };
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
  };
};

// Middleware para autenticación simple
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No autorizado.' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, name: payload.name, role: payload.role };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido.' });
  }
};
