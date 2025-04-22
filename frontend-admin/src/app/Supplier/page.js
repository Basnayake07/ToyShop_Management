'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, IconButton, Table, TableHead, TableRow,
  TableCell, TableBody, Typography, Paper, Grid, Divider, Autocomplete
} from '@mui/material';
import { FaTrash, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import Sidebar from '@/components/Sidebar';

const SupplierForm = () => {
  const [supplier, setSupplier] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumbers: [''],
  });

  const [purchaseOrder, setPurchaseOrder] = useState({
    suppID: '',
    items: [{ productID: '', quantity: '', cost: '' }],
    total: 0,
    status: 'Pending',
  });

  const [suppliersList, setSuppliersList] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get('http://localhost:8081/api/suppliers');
      setSuppliersList(res.data || []);
      setSupplierOptions(
        res.data.map((supplier) => ({
          label: `${supplier.suppID} - ${supplier.name}`,
          suppID: supplier.suppID,
        }))
      );
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setSuppliersList([]);
    }
  };

  const handleSupplierChange = (e) => {
    const { name, value } = e.target;
    setSupplier((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (index, value) => {
    const updatedPhones = [...supplier.phoneNumbers];
    updatedPhones[index] = value;
    setSupplier((prev) => ({ ...prev, phoneNumbers: updatedPhones }));
  };

  const addPhoneNumber = () => {
    setSupplier((prev) => ({ ...prev, phoneNumbers: [...prev.phoneNumbers, ''] }));
  };

  const removePhoneNumber = (index) => {
    const updatedPhones = supplier.phoneNumbers.filter((_, i) => i !== index);
    setSupplier((prev) => ({ ...prev, phoneNumbers: updatedPhones }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...purchaseOrder.items];
    updatedItems[index][field] = value;

    const formattedItems = updatedItems.map((item) => ({
      ...item,
      quantity: item.quantity || '',
      cost: item.cost || '',
    }));

    setPurchaseOrder((prev) => ({ ...prev, items: formattedItems }));
    calculateTotal(formattedItems);
  };

  const addItem = () => {
    setPurchaseOrder((prev) => ({
      ...prev,
      items: [...prev.items, { productID: '', quantity: '', cost: '' }],
    }));
  };

  const removeItem = (index) => {
    const updatedItems = purchaseOrder.items.filter((_, i) => i !== index);
    setPurchaseOrder((prev) => ({ ...prev, items: updatedItems }));
    calculateTotal(updatedItems);
  };

 
  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const cost = parseFloat(item.cost) || 0;
      return sum + (quantity * cost);
    }, 0);
    setPurchaseOrder((prev) => ({ ...prev, total: total }));
  };

  const handleSaveSupplier = async () => {
    try {
      if (!supplier.name || !supplier.email || !supplier.password) {
        alert('Supplier Name, Email, and Password are required.');
        return;
      }
  
      const token = localStorage.getItem('token'); // Retrieve the token from localStorage
      if (!token) {
        alert('You are not authorized to perform this action.');
        return;
      }
  
      await axios.post(
        'http://localhost:8081/api/suppliers',
        supplier,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request
          },
        }
      );
  
      fetchSuppliers();
      alert('Supplier saved successfully!');
      setSupplier({ name: '', email: '', password: '', phoneNumbers: [''] });
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert(error.response?.data?.message || 'Failed to save supplier.');
    }
  };

  const handleSavePurchaseOrder = async () => {
    try {
      await axios.post('http://localhost:8081/api/purchase-orders', purchaseOrder);
      fetchSuppliers();
      alert('Purchase Order saved successfully!');
      setPurchaseOrder({ suppID: '', items: [{ productID: '', quantity: '', cost: '' }], total: 0, status: 'Pending' });
    } catch (error) {
      console.error('Error saving purchase order:', error);
      alert('Failed to save purchase order.');
    }
  };

  
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Grid container spacing={4}>
        {/* Supplier Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Supplier Details
            </Typography>
            <TextField label="Name" name="name" value={supplier.name} onChange={handleSupplierChange} fullWidth margin="normal" />
            <TextField label="Email" name="email" value={supplier.email} onChange={handleSupplierChange} fullWidth margin="normal" />
            <TextField label="Password" name="password" type="password" value={supplier.password} onChange={handleSupplierChange} fullWidth margin="normal" />
            <Typography variant="subtitle1" sx={{ mt: 2 }}>Phone Numbers</Typography>
            {supplier.phoneNumbers.map((phone, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TextField
                  label={`Phone ${index + 1}`}
                  value={phone}
                  onChange={(e) => handlePhoneChange(index, e.target.value)}
                  fullWidth
                />
                <IconButton onClick={() => removePhoneNumber(index)} disabled={supplier.phoneNumbers.length === 1}>
                  <FaTrash />
                </IconButton>
              </Box>
            ))}
            <Button onClick={addPhoneNumber} variant="outlined" sx={{ mb: 2 }}>
              + Add Phone Number
            </Button>

            <Button variant="contained" color="primary" fullWidth onClick={handleSaveSupplier}>
              Save Supplier
            </Button>
          </Paper>



          {/* Purchase Order Form */}
          <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Purchase Order
      </Typography>

      {/* Searchable Supplier ID Field */}
      <Autocomplete
        options={supplierOptions}
        getOptionLabel={(option) => option.label}
        onChange={(event, newValue) => {
          setPurchaseOrder((prev) => ({
            ...prev,
            suppID: newValue ? newValue.suppID : "",
          }));
        }}
        renderInput={(params) => (
          <TextField {...params} label="Search Supplier ID or Name" fullWidth margin="normal" />
        )}
      />

      {purchaseOrder.items.map((item, index) => (
        <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
          <Grid item xs={4}>
            <TextField
              label="Product ID"
              value={item.productID}
              onChange={(e) => handleItemChange(index, "productID", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Quantity"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Cost"
              value={item.cost}
              onChange={(e) => handleItemChange(index, "cost", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={2}>
            <IconButton onClick={() => removeItem(index)}>
              <FaTrash />
            </IconButton>
          </Grid>
        </Grid>
      ))}

      <Button onClick={addItem} variant="outlined" startIcon={<FaPlus />} sx={{ mb: 2 }}>
        Add Product
      </Button>

      <Typography variant="h6">Total Amount: Rs. {purchaseOrder.total.toFixed(2)}</Typography>
      <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleSavePurchaseOrder}>
        Save Purchase Order
      </Button>
    </Paper>
  
        </Grid>

        {/* Supplier Table */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Supplier List
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Supplier ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone Numbers</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {suppliersList.map((sup) => (
                  <TableRow key={sup.suppID} >
                    <TableCell>{sup.suppID}</TableCell>
                    <TableCell>{sup.name}</TableCell>
                    <TableCell>{sup.email}</TableCell>
                    <TableCell>{sup.phoneNumbers}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>

  
    </Box>
  );
};

export default SupplierForm;
