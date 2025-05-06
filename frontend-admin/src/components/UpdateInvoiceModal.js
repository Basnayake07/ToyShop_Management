'use client';
import React, { useState, useEffect } from "react";
import { Modal, Box, Button, TextField, Typography } from "@mui/material";
import axios from "axios";

const UpdateInvoiceModal = ({ isOpen, onClose, invoiceDetails }) => {
  console.log("Invoice Details in Modal:", invoiceDetails);
  const [receivedAmount, setReceivedAmount] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [change, setChange] = useState(0);


  // Initialize modal state when invoiceDetails changes
  useEffect(() => {
    if (invoiceDetails) {
      setReceivedAmount(invoiceDetails.invoice.received_amount || "");
      setCreditAmount(invoiceDetails.invoice.credit_amount || "");
      setChange(0); // Reset change when modal opens
    }
  }, [invoiceDetails]);

  // Dynamically calculate credit amount and change
  useEffect(() => {
    if (invoiceDetails) {
      const currentReceived = parseFloat(invoiceDetails.invoice.received_amount || 0); // 5000
      const currentCredit = parseFloat(invoiceDetails.invoice.credit_amount || 0);     // 4000
      const additionalPayment = parseFloat(receivedAmount || 0); // new input value ONLY
  
      let newCreditAmount = currentCredit - additionalPayment;
      let calculatedChange = 0;
  
      if (newCreditAmount < 0) {
        calculatedChange = Math.abs(newCreditAmount);
        newCreditAmount = 0;
      }
  
      setCreditAmount(newCreditAmount.toFixed(2));
      setChange(calculatedChange.toFixed(2));
    }
  }, [receivedAmount, invoiceDetails]);
  

  const handleUpdate = async () => {
    try {
      const additionalPayment = parseFloat(receivedAmount);

      // if (additionalPayment < 0) {
      //   alert("Received amount cannot be less than the current received amount.");
      //   return;
      // }

      console.log("Updating Invoice ID:", invoiceDetails.invoice.invoiceID);

      const response = await axios.put(
        `http://localhost:8081/api/invoices/${invoiceDetails.invoice.invoiceID}/update-payment`,
        { additionalPayment:parseFloat(additionalPayment.toFixed(2)) }
      );
      alert(response.data.message);
      onClose(); // Close the modal after updating
    } catch (error) {
      console.error("Error updating invoice:", error);
      alert(error.response?.data?.message || "Error updating invoice");
    }
  };

  if (!invoiceDetails?.invoice) return null;

  const { invoiceID, customerName, totalPrice, credit_amount } = invoiceDetails.invoice;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={{ ...modalStyle }}>
        <Typography variant="h6">Update Invoice</Typography>

        <Typography variant="body1">
          <strong>Invoice ID:</strong> {invoiceID}
        </Typography>
        <Typography variant="body1">
          <strong>Customer Name:</strong> {customerName}
        </Typography>
        <Typography variant="body1">
          <strong>Total Price:</strong> Rs. {totalPrice}
        </Typography>
        <Typography variant="body1">
          <strong>Credit Amount:</strong> Rs. {credit_amount} 
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
          label="Credit Amount"
          type="number"
          value={creditAmount}
          InputProps={{ readOnly: true }}
          fullWidth
          margin="normal"
        />

        <TextField
          label="Change to Return"
          type="number"
          value={change}
          InputProps={{ readOnly: true }}
          fullWidth
          margin="normal"
        />


        <Box sx={{ mt: 2 }}>
          <Button variant="contained" color="primary" onClick={handleUpdate}>
            Update Payment
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
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export default UpdateInvoiceModal;