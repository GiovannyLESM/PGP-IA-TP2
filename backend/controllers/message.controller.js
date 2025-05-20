import { Message } from '../models/Message.js';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';

export const guardarMensaje = async (req, res) => {
  try {
    const { contenido, proyectoId } = req.body;

    if (!contenido || !proyectoId) {
      return res.status(400).json({ msg: 'Contenido y proyectoId son obligatorios' });
    }

    const proyecto = await Project.findById(proyectoId);
    if (!proyecto) {
      return res.status(404).json({ msg: 'Proyecto no encontrado' });
    }

    const esMiembro = proyecto.miembros.some(
      (m) => m.usuario.toString() === req.user._id.toString()
    );
    if (!esMiembro) {
      return res.status(403).json({ msg: 'No tienes acceso a este chat' });
    }

    const mensaje = new Message({
      contenido,
      proyectoId,
      usuario: req.user._id,
    });

    const guardado = await mensaje.save();

    res.status(201).json(guardado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al guardar mensaje' });
  }
};


export const obtenerMensajesPorProyecto = async (req, res) => {
  try {
    const { proyectoId } = req.params;

    const proyecto = await Project.findById(proyectoId);
    if (!proyecto) {
      return res.status(404).json({ msg: 'Proyecto no encontrado' });
    }

    const esMiembro = proyecto.miembros.some(
      (m) => m.usuario.toString() === req.user._id.toString()
    );
    if (!esMiembro) {
      return res.status(403).json({ msg: 'No tienes acceso a este chat' });
    }

    const mensajes = await Message.find({ proyectoId })
      .populate('usuario', 'nombre avatar')
      .sort({ createdAt: 1 });

    res.status(200).json(mensajes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener mensajes' });
  }
};
