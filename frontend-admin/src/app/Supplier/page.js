'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, IconButton, Table, TableHead, TableRow,
  TableCell, TableBody, Typography, Paper, Grid, Tabs, Tab, Autocomplete
} from '@mui/material';
import { FaTrash, FaPlus, FaUserPlus, FaShoppingCart, FaUsers } from 'react-icons/fa';
import axios from 'axios';
import Sidebar from '@/components/Sidebar';
import '@/styles/SupplierManagement.css';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`supplier-tabpanel-${index}`}
      aria-labelledby={`supplier-tab-${index}`}
      {...other}
      className="tab-panel"
    >
      {value === index && (
        <Box className="tab-content">
          {children}
        </Box>
      )}
    </div>
  );
};

const SupplierManagement = () => {
  const [tabValue, setTabValue] = useState(0);
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
  
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You are not authorized to perform this action.');
        return;
      }
  
      await axios.post(
        'http://localhost:8081/api/suppliers',
        supplier,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      fetchSuppliers();
      alert('Supplier saved successfully!');
      setSupplier({ name: '', email: '', password: '', phoneNumbers: [''] });
      setTabValue(2); // Switch to supplier list tab
    } catch (error) {
      if (error.response && error.response.status === 403) {
        alert(error.response.data.message);
      } else {
        console.error('Error saving supplier:', error);
        alert(error.response?.data?.message || 'Failed to save supplier.');
      }
    }
  };

  const handleSavePurchaseOrder = async () => {
    try {
      if (!purchaseOrder.suppID) {
        alert('Please select a supplier.');
        return;
      }

      if (purchaseOrder.items.some(item => !item.productID || !item.quantity || !item.cost)) {
        alert('All product fields must be filled.');
        return;
      }

      await axios.post('http://localhost:8081/api/purchase-orders', purchaseOrder);
      fetchSuppliers();
      alert('Purchase Order saved successfully!');
      setPurchaseOrder({ suppID: '', items: [{ productID: '', quantity: '', cost: '' }], total: 0, status: 'Pending' });
    } catch (error) {
      if (error.response && error.response.status === 403) {
        alert(error.response.data.message); 
      } else {
        console.error('Error saving purchase order:', error);
        alert('Failed to save purchase order.');
      }
    }
  };

  return (
    <div className="page-container">
      <Sidebar />
      <div className="content-area">
        <Paper className="main-paper">
          <Typography variant="h4" className="page-title">
            Supplier Management
          </Typography>

          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            className="tabs-container"
            variant="fullWidth"
          >
            <Tab icon={<FaUserPlus />} label="Add Supplier" className="tab" />
            <Tab icon={<FaShoppingCart />} label="Create Purchase Order" className="tab" />
            <Tab icon={<FaUsers />} label="Supplier List" className="tab" />
          </Tabs>

          {/* Add Supplier Form */}
          <TabPanel value={tabValue} index={0}>
            <Paper className="form-paper">
              <Typography variant="h5" className="section-title">
                Add New Supplier
              </Typography>
              <div className="form-container">
                <TextField 
                  label="Supplier Name" 
                  name="name" 
                  value={supplier.name} 
                  onChange={handleSupplierChange} 
                  fullWidth 
                  className="form-field"
                />
                <TextField 
                  label="Email" 
                  name="email" 
                  value={supplier.email} 
                  onChange={handleSupplierChange} 
                  fullWidth 
                  className="form-field"
                />
                <TextField 
                  label="Password" 
                  name="password" 
                  type="password" 
                  value={supplier.password} 
                  onChange={handleSupplierChange} 
                  fullWidth 
                  className="form-field"
                />
                
                <Typography variant="subtitle1" className="subsection-title">
                  Phone Numbers
                </Typography>
                
                {supplier.phoneNumbers.map((phone, index) => (
                  <div key={index} className="phone-row">
                    <TextField
                      label={`Phone ${index + 1}`}
                      value={phone}
                      onChange={(e) => handlePhoneChange(index, e.target.value)}
                      fullWidth
                    />
                    <IconButton 
                      onClick={() => removePhoneNumber(index)} 
                      disabled={supplier.phoneNumbers.length === 1}
                      className="delete-button"
                    >
                      <FaTrash />
                    </IconButton>
                  </div>
                ))}
                
                <Button 
                  onClick={addPhoneNumber} 
                  variant="outlined" 
                  className="add-button"
                >
                  + Add Phone Number
                </Button>

                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  onClick={handleSaveSupplier}
                  className="submit-button"
                >
                  Save Supplier
                </Button>
              </div>
            </Paper>
          </TabPanel>

          {/* Purchase Order Form */}
          <TabPanel value={tabValue} index={1}>
            <Paper className="form-paper">
              <Typography variant="h5" className="section-title">
                Create Purchase Order
              </Typography>
              <div className="form-container">
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
                    <TextField 
                      {...params} 
                      label="Search Supplier ID or Name" 
                      fullWidth 
                      className="form-field"
                    />
                  )}
                  className="supplier-search"
                />

                <Typography variant="subtitle1" className="subsection-title">
                  Order Items
                </Typography>

                {purchaseOrder.items.map((item, index) => (
                  <div key={index} className="product-row">
                    <TextField
                      label="Product ID"
                      value={item.productID}
                      onChange={(e) => handleItemChange(index, "productID", e.target.value)}
                      className="product-field"
                    />
                    <TextField
                      label="Quantity"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      className="quantity-field"
                    />
                    <TextField
                      label="Cost (Rs.)"
                      value={item.cost}
                      onChange={(e) => handleItemChange(index, "cost", e.target.value)}
                      className="cost-field"
                    />
                    <IconButton 
                      onClick={() => removeItem(index)}
                      className="delete-button"
                      disabled={purchaseOrder.items.length === 1}
                    >
                      <FaTrash />
                    </IconButton>
                  </div>
                ))}

                <Button 
                  onClick={addItem} 
                  variant="outlined" 
                  startIcon={<FaPlus />} 
                  className="add-button"
                >
                  Add Product
                </Button>

                <div className="total-section">
                  <Typography variant="h6">
                    Total Amount: Rs. {purchaseOrder.total.toFixed(2)}
                  </Typography>
                </div>

                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  onClick={handleSavePurchaseOrder}
                  className="submit-button"
                >
                  Save Purchase Order
                </Button>
              </div>
            </Paper>
          </TabPanel>

          {/* Supplier List */}
          <TabPanel value={tabValue} index={2}>
            <Paper className="table-paper">
              <Typography variant="h5" className="section-title">
                Supplier List
              </Typography>
              <div className="table-container">
                {suppliersList.length > 0 ? (
                  <Table className="suppliers-table">
                    <TableHead>
                      <TableRow>
                        <TableCell className="table-header">Supplier ID</TableCell>
                        <TableCell className="table-header">Name</TableCell>
                        <TableCell className="table-header">Email</TableCell>
                        <TableCell className="table-header">Phone Numbers</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {suppliersList.map((sup) => (
                        <TableRow key={sup.suppID} className="table-row">
                          <TableCell>{sup.suppID}</TableCell>
                          <TableCell>{sup.name}</TableCell>
                          <TableCell>{sup.email}</TableCell>
                          <TableCell>{Array.isArray(sup.phoneNumbers) ? sup.phoneNumbers.join(', ') : sup.phoneNumbers}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="no-data-message">
                    No suppliers found. Add a supplier from the 'Add Supplier' tab.
                  </div>
                )}
              </div>
            </Paper>
          </TabPanel>
        </Paper>
      </div>
    </div>
  );
};

export default SupplierManagement;