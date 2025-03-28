import React, { useState, useEffect } from "react";
import { Modal, Box, Button, TextField, IconButton, Autocomplete } from "@mui/material";
import { FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import axios from "axios";

const OrderModal = ({ isOpen, onClose, selectedProducts, setSelectedProducts }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const router = useRouter();

  useEffect(() => {
    axios.get("http://localhost:8081/api/customers")
      .then(response => setCustomers(response.data))
      .catch(error => console.error("Error fetching customers:", error));
  }, []);

  // Handle Quantity Update
  const updateQuantity = (index, value) => {
    if (value < 1) return;
    const updatedProducts = [...selectedProducts];
    updatedProducts[index].quantity = value;
    setSelectedProducts(updatedProducts);
  };

  // Remove Item
  const removeProduct = (index) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  // Calculate Total Price
  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => total + product.retailPrice * product.quantity, 0).toFixed(2);
  };

  // Redirect to Customer Registration & Save State
  const navigateToCustomerPage = () => {
    sessionStorage.setItem("returnToOrder", "true");
    router.push("/Customer");
  };

  // Handle Place Order
  const placeOrder = () => {
    if (!selectedCustomer) {
      alert("Please select a customer");
      return;
    }

    const orderData = {
      customerId: selectedCustomer.id,
      products: selectedProducts.map(p => ({ productID: p.productID, quantity: p.quantity })),
      total: calculateTotal()
    };

    axios.post("http://localhost:8081/api/orders", orderData)
      .then(() => {
        alert("Order placed successfully!");
        onClose(); // Close modal after order is placed
      })
      .catch(error => console.error("Error placing order:", error));
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={{ ...modalStyle }}>
        <h2>My Order</h2>

        {/* Customer Search */}
        <Autocomplete
          options={customers}
          getOptionLabel={(customer) => `${customer.name} (ID: ${customer.cusID})`}
          onChange={(event, newValue) => setSelectedCustomer(newValue)}
          renderInput={(params) => <TextField {...params} label="Select Customer" />}
        />
        <Button variant="contained" onClick={navigateToCustomerPage}>+ New Customer</Button>

        {selectedProducts.map((product, index) => (
          <div key={product.productID} className="order-item">
            <p>{product.name}</p>
            <TextField 
            type="number" 
            value={product.quantity} 
            onChange={(e) => updateQuantity(index, parseInt(e.target.value))} />
            <span>Rs.{(product.retailPrice * product.quantity).toFixed(2)}</span>
            <IconButton onClick={() => removeProduct(index)}><FaTrash /></IconButton>
          </div>
        ))}

        <h3>Total: Rs.{calculateTotal()}</h3>
        <Button variant="contained" color="primary" onClick={placeOrder}>Place Order</Button>
      </Box>
    </Modal>
  );
};

// Modal Styling
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",
  boxShadow: 24,
  p: 4,
};

export default OrderModal;
