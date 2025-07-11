const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Importa el modelo Mongoose

const router = express.Router();

// REGISTRO
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(409).json({ error: 'Usuario ya existe' });
    }
    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json({ message: 'Usuario registrado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

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
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Obtener lista de médicos
router.get('/medicos', async (req, res) => {
  try {
    const medicos = await User.find({ role: 'medico' });
    res.json(medicos.map(m => ({ id: m._id, name: m.name })));
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener médicos' });
  }
});

module.exports = router;
