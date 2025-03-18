 import express from 'express';
 import { addInventory } from '../controllers/inventoryController.js';

 const router = express.Router();

 router.post('/inventory', addInventory);

 export default router;