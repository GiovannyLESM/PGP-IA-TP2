import { User } from '../models/User.js';
import { Invitacion } from '../models/Invitaciones.js';
import { Project } from '../models/Project.js';
import mongoose from 'mongoose';
export const actualizarAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({ msg: 'El avatar es requerido' });
    }

    const usuario = await User.findById(req.user._id);
    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    usuario.avatar = avatar;
    const actualizado = await usuario.save();

    res.status(200).json({
      msg: 'Avatar actualizado correctamente',
      usuario: {
        id: actualizado._id,
        nombre: actualizado.nombre,
        correo: actualizado.correo,
        avatar: actualizado.avatar,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al actualizar el avatar' });
  }
};

export const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await User.findById(req.user._id).select('-password');
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener perfil' });
  }
};

export const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, apellido } = req.body;

    const usuario = await User.findById(req.user._id);
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

    usuario.nombre = nombre || usuario.nombre;
    usuario.apellido = apellido || usuario.apellido;

    const actualizado = await usuario.save();

    res.json({
      msg: 'Perfil actualizado correctamente',
      usuario: {
        id: actualizado._id,
        nombre: actualizado.nombre,
        apellido: actualizado.apellido,
        correo: actualizado.correo,
        avatar: actualizado.avatar,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al actualizar perfil' });
  }
};

import bcrypt from 'bcryptjs';


export const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, nuevaPassword } = req.body;

    if (!passwordActual || !nuevaPassword) {
      return res.status(400).json({ msg: 'Ambas contraseñas son obligatorias' });
    }

    const usuario = await User.findById(req.user._id);
    const passwordValido = await bcrypt.compare(passwordActual, usuario.password);

    if (!passwordValido) {
      return res.status(401).json({ msg: 'Contraseña actual incorrecta' });
    }

    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(nuevaPassword, salt);
    await usuario.save();

    res.json({ msg: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al cambiar contraseña' });
  }
};

// GET /api/usuarios/buscar?correo=correo@ejemplo.com
export const buscarUsuarioPorCorreo = async (req, res) => {
  const { correo } = req.query;
  if (!correo) return res.status(400).json({ msg: 'El correo es requerido' });

  try {
    const usuario = await User.findOne({ correo: correo.toLowerCase().trim() }).select('-password');
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

    res.json({
      id: usuario._id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      avatar: usuario.avatar,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

export const obtenerInvitacionesPendientes = async (req, res) => {
  const usuarioId = req.user._id;

  try {
    const invitaciones = await Invitacion.find({ usuarioInvitado: usuarioId, estado: 'pendiente' })
      .populate('proyecto', 'nombre descripcion')
      .populate('usuarioInvitador', 'nombre correo avatar');

    res.json(invitaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener invitaciones' });
  }
};

export const aceptarInvitacion = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(String(req.user._id));
    const { id } = req.params; // id de la invitación

    // Busca la invitación
    const invitacion = await Invitacion.findById(id);
    if (!invitacion) return res.status(404).json({ msg: 'Invitación no encontrada' });

    // Busca el proyecto
    const proyecto = await Project.findById(invitacion.proyecto);
    if (!proyecto) return res.status(404).json({ msg: 'Proyecto no encontrado' });
    
    // Verifica si ya es miembro
    const yaEsMiembro = proyecto.miembros.some(
      (m) => m.usuario && m.usuario.equals(userId)
    );
    if (yaEsMiembro) return res.status(400).json({ msg: 'Ya eres miembro' });

    // Agrega correctamente el miembro
    proyecto.miembros.push({
      usuario: userId,
      rol: 'colaborador',
    });
    await proyecto.save();

    // Marca la invitación como aceptada o elimínala
    invitacion.estado = 'aceptada';
    await invitacion.save();

    res.status(200).json({ msg: 'Ahora eres miembro del proyecto' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al aceptar invitación' });
  }
};


export const rechazarInvitacion = async (req, res) => {
  const invitacionId = req.params.id;
  const usuarioId = req.user._id;

  try {
    const invitacion = await Invitacion.findById(invitacionId);
    if (!invitacion) return res.status(404).json({ msg: 'Invitación no encontrada' });
    if (invitacion.estado !== 'pendiente') return res.status(400).json({ msg: 'Invitación ya procesada' });
    if (String(invitacion.usuarioInvitado) !== String(usuarioId)) {
      return res.status(403).json({ msg: 'No autorizado para rechazar esta invitación' });
    }

    invitacion.estado = 'rechazada';
    await invitacion.save();

    res.json({ msg: 'Invitación rechazada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al rechazar invitación' });
  }
};
