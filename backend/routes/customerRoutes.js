import express from 'express';
import { getAllCustomers, registerCustomerByAdmin, deleteCustomer } from '../controllers/customerController.js';

const router = express.Router();

router.get('/', getAllCustomers);
router.post('/register', registerCustomerByAdmin);
router.delete('/delete', deleteCustomer);

export default router;