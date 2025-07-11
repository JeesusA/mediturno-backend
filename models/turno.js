// backend/models/turno.js
const mongoose = require('mongoose');
const turnoSchema = new mongoose.Schema({
  pacienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pacienteNombre: { type: String, required: true },
  medicoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicoNombre: { type: String, required: true },
  especialidad: { type: String, required: true },
  fecha: { type: String, required: true }, // formato YYYY-MM-DD
  hora: { type: String, required: true },  // formato HH:mm
  motivo: { type: String, required: true },
  estado: { type: String, default: 'pendiente' }, // pendiente, terminada
  ocultoPaciente: { type: Boolean, default: false }
});

module.exports = mongoose.model('Turno', turnoSchema);
