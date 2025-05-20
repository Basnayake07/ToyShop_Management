import React, { useState, useEffect } from "react";
import { TextField, Button, Typography, Paper, Autocomplete } from "@mui/material";
import axios from "axios";
import debounce from "lodash/debounce";

const AddBatchForm = ({ onClose, onBatchAdded }) => {
  const [batch, setBatch] = useState({
    batchID: "",
    productID: "",
    receivedDate: "",
    quantity: "",
    cost: "",
    wholesalePrice: "",
    retailPrice: "",
    minStock: ""
  });
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBatch({ ...batch, [name]: value });
  };

  const handleProductSelect = (event, value) => {
    if (value) {
      setBatch({ ...batch, productID: value.productID });
    }
  };

  const handleSearchChange = debounce(async (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (value) {
      try {
        const response = await axios.get(`http://localhost:8081/api/products?search=${value}`);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    } else {
      setProducts([]);
    }
  }, 300);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post("http://localhost:8081/api/inventory", batch, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
      alert("Inventory batch added successfully!");
      console.log(response.data);
      onClose();
      onBatchAdded();
  } catch (error) {
    if (error.response && error.response.status === 403) {
      alert(error.response.data.message); 
    }
  }
};

  return (
    <Paper style={{ padding: 20, maxWidth: 500, margin: "auto", marginTop: 20 }}>
      <Typography variant="h5" gutterBottom>
        Add Inventory Batch
      </Typography>
      <form onSubmit={handleSubmit}>
        <Autocomplete
          options={products}
          getOptionLabel={(option) => `${option.productID} - ${option.name}`}
          onChange={handleProductSelect}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Product"
              onChange={handleSearchChange}
              required
              fullWidth
              margin="normal"
            />
          )}
        />
        <TextField
          label="Received Date"
          name="receivedDate"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={batch.receivedDate}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Quantity"
          name="quantity"
          type="number"
          value={batch.quantity}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Cost"
          name="cost"
          type="number"
          value={batch.cost}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Wholesale Price"
          name="wholesalePrice"
          type="number"
          value={batch.wholesalePrice}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Retail Price"
          name="retailPrice"
          type="number"
          value={batch.retailPrice}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Minimum Stock"
          name="minStock"
          type="number"
          value={batch.minStock}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: 20 }}>
          Add Batch
        </Button>
      </form>
    </Paper>
  );
};

export default AddBatchForm;