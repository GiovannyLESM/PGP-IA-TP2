import express from 'express';
import { crearProyecto, obtenerProyectos,obtenerProyectoPorId,editarProyecto,eliminarProyecto } from '../controllers/project.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, crearProyecto);
router.get('/', protect, obtenerProyectos);
router.get('/:id', protect, obtenerProyectoPorId);
router.put('/:id', protect, editarProyecto);
router.delete('/:id', protect, eliminarProyecto);
export default router;
