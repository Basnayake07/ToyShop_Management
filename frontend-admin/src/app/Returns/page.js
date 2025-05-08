'use client';

import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Modal, Box, Button, TextField, Typography, Paper,MenuItem } from "@mui/material";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import ReturnedProductsTable from "@/components/ReturnedProductsTable";

const ReturnsPage = () => {
  const [returns, setReturns] = useState([]);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newReturn, setNewReturn] = useState({
    orderID: "",
    cusID: "",
    status: "Requested",
    reason: "",
    items: [{ productID: "", name: "", quantity: "" }],
  });
  const [openReturnedProductsModal, setOpenReturnedProductsModal] = useState(false);

  const fetchReturns = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/returns");
      setReturns(response.data);
    } catch (error) {
      console.error("Error fetching returns:", error);
    }
  };

  const handleRowClick = (returnID) => {
    axios
      .get(`http://localhost:8081/api/returns/${returnID}`)
      .then((response) => {
        setSelectedReturn(response.data);
        setOpenModal(true);
      })
      .catch((error) => console.error("Error fetching return details:", error));
  };

  const handleUpdateStatus = async () => {
    try {
      await axios.put(`http://localhost:8081/api/returns/${selectedReturn.returnDetails.returnID}`, {
        status,
        note,
      });
      alert("Return status updated successfully!");
      setOpenModal(false);
      fetchReturns();
    } catch (error) {
      console.error("Error updating return status:", error);
      alert("Failed to update return status.");
    }
  };

  const handleAddReturn = async () => {
    try {
      await axios.post("http://localhost:8081/api/returns", newReturn);
      alert("Return request added successfully!");
      setOpenAddModal(false);
      fetchReturns();
    } catch (error) {
      console.error("Error adding return request:", error);
      alert("Failed to add return request.");
    }
  };

  const handleAddItem = () => {
    setNewReturn((prev) => ({
      ...prev,
      items: [...prev.items, { productID: "", name: "", quantity: "" }],
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newReturn.items];
    updatedItems[index][field] = value;
    setNewReturn((prev) => ({ ...prev, items: updatedItems }));
  };
  
  useEffect(() => {
    fetchReturns();
  }, []);

  const handleOpenReturnedProductsModal = () => setOpenReturnedProductsModal(true); // Open Returned Products Modal
  const handleCloseReturnedProductsModal = () => setOpenReturnedProductsModal(false); // Close Returned Products Modal

  return (
    <div style={{ display: "flex", backgroundColor: "#f0f0f0" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "20px" }}>
        <Typography variant="h4" gutterBottom>
          Returns Management
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenAddModal(true)}
          style={{ marginBottom: "20px" }}
        >
          Add Return Request
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleOpenReturnedProductsModal} // Open Returned Products Modal
          style={{ marginBottom: "20px" }}
        >
          View Returned Products
        </Button>


        <Paper sx={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={returns}
            getRowId={(row) => row.returnID} 
            columns={[
              { field: "returnID", headerName: "Return ID", width: 100 },
              { field: "orderID", headerName: "Order ID", width: 100 },
              { field: "name", headerName: "Customer Name", width: 150 },
              {
                field: "requestDate",
                headerName: "Request Date",
                width: 150,
                renderCell: (params) => (
                  <span>{new Date(params.value).toISOString().split('T')[0]}</span>
                ),
              },
              { field: "status", headerName: "Status", width: 120 },
              { field: "reason", headerName: "Reason", width: 200 },
            ]}
            pageSizeOptions={[5, 10]}
            onRowClick={(params) => handleRowClick(params.row.returnID)}
          />
        </Paper>

        {/* Modal for Return Details */}
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box sx={{ p: 4, backgroundColor: "white", maxWidth: 600, margin: "100px auto", borderRadius: 2 }}>
            {selectedReturn ? (
              <>
                <Typography variant="h6">Return Details</Typography>
                <Typography><strong>Return ID:</strong> {selectedReturn.returnDetails.returnID}</Typography>
                <Typography><strong>Order ID:</strong> {selectedReturn.returnDetails.orderID}</Typography>
                <Typography><strong>Customer Name:</strong> {selectedReturn.returnDetails.name}</Typography>
                <Typography><strong>Status:</strong> {selectedReturn.returnDetails.status}</Typography>
                <Typography><strong>Reason:</strong> {selectedReturn.returnDetails.reason}</Typography>
                <Typography><strong>Items:</strong></Typography>
                <ul>
                  {selectedReturn.items.map((item) => (
                    <li key={item.productID}>
                    Product ID: {item.productID}, Name: {item.name}, Quantity: {item.quantity}
                  </li>
                  ))}
                </ul>
                <TextField
                    label="Update Status"
                    select
                    fullWidth
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    margin="normal"
                    >
                    <MenuItem value="Accepted">Accepted</MenuItem>
                    <MenuItem value="Unaccepted">Unaccepted</MenuItem>
                </TextField>
                {status === "Unaccepted" && (
                  <TextField
                    label="Note"
                    fullWidth
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    margin="normal"
                  />
                )}
                <Button variant="contained" color="primary" onClick={handleUpdateStatus}>
                  Update Status
                </Button>
              </>
            ) : (
              <Typography>No return selected</Typography>
            )}
          </Box>
        </Modal>

        <Modal open={openAddModal} onClose={() => setOpenAddModal(false)}>
    <Box sx={{ p: 4, backgroundColor: "white", maxWidth: 600, margin: "100px auto", borderRadius: 2 }}>
        <Typography variant="h6">Add Return Request</Typography>
        <TextField
        label="Order ID"
        fullWidth
        value={newReturn.orderID}
        onChange={(e) => setNewReturn({ ...newReturn, orderID: e.target.value })}
        margin="normal"
        />
        <TextField
        label="Customer ID"
        fullWidth
        value={newReturn.cusID}
        onChange={(e) => setNewReturn({ ...newReturn, cusID: e.target.value })}
        margin="normal"
        />
        <TextField
        label="Reason"
        fullWidth
        value={newReturn.reason}
        onChange={(e) => setNewReturn({ ...newReturn, reason: e.target.value })}
        margin="normal"
        />
        <Typography variant="subtitle1" gutterBottom>
        Items
        </Typography>
        {newReturn.items.map((item, index) => (
        <Box key={index} sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
            <TextField
            label="Product ID"
            value={item.productID}
            onChange={async (e) => {
                const productID = e.target.value;
                handleItemChange(index, "productID", productID);

                // Fetch product name based on product ID
                try {
                const response = await axios.get(`http://localhost:8081/api/products/${productID}`);
                const productName = response.data.name;
                handleItemChange(index, "name", productName);
                } catch (error) {
                console.error("Error fetching product details:", error);
                handleItemChange(index, "name", ""); // Clear name if product not found
                }
            }}
            fullWidth
            />
            <TextField
            label="Name"
            value={item.name}
            disabled // Make this field read-only
            fullWidth
            />
            <TextField
            label="Quantity"
            type="number"
            value={item.quantity}
            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
            fullWidth
            />
        </Box>
        ))}
        <Button variant="outlined" onClick={handleAddItem} style={{ marginBottom: "20px" }}>
        Add Item
        </Button>
        <Box sx={{ textAlign: "center", marginTop: "20px" }}>
        <Button
            variant="contained"
            color="primary"
            onClick={handleAddReturn}
            style={{ width: "100%", padding: "10px" }}
        >
            Submit
        </Button>
        </Box>
  </Box>
</Modal>
         {/* Modal for Returned Products Table */}
         <Modal open={openReturnedProductsModal} onClose={handleCloseReturnedProductsModal}>
          <Box sx={{ ...modalStyle }}>
            <ReturnedProductsTable />
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
  width: "80%",
  maxHeight: "80vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
export default ReturnsPage;