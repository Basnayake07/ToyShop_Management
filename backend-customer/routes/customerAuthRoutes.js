import express from 'express';
import { loginCustomer, signupCustomer } from '../controllers/customerAuthController.js';

const router = express.Router();

// Route for customer login
router.post('/login', loginCustomer);

// Route for customer signup
router.post('/signup', signupCustomer);

export default router;