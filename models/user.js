// models/user.js – Operaciones sobre la colección “users”

const bcrypt = require('bcrypt');

module.exports = {
  // Busca un usuario por email
  findByEmail: (db, email) =>
    db.collection('users').findOne({ email }),

  // Crea un usuario nuevo, guardando la contraseña hasheada
  create: async (db, { name, email, password, role }) => {
    const hash = await bcrypt.hash(password, 10);
    const result = await db.collection('users').insertOne({
      name,
      email,
      password: hash,
      role
    });
    return result;
  }
};
