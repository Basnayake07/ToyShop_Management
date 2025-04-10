'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, IconButton, Table, TableHead, TableRow,
  TableCell, TableBody, Modal, Typography, Paper, Grid, Divider
} from '@mui/material';
import { FaTrash, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import Sidebar from '@/components/Sidebar';

const SupplierForm = () => {
  const [supplier, setSupplier] = useState({
    suppID: '',
    name: '',
    email: '',
    phoneNumbers: [''],
  });

  const [purchaseOrder, setPurchaseOrder] = useState({
    suppID: '',
    items: [{ productID: '', quantity: '', cost: '' }],
    total: 0,
    status: 'Pending',
  });

  const [suppliersList, setSuppliersList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get('http://localhost:8081/api/suppliers');
      setSuppliersList(res.data || []);
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

  const handleStatusChange = (e) => {
    const { value } = e.target;
    setPurchaseOrder((prev) => ({ ...prev, status: value }));
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
      if (!supplier.suppID || !supplier.name || !supplier.email) {
        alert('Supplier ID, Name, and Email are required.');
        return;
      }

      await axios.post('http://localhost:8081/api/suppliers', supplier);
      fetchSuppliers();
      alert('Supplier saved successfully!');
      setSupplier({ suppID: '', name: '', email: '', phoneNumbers: [''] });
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Failed to save supplier.');
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

  const handleRowClick = async (supplierID) => {
    try {
      const res = await axios.get(`http://localhost:8081/api/purchase-orders/${supplierID}`);
      setSelectedOrder(res.data);
      setOpenModal(true);
    } catch (err) {
      console.error('Error loading order details:', err);
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
            <TextField label="Supplier ID" name="suppID" value={supplier.suppID} onChange={handleSupplierChange} fullWidth margin="normal" />
            <TextField label="Name" name="name" value={supplier.name} onChange={handleSupplierChange} fullWidth margin="normal" />
            <TextField label="Email" name="email" value={supplier.email} onChange={handleSupplierChange} fullWidth margin="normal" />

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
            <TextField
              label="Supplier ID or Name"
              value={purchaseOrder.supplierID}
              onChange={(e) => setPurchaseOrder({ ...purchaseOrder, suppID: e.target.value })}
              fullWidth
              margin="normal"
            />
            {purchaseOrder.items.map((item, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
                <Grid item xs={4}>
                  <TextField label="Product ID" value={item.productID} onChange={(e) => handleItemChange(index, 'productID', e.target.value)} fullWidth />
                </Grid>
                <Grid item xs={3}>
                  <TextField label="Quantity" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} fullWidth />
                </Grid>
                <Grid item xs={3}>
                  <TextField label="Cost" value={item.cost} onChange={(e) => handleItemChange(index, 'cost', e.target.value)} fullWidth />
                </Grid>
                <Grid item xs={2}>
                  <IconButton onClick={() => removeItem(index)}><FaTrash /></IconButton>
                </Grid>
              </Grid>
            ))}
            <Button onClick={addItem} variant="outlined" startIcon={<FaPlus />} sx={{ mb: 2 }}>
              Add Product
            </Button>
            <TextField
              label="Status"
              value={purchaseOrder.status}
              onChange={handleStatusChange}
              fullWidth
              margin="normal"
              select
              SelectProps={{ native: true }}
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
            </TextField>
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
                </TableRow>
              </TableHead>
              <TableBody>
                {suppliersList.map((sup) => (
                  <TableRow key={sup.suppID} onClick={() => handleRowClick(sup.suppID)} style={{ cursor: 'pointer' }}>
                    <TableCell>{sup.suppID}</TableCell>
                    <TableCell>{sup.name}</TableCell>
                    <TableCell>{sup.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>

      {/* Purchase Order Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={{ p: 4, backgroundColor: 'white', maxWidth: 600, margin: '100px auto', borderRadius: 2, boxShadow: 3 }}>
          {selectedOrder ? (
            <>
              <Typography variant="h6" gutterBottom>
                Purchase Order Details
              </Typography>
              {selectedOrder.map((order, idx) => (
                <Box key={idx} sx={{ my: 2 }}>
                  <Typography>Order ID: {order.purchaseID}</Typography>
                  <Typography>Order Date: {order.purchaseDate}</Typography>
                  <Typography>Status: {order.status}</Typography>
                  <Divider sx={{ my: 1 }} />
                  {order.items.map((item, itemIdx) => (
                    <Box key={itemIdx} sx={{ my: 1 }}>
                      <Typography>Product ID: {item.productID}</Typography>
                      <Typography>Quantity: {item.quantity}</Typography>
                      <Typography>Cost: Rs. {item.cost}</Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1">Total: Rs. {order.total}</Typography>
                </Box>
              ))}
            </>
          ) : (
            <Typography>Loading...</Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default SupplierForm;
