import { User } from '../models/User.js';

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

