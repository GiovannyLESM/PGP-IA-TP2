import express from 'express';
import { registerUser } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', registerUser);

export default router;
router.get('/', (req, res) => {
    res.send('Auth route OK');
  });