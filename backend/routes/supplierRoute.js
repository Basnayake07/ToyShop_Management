import express from "express";
import { supplierController } from "../controllers/supplierController.js";

const router = express.Router();

// Route to create a new supplier
router.post("/suppliers", supplierController.createSupplier);

// Route to get all suppliers
router.get("/suppliers", supplierController.getAllSuppliers);

// Route to create a new purchase order
router.post("/purchase-orders", supplierController.createPurchaseOrder);

// Route to get all purchase orders for the table
router.get("/purchase-orders", supplierController.getAllPurchaseOrders);

// Route to get detailed purchase order information
router.get("/purchase-orders/details/:purchaseID", supplierController.getPurchaseOrderDetails);

export default router;