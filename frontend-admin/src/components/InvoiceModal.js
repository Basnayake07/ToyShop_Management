'use client'
import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
//import jsPDF from "jspdf";
import { createInvoice } from "@/utils/invoiceUtils";
import axios from "axios";

const InvoiceModal = ({ isOpen, onClose, orderDetails }) => {

    
  const [receivedAmount, setReceivedAmount] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [discount, setDiscount] = useState("");
  const [change, setChange] = useState(0);


  const calculateTotal = () => {
    return (
      orderDetails?.items?.reduce((total, product) => {
        return total + product.quantity * product.price;
      }, 0) || 0
    );
  };


const downloadInvoice = (orderDetails, calculateTotal, receivedAmount, discount, creditAmount, change) => {
  const doc = new jsPDF();

  // Add invoice title
  doc.setFontSize(16);
  doc.text("Invoice", 20, 20);

  // Add customer details
  doc.setFontSize(12);
  doc.text(`Customer: ${orderDetails.order.customerName}`, 20, 30);
  doc.text(`Email: ${orderDetails.order.customerEmail}`, 20, 40);

  // Add table header
  doc.text("Product", 20, 50);
  doc.text("Quantity", 80, 50);
  doc.text("Unit Price", 140, 50);
  doc.text("Total", 200, 50);

  // Add table content
  let yPosition = 60;
  orderDetails.items.forEach((product) => {
    doc.text(product.productName, 20, yPosition);
    doc.text(`${product.quantity}`, 80, yPosition);
    doc.text(`Rs. ${parseFloat(product.price).toFixed(2)}`, 140, yPosition);
    doc.text(`Rs. ${(product.quantity * parseFloat(product.price)).toFixed(2)}`, 200, yPosition);
    yPosition += 10;
  });

  // Add totals
  doc.text(`Total: Rs. ${calculateTotal().toFixed(2)}`, 20, yPosition + 10);
  doc.text(`Amount Received: Rs. ${receivedAmount}`, 20, yPosition + 20);
  doc.text(`Discount: Rs. ${discount}`, 20, yPosition + 30);
  doc.text(`Credit: Rs. ${creditAmount}`, 20, yPosition + 40);
  doc.text(`Change: Rs. ${change.toFixed(2)}`, 20, yPosition + 50);

  // Save the PDF
  doc.save(`Invoice_${orderDetails.order.orderID}.pdf`);
};


  useEffect(() => {
    const totalCost = calculateTotal();
    const received = parseFloat(receivedAmount) || 0;
    const disc = parseFloat(discount) || 0;
  
    const remaining = totalCost - received - disc;
    const credit = remaining > 0 ? remaining : 0;
    const change = remaining < 0 ? Math.abs(remaining) : 0;
  
    setCreditAmount(credit.toFixed(2));
    setChange(change);
  }, [receivedAmount, discount, orderDetails]);


  useEffect(() => {
    console.log("Order Details in InvoiceModal:", orderDetails);
  }, [orderDetails]);


  /* if (!orderDetails) {
    console.error("Order details are missing in InvoiceModal");
    return null;
  } */

  useEffect(() => {
    if (!isOpen) {
      setReceivedAmount("");
      setCreditAmount("");
      setDiscount("");
      setChange(0);
    }
  }, [isOpen]);

  

  const handleFinalizeInvoice = () => {
    const invoiceData = {
      orderID: orderDetails.order.orderID,
      receivedAmount: parseFloat(receivedAmount) || 0,
      creditAmount: parseFloat(creditAmount) || 0,
      discount: parseFloat(discount) || 0,
    };

    createInvoice(
      invoiceData,
      orderDetails,
      calculateTotal,
      receivedAmount,
      discount,
      creditAmount,
      change,
      onClose, // Success callback
      (error) => console.error("Error in invoice creation:", error) // Error callback
    );
  };

  if (!orderDetails) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={{ ...modalStyle }}>
        <Typography variant="h6">Finalize Invoice</Typography>

        <Typography variant="body1">
          <strong>Customer:</strong> {orderDetails.order.customerName}
        </Typography>
        <Typography variant="body1">
          <strong>Email:</strong> {orderDetails.order.customerEmail}
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit Price</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orderDetails.items?.length > 0 ? (
              orderDetails.items.map((product) => (
                <TableRow key={product.productID}>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>Rs. {parseFloat(product.price).toFixed(2)}</TableCell>
                  <TableCell>
                    Rs. {(product.quantity * parseFloat(product.price)).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Typography variant="h6">
          Total: Rs. {calculateTotal().toFixed(2)}
        </Typography>

        <TextField
          label="Amount Received"
          type="number"
          value={receivedAmount}
          onChange={(e) => setReceivedAmount(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Discount"
          type="number"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Credit Amount"
          type="number"
          value={creditAmount}
          InputProps={{ readOnly: true }}
          fullWidth
          margin="normal"
        />

        <Typography variant="h6">Change: Rs. {change.toFixed(2)}</Typography>

        <Box sx={{ mt: 2 }}>
          <Button variant="contained" color="primary" onClick={handleFinalizeInvoice}>
            Save & Finalize
          </Button>
          <Button variant="outlined" onClick={onClose} sx={{ ml: 2 }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export default InvoiceModal;
