import express from 'express';
import { crearTarjeta } from '../controllers/card.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/listas/:id/tarjetas', protect, crearTarjeta); // POST /api/listas/:id/tarjetas

export default router;
