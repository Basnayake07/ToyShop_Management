'use client';

import React, { useState, useEffect } from "react";
import "@/styles/OrderList.css";
import { DataGrid } from "@mui/x-data-grid";
import { Paper, TextField, Typography, Box, IconButton, Grid, Chip,Table, TableContainer,TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import { Modal, Button, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Sidebar from "@/components/Sidebar";
import axios from "axios";

const PurchaseOrderDetails = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPurchaseOrders = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/purchase-orders");
      setPurchaseOrders(response.data);
      setFilteredOrders(response.data); // Initialize filteredOrders with all orders
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  useEffect(() => {
    const filtered = purchaseOrders.filter((order) => {
      const query = searchQuery.toLowerCase();
      return (
        (order.suppID && order.suppID.toLowerCase().includes(query)) ||
        (order.supplierName && order.supplierName.toLowerCase().includes(query))
      );
    });
    setFilteredOrders(filtered);
  }, [searchQuery, purchaseOrders]);

  // Define status colors
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#FFA500"; // Orange
      case "Received":
        return "#4CAF50"; // Green
      case "Cancelled":
        return "#F44336"; // Red
      default:
        return "#000"; // Default black
    }
  };

  const [selectedOrder, setSelectedOrder] = useState(null);
const [openModal, setOpenModal] = useState(false);

const handleRowClick = async (purchaseID) => {
    try {
      const response = await axios.get(`http://localhost:8081/api/purchase-orders/details/${purchaseID}`);
      setSelectedOrder(response.data);
      setOpenModal(true);
    } catch (error) {
      console.error("Error fetching purchase order details:", error);
      alert("Failed to fetch purchase order details.");
    }
  };

  // Table columns
  const columns = [
    { field: "suppID", headerName: "Supplier ID", width: 120 },
    { field: "supplierName", headerName: "Name", width: 150 },
    { field: "purchaseID", headerName: "Purchase ID", width: 100 },
    {
        field: "orderDate",
        headerName: "Date",
        width: 120,
        renderCell: (params) => (
          <span>{new Date(params.value).toISOString().split('T')[0]}</span>
        ),
      },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => (
        <span
          style={{
            color: "#fff",
            backgroundColor: getStatusColor(params.value),
            padding: "5px 10px",
            borderRadius: "5px",
            fontWeight: "bold",
          }}
        >
          {params.value}
        </span>
      ),
    },
    { field: "total", headerName: "Total (Rs.)", width: 120 },
    {
        field: "comments",
        headerName: "Comments",
        width: 180,
        renderCell: (params) => (
          <Tooltip title={params.value || ""} arrow>
            <span
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "block",
                maxWidth: "100%",
              }}
            >
              {params.value}
            </span>
          </Tooltip>
        ),
      },
  ];

  return (
    <div style={{ display: "flex", backgroundColor: "#f0f0f0" }}>
      {/* Sidebar */}
      <Sidebar />
      <div className="orders-container">
        {/* Top Bar */}
        <div className="orders-header">
          <Typography variant="h4" gutterBottom>
            Purchase Order Details
          </Typography>
          <TextField
            label="Search by Supplier ID or Name"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: "20px", width: "300px" }}
          />
        </div>

        {/* Purchase Orders Table */}
        <Paper sx={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={filteredOrders}
            columns={columns}
            pageSizeOptions={[5, 10]}
            rowHeight={60}
            sx={{ border: 0 }}
            getRowId={(row) => row.purchaseID}
            onRowClick={(params) => handleRowClick(params.row.purchaseID)} // Fetch order details when a row is clicked
          />
        </Paper>

        <Modal open={openModal} onClose={() => setOpenModal(false)}>
  <Box 
    sx={{ 
      p: 4, 
      backgroundColor: "white", 
      maxWidth: 600, 
      margin: "100px auto", 
      borderRadius: 2, 
      boxShadow: 3,
      position: "relative"
    }}
  >
    {selectedOrder ? (
      <>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Purchase Order Details
          </Typography>
          <IconButton 
            aria-label="close" 
            onClick={() => setOpenModal(false)}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        
        {/* Header Information */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: "#f8f9fa" }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Purchase Order ID</Typography>
              <Typography variant="body1" fontWeight="medium">{selectedOrder.purchaseID}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Date</Typography>
              <Typography variant="body1">{selectedOrder.orderDate}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Supplier</Typography>
              <Typography variant="body1">{selectedOrder.supplierName}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Status</Typography>
              <Chip 
                label={selectedOrder.status} 
                size="small" 
                color={selectedOrder.status === "Completed" ? "success" : 
                       selectedOrder.status === "Pending" ? "warning" : "default"} 
                sx={{ mt: 0.5 }}
              />
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
                <TableCell align="right">Unit Cost (Rs.)</TableCell>
                <TableCell align="right">Subtotal (Rs.)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedOrder.items.map((item, index) => (
                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{item.productID}</TableCell>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{item.cost}</TableCell>
                  <TableCell align="right">{item.quantity * item.cost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Footer with Total */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6">Total</Typography>
          <Typography variant="h6" fontWeight="bold">Rs. {selectedOrder.total}</Typography>
        </Box>
        
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined" onClick={() => setOpenModal(false)}>
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

export default PurchaseOrderDetails;