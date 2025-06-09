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
import planificacionRoutes from './routes/planificacion.routes.js';

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
app.use('/api', planificacionRoutes);

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
const usuariosPorProyecto = {};

io.on('connection', (socket) => {
  console.log('📡 Cliente conectado:', socket.id);

  socket.on('joinRoom', ({ proyectoId, userId }) => {
    socket.join(proyectoId);
    socket.userId = userId;
    socket.proyectoId = proyectoId;

    if (!usuariosPorProyecto[proyectoId]) usuariosPorProyecto[proyectoId] = new Set();
    usuariosPorProyecto[proyectoId].add(userId);

    io.to(proyectoId).emit('usuarios:conectados', Array.from(usuariosPorProyecto[proyectoId]));

    console.log(`🛋️ Usuario ${userId} unido a sala del proyecto ${proyectoId}`);
  });

  // Evento para recibir mensajes nuevos
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

  // NUEVO: Evento cuando un usuario está escribiendo
  socket.on('typing', ({ proyectoId, userId }) => {
    if (proyectoId) {
      socket.to(proyectoId).emit('usuario:escribiendo', { userId });
    }
  });

  // NUEVO: Evento cuando un usuario deja de escribir
  socket.on('stopTyping', ({ proyectoId, userId }) => {
    if (proyectoId) {
      socket.to(proyectoId).emit('usuario:dejoDeEscribir', { userId });
    }
  });

  socket.on('disconnect', () => {
    const { proyectoId, userId } = socket;
    if (proyectoId && userId && usuariosPorProyecto[proyectoId]) {
      usuariosPorProyecto[proyectoId].delete(userId);
      io.to(proyectoId).emit('usuarios:conectados', Array.from(usuariosPorProyecto[proyectoId]));
    }
    console.log('❌ Cliente desconectado:', socket.id);
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
