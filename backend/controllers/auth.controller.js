import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

//Registro de usuario
export const registerUser = async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
    }

    const existeUsuario = await User.findOne({ correo });
    if (existeUsuario) {
      return res.status(400).json({ msg: 'El correo ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const nuevoUsuario = new User({ nombre, correo, password: hash });
    await nuevoUsuario.save();

    res.status(201).json({ msg: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

//Login de usuario
export const loginUser = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
    }

    const usuario = await User.findOne({ correo });
    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    const passwordOk = await bcrypt.compare(password, usuario.password);
    if (!passwordOk) {
      return res.status(401).json({ msg: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: usuario._id },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      msg: 'Login exitoso',
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};
