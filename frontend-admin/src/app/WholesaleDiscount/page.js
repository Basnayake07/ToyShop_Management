'use client';

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  MenuItem,
  Snackbar,
  Alert
} from "@mui/material";
import { Edit, Delete, Toll } from "@mui/icons-material";
import Sidebar from "@/components/Sidebar";
import axios from "axios";

const WholesaleDiscount = () => {
  const [discounts, setDiscounts] = useState([]);
  const [form, setForm] = useState({
    productID: "",
    discountQuantity: "",
    discount_percent: "",
    start_date: "",
    end_date: ""
  });
  const [editId, setEditId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Fetch all discounts
// Fetch all discounts
  const fetchDiscounts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8081/api/discounts/all", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      setDiscounts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setDiscounts([]);
      setSnackbar({ open: true, message: "Failed to fetch discounts", severity: "error" });
    }
  };


  useEffect(() => {
    fetchDiscounts();
  }, []);



 // Handle form input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle add or update
  const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  console.log("token", token);
  try {
    if (editId) {
      // Update discount (admin only)
      await axios.put(
        `http://localhost:8081/api/discounts/${editId}`,
        form,
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );
      setSnackbar({ open: true, message: "Discount updated!", severity: "success" });
    } else {
      // Add new discount (admin only)
      await axios.post(
        "http://localhost:8081/api/discounts",
        form,
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );
      setSnackbar({ open: true, message: "Discount added!", severity: "success" });
    }
    setForm({ productID: "", discountQuantity: "", discount_percent: "", start_date: "", end_date: "" });
    setEditId(null);
    setOpenDialog(false);
    fetchDiscounts();
  } catch (err) {
    setSnackbar({ open: true, message: "Failed to save discount", severity: "error" });
  }

  };



  // Handle edit
  const handleEdit = (discount) => {
    setForm({
      productID: discount.productID,
      discountQuantity: discount.discountQuantity,
      discount_percent: discount.discount_percent,
      start_date: discount.start_date ? discount.start_date.slice(0, 10) : "",
      end_date: discount.end_date ? discount.end_date.slice(0, 10) : ""
    });
    setEditId(discount.id);
    setOpenDialog(true);
  };

  // Handle delete
const handleDelete = async (id) => {
  const token = localStorage.getItem("token");
  if (!window.confirm("Are you sure you want to delete this discount?")) return;
  try {
    await axios.delete(`http://localhost:8081/api/discounts/${id}`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
    setSnackbar({ open: true, message: "Discount deleted!", severity: "success" });
    fetchDiscounts();
  } catch (err) {
    setSnackbar({ open: true, message: "Failed to delete discount", severity: "error" });
  }
};
  // Open add dialog
  const handleOpenAdd = () => {
    setForm({ productID: "", discountQuantity: "", discount_percent: "", start_date: "", end_date: "" });
    setEditId(null);
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditId(null);
  };
  return (
    <Box sx={{ display: 'flex' }}>
    <Sidebar /> 
      <Box sx={{ flexGrow: 1, p: 3 }}>
      <h2>Wholesale Discounts</h2>
      <Button variant="contained" color="primary" onClick={handleOpenAdd} sx={{ mb: 2 }}>
        Add New Discount
      </Button>

      {/* Discount Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product ID</TableCell>
              <TableCell>Discount Quantity</TableCell>
              <TableCell>Discount (%)</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {discounts.map((discount) => (
              <TableRow key={discount.id}>
                <TableCell>{discount.productID}</TableCell>
                <TableCell>{discount.discountQuantity}</TableCell>
                <TableCell>{discount.discount_percent}</TableCell>
                <TableCell>{discount.start_date ? discount.start_date.slice(0, 10) : "-"}</TableCell>
                <TableCell>{discount.end_date ? discount.end_date.slice(0, 10) : "-"}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleEdit(discount)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(discount.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {discounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No discounts available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editId ? "Update Discount" : "Add New Discount"}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ minWidth: 350 }}>
            <TextField
              label="Product ID"
              name="productID"
              value={form.productID}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Discount Quantity"
              name="discountQuantity"
              type="number"
              value={form.discountQuantity}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Discount Percent"
              name="discount_percent"
              type="number"
              value={form.discount_percent}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              inputProps={{ min: 0, max: 100, step: 0.01 }}
            />
            <TextField
              label="Start Date"
              name="start_date"
              type="date"
              value={form.start_date}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              name="end_date"
              type="date"
              value={form.end_date}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editId ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
    </Box>
  );
};

export default WholesaleDiscount;