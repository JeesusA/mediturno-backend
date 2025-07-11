const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ['paciente', 'medico'], required: true }
});

// Hashea la contraseña antes de guardar el usuario
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
  } catch (err) {
    next(err);
  }
});

// Métodos de instancia
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
