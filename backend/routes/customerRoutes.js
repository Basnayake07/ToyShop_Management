import express from 'express';
import { getAllCustomers, registerCustomerByAdmin } from '../controllers/customerController.js';

const router = express.Router();

router.get('/', getAllCustomers);
router.post('/register', registerCustomerByAdmin);

export default router;