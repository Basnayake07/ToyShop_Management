'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableHead, TableRow, TableCell, TableBody, TextField, Button, Select, MenuItem } from '@mui/material';

const SupplierDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [comments, setComments] = useState({});
  const [statuses, setStatuses] = useState({});
  const [suppID, setSuppID] = useState(null); // State to store supplier ID

  useEffect(() => {
    // Retrieve suppID from localStorage on the client side
    const storedSuppID = localStorage.getItem('suppID');
    if (storedSuppID) {
      setSuppID(storedSuppID);
    } else {
      console.error('Supplier ID not found in localStorage');
    }
  }, []);

  useEffect(() => {
    if (suppID) {
      fetchOrders();
    }
  }, [suppID]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`http://localhost:8081/api/supplier-auth/${suppID}/purchase-orders`);
      setOrders(res.data);
      const initialComments = {};
      const initialStatuses = {};
      res.data.forEach((order) => {
        initialComments[order.purchaseID] = order.comments || '';
        initialStatuses[order.purchaseID] = order.status || 'Pending';
      });
      setComments(initialComments);
      setStatuses(initialStatuses);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleCommentsChange = (purchaseID, value) => {
    setComments((prev) => ({ ...prev, [purchaseID]: value }));
  };

  const handleStatusChange = (purchaseID, value) => {
    setStatuses((prev) => ({ ...prev, [purchaseID]: value }));
  };

  const handleSave = async (purchaseID) => {
    try {
      const updatedOrder = {
        status: statuses[purchaseID],
        comments: comments[purchaseID],
      };
      await axios.put(`http://localhost:8081/api/supplier-auth/purchase-orders/${purchaseID}`, updatedOrder);
      alert('Order updated successfully');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    }
  };

  return (
    <div>
      <h1>Supplier Dashboard</h1>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>Order Date</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Comments</TableCell>
            <TableCell>Feedback</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.purchaseID}>
              <TableCell>{order.purchaseID}</TableCell>
              <TableCell>{new Date(order.purchaseDate).toISOString().split('T')[0]}</TableCell>
              <TableCell>Rs. {order.total}</TableCell>
              <TableCell>
                <Select
                  value={statuses[order.purchaseID]}
                  onChange={(e) => handleStatusChange(order.purchaseID, e.target.value)}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Received">Received</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </TableCell>
              <TableCell>
                <TextField
                  value={comments[order.purchaseID]}
                  onChange={(e) => handleCommentsChange(order.purchaseID, e.target.value)}
                  placeholder="Enter comments"
                  fullWidth
                />
              </TableCell>
              <TableCell>
                <span>{order.feedback || "No feedback"}</span> {/* Read-only Feedback */}
              </TableCell>

              <TableCell>
                <Button variant="contained" color="primary" onClick={() => handleSave(order.purchaseID)}>
                  Save
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SupplierDashboard;