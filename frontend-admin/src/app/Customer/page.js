'use client';

import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Modal, 
  Box, 
  Typography, 
  Tabs,
  Tab,
  Alert
} from "@mui/material";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import "@/styles/CustomerManagement.css";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      className="tab-panel"
      {...other}
    >
      {value === index && (
        <Box className="tab-content">
          {children}
        </Box>
      )}
    </div>
  );
}

const columns = [
  { field: "cusID", headerName: "ID", width: 150 },
  { field: "name", headerName: "Name", width: 180 },
  { field: "email", headerName: "Email", width: 180 },
  {
    field: "phoneNumbers",
    headerName: "Phone Numbers",
    width: 180,
    renderCell: (params) => (params.value ? params.value.replace(/,/g, ", ") : "N/A"),
  },
];

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
};

export default function CustomerManagement() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  
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
  
  const [redirectToOrder, setRedirectToOrder] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (redirectToOrder) {
      sessionStorage.removeItem("returnToOrder");
      sessionStorage.removeItem("redirectAfterRegister");
      router.push("/Product");
    }
  }, [redirectToOrder]);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ ...notification, show: false });
    }, 3000);
  };

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
      showNotification("Failed to fetch customers", "error");
    }
  };

  const handleRegister = async () => {
    try {
      const token = localStorage.getItem("token");
      const adminID = localStorage.getItem("adminID");
  
      const payload = { ...registerFormData, adminID };
  
      await axios.post(
        "http://localhost:8081/api/customers/register",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      showNotification("Customer registered successfully");
      setRegisterFormData({
        name: "",
        email: "",
        phoneNumbers: "",
        cusType: "",
      });
      
      sessionStorage.setItem("redirectAfterRegister", "true");
      setRedirectToOrder(true);
      fetchCustomers();
    } catch (error) {
      console.error("Error registering customer:", error.response?.data || error.message);
      showNotification("Failed to register customer", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) {
      showNotification("Please select a customer to delete", "warning");
      return;
    }
    try {
      const token = localStorage.getItem("token"); 
      await axios.delete("http://localhost:8081/api/customers/delete", {
        headers: { Authorization: `Bearer ${token}` }, 
        data: { cusID: selectedRow.cusID },
      });
      showNotification("Customer deleted successfully");
      fetchCustomers();
      setSelectedRow(null);
    } catch (error) {
      console.error("Error deleting customer:", error);
      showNotification("Failed to delete customer", "error");
    }
  };

  const handleUpdate = () => {
    if (!selectedRow) {
      showNotification("Please select a customer to update", "warning");
      return;
    }
    setFormData({
      cusID: selectedRow.cusID,
      name: selectedRow.name,
      email: selectedRow.email,
      phoneNumbers: selectedRow.phoneNumbers,
      cusType: selectedRow.cusType.toLowerCase(),
    });
    setOpen(true);
  };

  const handleSaveUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const updatedData = {
        cusID: formData.cusID,
        name: formData.name,
        email: formData.email,
        phoneNumbers: formData.phoneNumbers.split(",").map((num) => num.trim()),
        cusType: formData.cusType,
      };

      await axios.put("http://localhost:8081/api/customers/update", updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showNotification("Customer updated successfully");
      setOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error("Error updating customer:", error);
      showNotification("Failed to update customer", "error");
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredRows = rows.filter(
    (row) =>
      row.name.toLowerCase().includes(search.toLowerCase()) &&
      (filter ? row.cusType === filter : true)
  );

  return (
    <div className="customer-management-container">
      <Sidebar />
      
      <div className="main-content">
        <Typography variant="h4" className="page-title">
          Customer Management
        </Typography>
        
        {notification.show && (
          <Alert severity={notification.type} className="notification">
            {notification.message}
          </Alert>
        )}
        
        <Box className="tabs-container">
          <Box className="tabs-header">
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              className="custom-tabs"
              variant="fullWidth"
            >
              <Tab label="Register Customer" />
              <Tab label="Manage Customers" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <div className="registration-form">
              <Typography variant="h6" className="form-title">Customer Registration</Typography>
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
                helperText="Enter multiple numbers separated by commas"
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
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                onClick={handleRegister}
                className="submit-button"
              >
                Register Customer
              </Button>
            </div>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <div className="customer-management">
              <div className="table-controls">
                <TextField
                  label="Search by Name"
                  variant="outlined"
                  size="small"
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-field"
                />
                <div className="action-controls">
                  <FormControl className="filter-control">
                    <InputLabel>Filter</InputLabel>
                    <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="Wholesale">Wholesale</MenuItem>
                      <MenuItem value="Retail">Retail</MenuItem>
                    </Select>
                  </FormControl>
                  <div className="action-buttons">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUpdate}
                      disabled={!selectedRow}
                      className="action-button"
                    >
                      Update
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleDelete}
                      disabled={!selectedRow}
                      className="action-button"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
              
              <Paper className="data-grid-container">
                <DataGrid
                  rows={filteredRows}
                  columns={columns}
                  loading={loading}
                  pageSizeOptions={[5, 10]}
                  checkboxSelection={false}
                  onRowClick={(params) => setSelectedRow(params.row)}
                  sx={{ border: 0 }}
                  className="customer-grid"
                />
              </Paper>
            </div>
          </TabPanel>
        </Box>
      </div>
      
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={modalStyle} className="update-modal">
          <Typography variant="h6" component="h2" className="modal-title">
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
            helperText="Enter multiple numbers separated by commas"
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
            className="modal-button"
          >
            Save Changes
          </Button>
        </Box>
      </Modal>
    </div>
  );
}