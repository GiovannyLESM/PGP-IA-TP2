import express from 'express';
import { crearLista } from '../controllers/list.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/projects/:id/listas', protect, crearLista); // POST /api/projects/:id/listas

export default router;
