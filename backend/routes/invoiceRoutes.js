import express from "express";
import { invoiceController } from "../controllers/invoiceController.js";

const router = express.Router();

// Create a new invoice
router.post("/", invoiceController.createInvoice);

// Fetch invoice details by invoice ID
router.get("/:invoiceID", invoiceController.getInvoiceDetails);

export default router;