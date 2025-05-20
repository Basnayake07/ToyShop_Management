'use client';

import React, { useState, useEffect } from "react";
import "@/styles/OrderList.css";
import { DataGrid } from "@mui/x-data-grid";
import { Paper, Modal, Box, Button, Typography, TextField } from "@mui/material";
import { Grid, Table, TableContainer, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "@/styles/Highlight.css";
import axios from "axios";
import Sidebar from "@/components/Sidebar";

const OrdersTable = ({ orders, onRowClick }) => {
  const columns = [
    { field: "orderID", headerName: "Order ID", width: 100 },
    { field: "customerName", headerName: "Customer Name", width: 150 },
    {
      field: "orderDate",
      headerName: "Date",
      width: 120,
      renderCell: (params) => (
        <span>{new Date(params.value).toLocaleDateString()}</span>
      ),
    },
    { field: "totalPrice", headerName: "Total Price (Rs.)", width: 120 },
    {
      field: "payStatus",
      headerName: "Payment Status",
      width: 150,
      renderCell: (params) => (
        <span
          className={
            params.value === "Partially Paid" ? "highlight-cell" : ""
          }
        >
          {params.value}
        </span>
      ),
    },
    { field: "deliveryStatus", headerName: "Delivery Status", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => onRowClick(params.row.orderID)} // Pass the orderID to the handler
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Paper sx={{ height: 700, width: "80%" }}>
      <DataGrid
        rows={orders}
        columns={columns}
        pageSizeOptions={[5, 10]}
        rowHeight={60}
        sx={{ border: 0 }}
        getRowId={(row) => row.orderID}
      />
    </Paper>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newDeliveryStatus, setNewDeliveryStatus] = useState("");

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/orders");
      setOrders(response.data);
      setFilteredOrders(response.data); // Initialize filteredOrders with all orders
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on search query
  useEffect(() => {
    const filtered = orders.filter((order) => {
      const query = searchQuery.toLowerCase();
      return (
        order.orderID.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        (order.customerID && order.customerID.toLowerCase().includes(query))
      );
    });
    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

  // Fetch order details by orderID
  const fetchOrderDetails = async (orderID) => {
    try {
      const response = await axios.get(`http://localhost:8081/api/orders/${orderID}`);
      setSelectedOrder(response.data); // Set the fetched order details
      setNewDeliveryStatus(response.data.order.deliveryStatus);
      setOpenModal(true); // Open the modal
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  // Update delivery status handler
const handleUpdateDeliveryStatus = async () => {
  if (!selectedOrder) return;
  setUpdatingStatus(true);
  try {
    await axios.put(
      `http://localhost:8081/api/orders/${selectedOrder.order.orderID}/delivery-status`,
      { deliveryStatus: newDeliveryStatus }
    );
    // Refresh order details and list
    fetchOrderDetails(selectedOrder.order.orderID);
    fetchOrders();
  } catch (error) {
    console.error("Error updating delivery status:", error);
  }
  setUpdatingStatus(false);
};

  const handleRowClick = (orderID) => {
    fetchOrderDetails(orderID); // Fetch order details when a row is clicked
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setOpenModal(false);
  };

  return (
    <div style={{ display: "flex", backgroundColor: "#f0f0f0" }}>
      {/* Sidebar */}
      <Sidebar />
      <div className="orders-container">
        {/* Top Bar */}
        <div className="orders-header">
          <h2>Orders</h2>
          <TextField
            label="Search Orders"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: "20px", width: "300px" }}
          />
        </div>

        {/* Orders Table */}
        <OrdersTable orders={filteredOrders} onRowClick={handleRowClick} />

        {/* Order Details Modal */}
        <Modal open={openModal} onClose={handleCloseModal}>
  <Box
    sx={{
      p: 4,
      backgroundColor: "white",
      maxWidth: 600,
      margin: "100px auto",
      borderRadius: 2,
      boxShadow: 3,
      position: "relative",
    }}
  >
    {selectedOrder ? (
      <>
        {/* Modal Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Order Details
          </Typography>
          
        </Box>

        {/* Order Information */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: "#f8f9fa" }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Order ID</Typography>
              <Typography variant="body1" fontWeight="medium">{selectedOrder.order.orderID}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Order Date</Typography>
              <Typography variant="body1">{new Date(selectedOrder.order.orderDate).toLocaleDateString()}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Customer Name</Typography>
              <Typography variant="body1">{selectedOrder.order.customerName}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Payment Status</Typography>
              <Typography variant="body1">{selectedOrder.order.payStatus}</Typography>
            </Grid>
            <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Delivery Status</Typography>
            <select
              value={newDeliveryStatus}
              onChange={e => setNewDeliveryStatus(e.target.value)}
              style={{ padding: "6px", borderRadius: 4, border: "1px solid #ccc", width: "100%" }}
            >
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Delivered">Delivered</option>
            </select>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={handleUpdateDeliveryStatus}
              disabled={updatingStatus || newDeliveryStatus === selectedOrder.order.deliveryStatus}
              sx={{ mt: 1 }}
            >
              {updatingStatus ? "Updating..." : "Update"}
            </Button>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Total Price</Typography>
              <Typography variant="body1">Rs. {selectedOrder.order.totalPrice}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Items Table */}
        <Typography variant="h6" sx={{ mb: 2 }}>
  Order Items
</Typography>
<TableContainer component={Paper} sx={{ mb: 3 }}>
  <Table size="small">
    <TableHead sx={{ backgroundColor: "#f1f3f5" }}>
      <TableRow>
        <TableCell>Product ID</TableCell>
        <TableCell>Product Name</TableCell>
        <TableCell align="right">Quantity</TableCell>
        <TableCell align="right">Price (Rs.)</TableCell>
        <TableCell align="right">Rating</TableCell>
        <TableCell>Comment</TableCell>
        <TableCell>Review Date</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {selectedOrder.items.map((item, index) => (
        <TableRow key={index}>
          <TableCell>{item.productID}</TableCell>
          <TableCell>{item.productName}</TableCell>
          <TableCell align="right">{item.quantity}</TableCell>
          <TableCell align="right">{item.price}</TableCell>
          <TableCell align="right">
            {item.customerRating ? item.customerRating : "-"}
          </TableCell>
          <TableCell>
            {item.comment ? item.comment : "-"}
          </TableCell>
          <TableCell>
            {item.reviewCreatedAt
              ? new Date(item.reviewCreatedAt).toLocaleDateString()
              : "-"}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>

        {/* Footer */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="contained" color="primary">
            Print Order
          </Button>
        </Box>
      </>
    ) : (
      <Typography>No order selected</Typography>
    )}
  </Box>
</Modal>
      </div>
    </div>
  );
};

// Modal styling
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default Orders;