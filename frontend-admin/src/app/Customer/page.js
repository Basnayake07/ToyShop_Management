'use client';

import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Modal, Box, Typography, Alert } from "@mui/material";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";

const columns = [
  { field: "cusID", headerName: "ID", width: 80 },
  { field: "name", headerName: "Name", width: 150 },
  { field: "email", headerName: "Email", width: 180 },
  {
    field: "phoneNumbers",
    headerName: "Phone Numbers",
    width: 180,
    renderCell: (params) => (params.value ? params.value.replace(/,/g, ", ") : "N/A"),
  },
];

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function CustomerManagement() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumbers: "",
    cusType: "",
  });
  const [registerFormData, setRegisterFormData] = useState({
    name: "",
    email: "",
    phoneNumbers: "",
    cusType: "",
  });
  
  const [redirectToOrder, setRedirectToOrder] = useState(false); // Define the state for redirection

  const router = useRouter();

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Check if the user came from the order modal
  useEffect(() => {
    if (redirectToOrder) {
      sessionStorage.removeItem("returnToOrder");
      sessionStorage.removeItem("redirectAfterRegister");
      router.push("/Product"); // Redirect to the product page
    }
  }, [redirectToOrder]); // Listen for changes in redirectToOrder

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/customers");
      const formattedRows = response.data.map((customer, index) => ({
        id: index + 1,
        cusID: customer.cusID,
        name: customer.name,
        email: customer.email,
        phoneNumbers: customer.phoneNumbers,
        cusType: customer.cusType,
      }));
      setRows(formattedRows);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      const token = localStorage.getItem("token");
      const adminID = localStorage.getItem("adminID");
  
      const payload = { ...registerFormData, adminID };
      console.log("Payload Sent to Backend:", payload); // Log the payload
  
      await axios.post(
        "http://localhost:8081/api/customers/register",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      alert("Customer registered successfully.");
      sessionStorage.setItem("redirectAfterRegister", "true");
      setRedirectToOrder(true);
      fetchCustomers();
    } catch (error) {
      console.error("Error registering customer:", error.response?.data || error.message);
      alert("Failed to register customer.");
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) {
      alert("Please select a customer to delete.");
      return;
    }
    try {
      const token = localStorage.getItem("token"); 
    await axios.delete("http://localhost:8081/api/customers/delete", {
      headers: { Authorization: `Bearer ${token}` }, 
      data: { cusID: selectedRow.cusID },
    });
      alert("Customer deleted successfully.");
      fetchCustomers();
      setSelectedRow(null);
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Failed to delete customer.");
    }
  };

  const handleUpdate = () => {
    if (!selectedRow) {
      alert("Please select a customer to update.");
      return;
    }
    setFormData({
      cusID: selectedRow.cusID,
      name: selectedRow.name,
      email: selectedRow.email,
      phoneNumbers: selectedRow.phoneNumbers,
      cusType: selectedRow.cusType.toLowerCase(),
    });
    setOpen(true); // Open the modal
  };

  const handleSaveUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const updatedData = {
        cusID: formData.cusID,
        name: formData.name,
        email: formData.email,
        phoneNumbers: formData.phoneNumbers.split(",").map((num) => num.trim()), // Convert to array
        cusType: formData.cusType,
      };

      await axios.put("http://localhost:8081/api/customers/update", updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Customer updated successfully.");
      setOpen(false); // Close the modal
      fetchCustomers(); // Refresh the customer table
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Failed to update customer.");
    }
  };

  const filteredRows = rows.filter(
    (row) =>
      row.name.toLowerCase().includes(search.toLowerCase()) &&
      (filter ? row.cusType === filter : true)
  );

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", width: "100%" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex" }}>
        {/* Customer Registration Form */}
        <div style={{ flex: 4, padding: "20px", border: "10px", maxWidth: "100%", minWidth: "350px" }}>
          <Typography variant="h6" style={{ marginBottom: "20px" }}>Customer Registration</Typography>
          <TextField
            fullWidth
            label="Name"
            margin="normal"
            value={registerFormData.name}
            onChange={(e) => setRegisterFormData({ ...registerFormData, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={registerFormData.email}
            onChange={(e) => setRegisterFormData({ ...registerFormData, email: e.target.value })}
          />
          <TextField
            fullWidth
            label="Phone Numbers"
            margin="normal"
            value={registerFormData.phoneNumbers}
            onChange={(e) => setRegisterFormData({ ...registerFormData, phoneNumbers: e.target.value })}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Customer Type</InputLabel>
            <Select
              value={registerFormData.cusType}
              onChange={(e) => setRegisterFormData({ ...registerFormData, cusType: e.target.value })}
            >
              <MenuItem value="wholesale">Wholesale</MenuItem>
              <MenuItem value="retail">Retail</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" fullWidth onClick={handleRegister}>
            Register
          </Button>
        </div>

        {/* Customer Table */}
        <div style={{ flex: 2, padding: "20px", maxWidth: "600px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "250px" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FormControl style={{ width: "100px" }}>
                <InputLabel>Filter</InputLabel>
                <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Wholesale">Wholesale</MenuItem>
                  <MenuItem value="Retail">Retail</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
                disabled={!selectedRow}
              >
                Delete
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdate}
                disabled={!selectedRow}
              >
                Update
              </Button>
            </div>
          </div>
          <Paper sx={{ height: 450, width: "100%" }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              loading={loading}
              pageSizeOptions={[5, 10]}
              checkboxSelection={false}
              onRowClick={(params) => setSelectedRow(params.row)}
              sx={{ border: 0 }}
            />
          </Paper>
        </div>
      </div>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={style}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Update Customer
          </Typography>
          <TextField
            fullWidth
            label="Name"
            margin="normal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
            fullWidth
            label="Phone Numbers"
            margin="normal"
            value={formData.phoneNumbers}
            onChange={(e) => setFormData({ ...formData, phoneNumbers: e.target.value })}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Customer Type</InputLabel>
            <Select
              value={formData.cusType}
              onChange={(e) => setFormData({ ...formData, cusType: e.target.value })}
            >
              <MenuItem value="wholesale">Wholesale</MenuItem>
              <MenuItem value="retail">Retail</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSaveUpdate}
            sx={{ mt: 2 }}
          >
            Save
          </Button>
        </Box>
      </Modal>
    </div>
    
  );
}
