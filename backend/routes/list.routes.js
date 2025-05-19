import express from 'express';
import { crearLista,obtenerListasPorProyecto  } from '../controllers/list.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/projects/:id/listas', protect, crearLista); // POST /api/projects/:id/listas
router.get('/projects/:id/listas', protect, obtenerListasPorProyecto);
export default router;
