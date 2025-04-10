'use client';

import React, { useState, useEffect } from "react";
import "@/styles/OrderList.css";
import { DataGrid } from "@mui/x-data-grid";
import { Paper, Modal, Box, Button, Typography, TextField } from "@mui/material";
import axios from "axios";
import Sidebar from "@/components/Sidebar";

const OrdersTable = ({ orders, onRowClick }) => {
  const columns = [
    { field: "orderID", headerName: "Order ID", width: 100 },
    { field: "customerName", headerName: "Customer Name", width: 150 },
    { field: "orderDate", headerName: "Order Date", width: 150 },
    { field: "totalPrice", headerName: "Total Price (Rs.)", width: 120 },
    { field: "payStatus", headerName: "Payment Status", width: 150 },
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
    <Paper sx={{ height: 500, width: "100%" }}>
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
      setOpenModal(true); // Open the modal
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
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
          <Box sx={{ ...modalStyle }}>
            {selectedOrder ? (
              <>
                <Typography variant="h6" gutterBottom>
                  Order Details
                </Typography>
                <Typography>
                  <strong>Order ID:</strong> {selectedOrder.order.orderID}
                </Typography>
                <Typography>
                  <strong>Customer Name:</strong> {selectedOrder.order.customerName}
                </Typography>
                <Typography>
                  <strong>Order Date:</strong> {new Date(selectedOrder.order.orderDate).toLocaleDateString()}
                </Typography>
                <Typography>
                  <strong>Total Price:</strong> Rs. {selectedOrder.order.totalPrice}
                </Typography>
                <Typography>
                  <strong>Payment Status:</strong> {selectedOrder.order.payStatus}
                </Typography>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Items
                </Typography>
                {selectedOrder.items.map((item, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography>
                      <strong>Product ID:</strong> {item.productID}
                    </Typography>
                    <Typography>
                      <strong>Product Name:</strong> {item.productName}
                    </Typography>
                    <Typography>
                      <strong>Quantity:</strong> {item.quantity}
                    </Typography>
                    <Typography>
                      <strong>Price:</strong> Rs. {item.price}
                    </Typography>
                  </Box>
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleCloseModal}
                >
                  Close
                </Button>
              </>
            ) : (
              <Typography>Loading...</Typography>
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