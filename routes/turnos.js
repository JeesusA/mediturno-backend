const express = require('express');
const router = express.Router();
const Turno = require('../models/turno');
const { authenticate } = require('../middleware/auth'); 
const User = require('../models/user');

// Crear turno (solo pacientes autenticados)
router.post('/', authenticate, async (req, res) => {
  try {
    const user = req.user;
    console.log('USER en turno: ', user);
    if (user.role !== 'paciente') {
      return res.status(403).json({ error: 'Solo los pacientes pueden solicitar turnos.' });
    }
    const { especialidad, fecha, motivo, medicoId, medicoNombre, hora } = req.body;
    // Validaciones
    if (!especialidad || !fecha || !motivo || !medicoId || !medicoNombre || !hora) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }
    const turno = new Turno({
      pacienteId: user.id,
      pacienteNombre: user.name,
      medicoId,
      medicoNombre,
      especialidad,
      fecha,
      hora,
      motivo
    });
    await turno.save();
    console.log('Turno guardado: ', turno);
    res.status(201).json({ mensaje: 'Turno solicitado con éxito.' });
  } catch (err) {
    console.error('Error en POST /api/turnos:', err);
    res.status(500).json({ error: 'Error al solicitar turno.' });
  }
});

// PUT /api/turnos/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const user = req.user;
    const turnoId = req.params.id;
    const { especialidad, fecha, hora, motivo, medicoId, medicoNombre } = req.body;

    // Busca el turno
    const turno = await Turno.findById(turnoId);
    if (!turno) return res.status(404).json({ error: 'Turno no encontrado.' });

    // Solo el paciente que lo creó puede editarlo
    if (turno.pacienteId.toString() !== user.id) {
      return res.status(403).json({ error: 'No autorizado para editar este turno.' });
    }
    // Solo si está pendiente
    if (turno.estado !== 'pendiente') {
      return res.status(400).json({ error: 'Solo se pueden editar turnos pendientes.' });
    }
    // Solo si faltan más de 2 horas (puedes cambiarlo)
    const now = new Date();
    const turnoDate = new Date(`${turno.fecha}T${turno.hora}`);
    const diffMs = turnoDate.getTime() - now.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    if (diffHrs < 2) {
      return res.status(400).json({ error: 'No puedes editar turnos con menos de 2 horas de anticipación.' });
    }
    // Actualiza los campos permitidos
    turno.especialidad = especialidad;
    turno.fecha = fecha;
    turno.hora = hora;
    turno.motivo = motivo;
    turno.medicoId = medicoId;
    turno.medicoNombre = medicoNombre;
    await turno.save();
    res.json({ mensaje: 'Turno editado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al editar turno.' });
  }
});

// Ocultar turno terminado para paciente (no eliminar)
router.patch('/:id/ocultar_paciente', authenticate, async (req, res) => {
  try {
    const user = req.user;
    const turno = await Turno.findById(req.params.id);
    if (!turno) return res.status(404).json({ error: 'Turno no encontrado' });
    if (turno.pacienteId.toString() !== user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    // Solo permite ocultar turnos terminados
    if (turno.estado !== 'terminada')
      return res.status(400).json({ error: 'Solo puedes ocultar turnos terminados' });

    turno.ocultoPaciente = true;
    await turno.save();
    res.json({ mensaje: 'Turno ocultado del historial' });
  } catch (err) {
    res.status(500).json({ error: 'Error al ocultar turno' });
  }
});


// Listar turnos del día (solo médicos autenticados)
router.get('/', authenticate, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'medico') {
      return res.status(403).json({ error: 'Solo los médicos pueden ver la agenda.' });
    }
    const fecha = req.query.fecha;
    if (!fecha) return res.status(400).json({ error: 'Falta la fecha.' });
    const turnos = await Turno.find({ fecha });
    res.json(turnos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener turnos.' });
  }
});

// backend/routes/turnos.js
router.get('/paciente', authenticate, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'paciente') {
      return res.status(403).json({ error: 'Solo los pacientes pueden ver sus turnos.' });
    }
    const turnos = await Turno.find({ pacienteId: user.id });
    res.json(turnos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener turnos.' });
  }
});

// backend/routes/turnos.js
router.get('/medico', authenticate, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'medico') {
      return res.status(403).json({ error: 'Solo los médicos pueden ver su agenda.' });
    }
    const turnos = await Turno.find({ medicoId: user.id });
    res.json(turnos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener turnos del médico.' });
  }
});

// backend/routes/turnos.js
router.put('/:id/estado', authenticate, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'medico') {
      return res.status(403).json({ error: 'Solo médicos pueden actualizar estado.' });
    }
    const { estado } = req.body;
    if (!['pendiente', 'terminada'].includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido.' });
    }
    await Turno.findByIdAndUpdate(req.params.id, { estado });
    res.json({ mensaje: 'Estado actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el estado.' });
  }
});

module.exports = router;