import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';

export const registerUser = async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;

    // Validaciones básicas
    if (!nombre || !correo || !password) {
      return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
    }

    // Verificar si ya existe
    const existeUsuario = await User.findOne({ correo });
    if (existeUsuario) {
      return res.status(400).json({ msg: 'El correo ya está registrado' });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Crear usuario
    const nuevoUsuario = new User({ nombre, correo, password: hash });
    await nuevoUsuario.save();

    res.status(201).json({ msg: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};
