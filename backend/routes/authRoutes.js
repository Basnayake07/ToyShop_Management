import express from 'express';
import {registerEmp, loginAdmin, getAllUsers, deleteEmployees, updateEmployee} from '../controllers/authController.js';

const router = express.Router();
// Register route
router.post('/register', registerEmp);

router.post('/login', loginAdmin);
router.get('/users', getAllUsers);
router.delete('/delete', deleteEmployees);
router.put('/update', updateEmployee);



export default router;