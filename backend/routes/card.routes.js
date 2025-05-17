import express from 'express';
import { 
    crearTarjeta, 
    editarTarjeta, 
    asignarMiembros, 
    agregarChecklistItem, 
    actualizarChecklistItem, 
        eliminarChecklistItem } from '../controllers/card.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/listas/:id/tarjetas', protect, crearTarjeta); // POST /api/listas/:id/tarjetas
router.put('/cards/:id', protect, editarTarjeta);
router.put('/cards/:id/assign', protect, asignarMiembros);
router.patch('/cards/:id/checklist', protect, agregarChecklistItem);
router.patch('/cards/:cardId/checklist/:index', protect, actualizarChecklistItem);
router.delete('/cards/:cardId/checklist/:index', protect, eliminarChecklistItem);

export default router;

