import { signup, login, logout, adminLogin } from '../controllers/authController.js';
import express from "express";


const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/admin', adminLogin);


export default router;