import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import {Server} from 'socket.io'

import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import listRoutes from './routes/list.routes.js';
import cardRoutes from './routes/card.routes.js';
import messageRoutes from './routes/message.routes.js';
import userRoutes from './routes/user.routes.js';

import { Message } from './models/Message.js';
import { Project } from './models/Project.js';
import { User } from './models/User.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', listRoutes);
app.use('/api', cardRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
// Conectar a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch((err) => console.error('❌ Error de conexión:', err));

// Ruta básica
app.get('/', (req, res) => {
  res.send('API funcionando 🎉');
});

// Servidor HTTP + Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// WebSocket - lógica del chat
io.on('connection', (socket) => {
  console.log('📡 Cliente conectado:', socket.id);

  socket.on('joinRoom', (proyectoId) => {
    socket.join(proyectoId);
    console.log(`🛋️ Usuario unido a sala del proyecto ${proyectoId}`);
  });

  socket.on('chat:mensaje', async ({ proyectoId, contenido, usuarioId }) => {
    try {
      const proyecto = await Project.findById(proyectoId);
      if (!proyecto) return;

      const esMiembro = proyecto.miembros.some(
        (m) => m.usuario.toString() === usuarioId
      );
      if (!esMiembro) return;

      const nuevoMensaje = new Message({
        contenido,
        proyectoId,
        usuario: usuarioId,
      });

      const guardado = await nuevoMensaje.save();

      const usuario = await User.findById(usuarioId);

      io.to(proyectoId).emit('chat:nuevoMensaje', {
        _id: guardado._id,
        contenido: guardado.contenido,
        createdAt: guardado.createdAt,
        usuario: {
          _id: usuario._id,
          nombre: usuario.nombre,
          avatar: usuario.avatar || '',
        },
      });
    } catch (error) {
      console.error('❌ Error al guardar mensaje por socket:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado:', socket.id);
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
