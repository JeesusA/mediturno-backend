// routes/auth.js – Endpoints de registro y login

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { findByEmail, create } = require('../models/user');
const user = require('../models/user');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const db = req.app.locals.db;
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  if (await findByEmail(db, email)) {
    return res.status(409).json({ error: 'Usuario ya existe' });
  }
  await create(db, { name, email, password, role });
  res.status(201).json({ message: 'Usuario registrado' });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const db = req.app.locals.db;
  const { email, password } = req.body;
  const user = await findByEmail(db, email);
  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  const token = jwt.sign(
    { sub: user._id, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// Obtener lista de médicos registrados (driver nativo)
router.get('/medicos', async (req, res) => {
  const db = req.app.locals.db;
  try {
    const medicos = await db.collection('users').find({ role: 'medico' }).toArray();
    res.json(medicos.map(m => ({ id: m._id, name: m.name })));
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener médicos' });
  }
});

module.exports = router;
