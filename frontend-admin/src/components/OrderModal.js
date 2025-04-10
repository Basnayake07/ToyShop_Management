import React, { useState, useEffect } from "react";
import { Modal, Box, Button, TextField, IconButton, Autocomplete } from "@mui/material";
import { FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import axios from "axios";

const OrderModal = ({ isOpen, onClose, selectedProducts, setSelectedProducts }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [quantities, setQuantities] = useState({}); // Local state for quantities
  const [errors, setErrors] = useState({}); // Local state for error messages
  const router = useRouter();

  useEffect(() => {
    axios.get("http://localhost:8081/api/customers")
      .then(response => setCustomers(response.data))
      .catch(error => console.error("Error fetching customers:", error));
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      //console.log("Selected Customer:", selectedCustomer); // Debugging: Check selected customer details
  
      // Update product prices based on customer type
      const updatedProducts = selectedProducts.map((product) => {
        console.log("Original Product:", product); // Debugging: Check original product details
  
        const price = (() => {
          console.log("Customer Type:", selectedCustomer.cusType); // Debugging: Check customer type
          console.log("Wholesale Price:", product.wholesalePrice); // Debugging: Check wholesale price
          console.log("Retail Price:", product.retailPrice); // Debugging: Check retail price
        
          return selectedCustomer.cusType === "Wholesale"
            ? product.wholesalePrice
            : product.retailPrice;
        })();
  
        console.log(
          `Customer Type: ${selectedCustomer.cusType}, Product ID: ${product.productID}, Price: ${price}`
        ); // Debugging: Check calculated price based on customer type
  
        return {
          ...product,
          price, // Add or update the price field
        };
      });
  
      //console.log("Updated Products:", updatedProducts); // Debugging: Check updated products with new prices
      setSelectedProducts(updatedProducts); // Update the selectedProducts state
    }
  }, [selectedCustomer]);

  const handleClose = () => {
    setSelectedCustomer(null); // Reset selected customer
    setQuantities({}); // Clear quantities
    setErrors({}); // Clear errors
    onClose(); // Call the parent onClose function
  };

  // Handle Quantity Update
  const updateQuantity = (index, value) => {
    //console.log(`Updating quantity for index ${index} with value ${value}`);
    const product = selectedProducts[index];

    // Validate quantity
    if (value < 1) {
      console.log(`Validation failed: Quantity must be at least 1 for product ${product.productID}`);
      setErrors((prevErrors) => ({
        ...prevErrors,
        [product.productID]: "Quantity must be at least 1.",
      }));
      return;
    }

    if (value > product.quantity) {
      console.log(`Stock validation failed for product ${product.productID}. Entered: ${value}, Available: ${product.stock}`);
      setErrors((prevErrors) => ({
        ...prevErrors,
        [product.productID]: `Stock is not enough. Available stock: ${product.quantity}`,
      }));
      return;
    }

    // Clear error if validation passes
    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      delete updatedErrors[product.productID];
      //console.log("Updated Errors:", updatedErrors);
      return updatedErrors;
    });

    // Update the quantities state
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [product.productID]: value,
    }));
  };

  // Remove Item
  const removeProduct = (index) => {
    const product = selectedProducts[index];
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
    setQuantities((prevQuantities) => {
      const updatedQuantities = { ...prevQuantities };
      delete updatedQuantities[product.productID];
      return updatedQuantities;
    });
    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      delete updatedErrors[product.productID];
      return updatedErrors;
    });
  };

  // Calculate Total Price
  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => {
      const quantity = quantities[product.productID] || 0;
      const price = selectedCustomer?.cusType === "Wholesale" ? product.wholesalePrice : product.retailPrice;
      return total + price * quantity;
    }, 0).toFixed(2);
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
  
    // Prepare the order data
    const orderData = {
      cusID: selectedCustomer.cusID, // Use cusID from the selected customer
      products: selectedProducts.map((product) => ({
        productID: product.productID,
        quantity: quantities[product.productID] || 0,
        price: product.price, // Use the price field from the product
      })),
      totalPrice: calculateTotal(), // Calculate the total price
    };
  
    // Send the order data to the backend
    axios
      .post("http://localhost:8081/api/orders", orderData)
      .then(() => {
        alert("Order placed successfully!");
        onClose(); // Close the modal after placing the order
      })
      .catch((error) => {
        console.error("Error placing order:", error.response?.data || error.message);
        alert("Failed to place order.");
      });
  };

  
  return (
    <Modal open={isOpen} onClose={handleClose}>
      <Box sx={{ ...modalStyle }}>
        <h2>My Order</h2>

              {/* Customer Search */}
        <Autocomplete
        options={customers}
        getOptionLabel={(customer) => `${customer.name} (ID: ${customer.cusID})`}
        onChange={(event, newValue) => {
          //console.log("Customer Selected:", newValue); // Debugging: Check selected customer
          setSelectedCustomer(newValue);
        }}
        renderInput={(params) => <TextField {...params} label="Select Customer" />}
      />
        <Button variant="contained" onClick={navigateToCustomerPage}>+ New Customer</Button>

        {selectedProducts.map((product, index) => (
          <div key={product.productID} className="order-item">
            <p>{product.name}</p>
            <TextField
              type="number"
              placeholder="Enter quantity"
              value={quantities[product.productID] || ""}
              onChange={(e) => {
                const value = e.target.value;

                // Allow empty field while typing
                if (value === "") {
                  setQuantities((prev) => ({
                    ...prev,
                    [product.productID]: "",
                  }));
                  setErrors((prevErrors) => ({
                    ...prevErrors,
                    [product.productID]: "Quantity is required.",
                  }));
                  return;
                }

                const parsedValue = parseInt(value);

                // Update immediately on every change
                updateQuantity(index, parsedValue);
              }}
              error={!!errors[product.productID]} // Highlight textbox if there's an error
              helperText={errors[product.productID] || ""} // Display error message below the textbox
            />
            <span>
              Rs.{" "}
              {(
                (quantities[product.productID] || 0) *
                (product.price || 0) // Use the updated price field
              ).toFixed(2)}
            </span>
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
