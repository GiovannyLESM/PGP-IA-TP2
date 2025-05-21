import express from 'express';
import { actualizarAvatar,
  obtenerPerfil,
  actualizarPerfil,
  cambiarPassword, } from '../controllers/user.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, obtenerPerfil);
router.patch('/avatar', protect, actualizarAvatar);
router.patch('/profile', protect, actualizarPerfil);
router.patch('/password', protect, cambiarPassword);


export default router;
