import { useState } from "react";
import axios from "axios";
import { TextField, Button, Container, Typography, Box, Alert } from "@mui/material";

const EmployeeRegisterForm = () => {
  const [formData, setFormData] = useState({
    adminID: "",
    name: "",
    address: "",
    email: "",
    phoneNumbers: [""],
    role: "",
    password: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem("token");
    console.log("Retrived token:", token);
    if (!token) {
      setMessage("Access denied. No token provided.");
      return;
    }

    const requestData = {
      ...formData,
      phoneNumbers: formData.phoneNumbers.split(",").map((number) => number.trim()) 
    };

    try {
      const response = await axios.post("http://localhost:8081/api/auth/register", {
        ...formData,
        phoneNumbers: formData.phoneNumbers.split(",")
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Server error");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, p: 3, boxShadow: 3, borderRadius: 2, bgcolor: "background.paper" }}>
        <Typography variant="h5" gutterBottom>
          Register Employee
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField fullWidth margin="normal" label="Admin ID" name="adminID" value={formData.adminID} onChange={handleChange} required />
          <TextField fullWidth margin="normal" label="Name" name="name" value={formData.name} onChange={handleChange} required />
          <TextField fullWidth margin="normal" label="Address" name="address" value={formData.address} onChange={handleChange} required />
          <TextField fullWidth margin="normal" label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
          <TextField fullWidth margin="normal" label="Phone Numbers (comma separated)" name="phoneNumbers" value={formData.phoneNumbers} onChange={handleChange} required />
          <TextField fullWidth margin="normal" label="Role" name="role" value={formData.role} onChange={handleChange} required />
          <TextField fullWidth margin="normal" label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required />
          <Button fullWidth variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
            Register
          </Button>
        </form>
        {message && <Alert severity="info" sx={{ mt: 2 }}>{message}</Alert>}
      </Box>
    </Container>
  );
};

export default EmployeeRegisterForm;
