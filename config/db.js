// config/db.js – Conexión a MongoDB con Mongoose

const mongoose = require('mongoose');

module.exports = async function connectDB() {
  const uri = process.env.MONGODB_URI + '/' + process.env.DB_NAME;
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('✅ Conectado a MongoDB');
  return mongoose.connection;
};
