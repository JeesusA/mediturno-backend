// server.js – Arranque del servidor y montaje de rutas

require('dotenv').config();               // Carga variables de entorno desde .env
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const turnoRoutes = require('./routes/turnos');

(async () => {
  // Conexión a MongoDB Atlas
  const db = await connectDB();
  
  const app = express();
  app.use(cors({
    origin: [
      'http://localhost:5173',
      'https://mediturno-frontend.vercel.app',
    ],
    credentials: true
  }));

  app.use(express.json());                              // Parseo de JSON en el body
  app.locals.db = db;                                   

  // Rutas de autenticación
  app.use('/api/auth', authRoutes);
  app.use('/api/turnos', turnoRoutes)

  // Inicia el servidor
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🔊 Backend escuchando en puerto ${PORT}`);
  });
})();
