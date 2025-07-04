import express from "express";
import { invoiceController } from "../controllers/invoiceController.js";

const router = express.Router();

// Create a new invoice
router.post("/", invoiceController.createInvoice);

// Fetch all invoices
router.get("/", invoiceController.getAllInvoices);

// Fetch invoice details by invoice ID
router.get("/:invoiceID", invoiceController.getInvoiceDetails);

// Update invoice payment status
router.put("/:invoiceID/update-payment", invoiceController.updateInvoicePayment);
export default router;
