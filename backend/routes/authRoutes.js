import express from 'express';
import {registerEmp, loginUser, getAllUsers, deleteEmployees, updateEmployee} from '../controllers/authController.js';
import { verifyAdmin } from '../middleware/authAdmin.js';

const router = express.Router();
// Register route
router.post('/register', verifyAdmin, registerEmp);

router.post('/login', loginUser);
router.get('/users', getAllUsers);
router.delete('/delete', verifyAdmin, deleteEmployees);
router.put('/update', verifyAdmin, updateEmployee);



export default router;