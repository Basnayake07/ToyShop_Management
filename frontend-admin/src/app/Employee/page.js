'use client';

import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { Button, Modal, Box, TextField, Typography, Alert } from "@mui/material";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import EmployeeRegisterForm from "@/components/EmployeeRegister";

const columns = [
  { field: "adminID", headerName: "ID", width: 90 },
  { field: "name", headerName: "Name", width: 180 },
  { field: "address", headerName: "Address", width: 250 },
  { field: "email", headerName: "Email", width: 220 },
  { field: "role", headerName: "Role", width: 130 },
  {
    field: "phoneNumbers",
    headerName: "Phone Numbers",
    width: 200,
    renderCell: (params) => (params.value ? params.value.replace(/,/g, ", ") : "N/A"),
  },
];

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function EmployeeTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [formData, setFormData] = useState({
    adminID: "",
    name: "",
    address: "",
    email: "",
    phoneNumbers: "",
    role: "",
    password: ""
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/auth/users"); // Adjust the URL if necessary
      const formattedRows = response.data.map((user, index) => ({
        id: index + 1, // Unique ID for DataGrid
        adminID: user.adminID,
        name: user.name,
        address: user.address,
        email: user.email,
        role: user.role,
        phoneNumbers: user.phoneNumbers || "N/A",
      }));
      setRows(formattedRows);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch employee data from the backend
    fetchEmployees();
  }, []);

  // Handle Delete Button Click
  const handleDelete = async () => {
    if (!selectedRow) {
      alert("Please select an employee to delete.");
      return;
    }

    try {
      const response = await axios.delete("http://localhost:8081/api/auth/delete", {
        headers: {
          "Content-Type": "application/json",
        },
        data: { adminID: selectedRow.adminID },
      });
      if (response.status === 200) {
        alert("Employee deleted successfully.");
        setRows(rows.filter((row) => row.adminID !== selectedRow.adminID));
        setSelectedRow(null);
      } else {
        alert("Failed to delete employee.");
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
      alert(error.response.data.message); 
    } else {
      alert("Failed to delete employee.");
    }
  }
    };

  // Handle Update Button Click
  const handleUpdate = () => {
    if (!selectedRow) {
      alert("Please select an employee to update.");
      return;
    }

    setFormData({
      adminID: selectedRow.adminID,
      name: selectedRow.name,
      address: selectedRow.address,
      email: selectedRow.email,
      phoneNumbers: selectedRow.phoneNumbers,
      role: selectedRow.role,
      password: ""
    });

    setIsUpdateMode(true);
    setOpen(true);
  };

  // Handle Form Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Update Employee
  const handleUpdateSubmit = async () => {
    try {
      await axios.put("http://localhost:8081/api/auth/update", formData, {
        headers: { "Content-Type": "application/json" },
      });
      alert("Employee updated successfully.");
      setRows(
        rows.map((row) =>
          row.adminID === formData.adminID
            ? { ...row, address: formData.address, phoneNumbers: formData.phoneNumbers }
            : row
        )
      );
      setUpdateSuccess(true);
    } catch (error) {
      if (error.response && error.response.status === 403) {
      alert(error.response.data.message); 
  }
    }

    setOpen(false);
  };

  // Filter employees based on search input
  const filteredRows = rows.filter((row) =>
    row.name.toLowerCase().includes(search.toLowerCase())
  );

  // Handle Modal Open
  const handleOpen = () => {
    setIsUpdateMode(false);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setUpdateSuccess(false);
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px" }}>
        {/* Top Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "250px" }}
          />

          <div>
            <Button
              variant="contained"
              sx={{ ml: -2, backgroundColor: "#4CBB17", color: "white", marginRight: "30px" }}
              onClick={handleOpen}
            >
              Add Employee
            </Button>

            <Button
              variant="contained"
              sx={{ ml: -2, backgroundColor: "#d23232", color: "white" }}
              onClick={handleDelete}
              disabled={!selectedRow}
              style={{ marginRight: "10px" }}
            >
              Delete
            </Button>

            <Button
              variant="contained"
              sx={{ backgroundColor: "#2196F3", color: "white" }}
              onClick={handleUpdate}
              disabled={!selectedRow}
            >
              Update
            </Button>
          </div>
        </div>

        {/* Employee Table */}
        <Paper sx={{ height: 500, width: "100%" }}>
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

      {/* Modal for Employee Registration and Update */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {isUpdateMode ? "Update Employee" : "Register Employee"}
          </Typography>
          {isUpdateMode ? (
            <form>
              <TextField
                fullWidth
                margin="normal"
                label="Admin ID"
                name="adminID"
                value={formData.adminID}
                onChange={handleChange}
                disabled
              />
              <TextField
                fullWidth
                margin="normal"
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled
              />
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
              />
              <TextField
                fullWidth
                margin="normal"
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled
              />
              <TextField
                fullWidth
                margin="normal"
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                margin="normal"
                label="Phone Numbers"
                name="phoneNumbers"
                value={formData.phoneNumbers}
                onChange={handleChange}
                required
              />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleUpdateSubmit}
                sx={{ mt: 2 }}
              >
                Update
              </Button>
              {updateSuccess && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Employee updated successfully!
                </Alert>
              )}
            </form>
          ) : (
            <EmployeeRegisterForm onEmployeeAdded={fetchEmployees} />
          )}
        </Box>
      </Modal>
    </div>
  );
}
