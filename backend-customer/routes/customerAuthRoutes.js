import express from 'express';
import { signupCustomer, verifyOtpAndRegisterCustomer, loginCustomer } from '../controllers/customerAuthController.js';

const router = express.Router();

// Route for customer signup (send OTP)
router.post('/signup', signupCustomer);

// Route for verifying OTP and completing registration
router.post('/verify-otp', verifyOtpAndRegisterCustomer);

// Route for customer login
router.post('/login', loginCustomer);

export default router;