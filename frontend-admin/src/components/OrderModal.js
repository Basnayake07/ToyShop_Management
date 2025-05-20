'use client'

import React, { useState, useEffect } from "react";
import { Modal, Box, Button, TextField, IconButton, Autocomplete } from "@mui/material";
import { FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import InvoiceModal from "./InvoiceModal";
import axios from "axios";


const OrderModal = ({ isOpen, onClose, selectedProducts, setSelectedProducts, setRowSelectionModel  }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [quantities, setQuantities] = useState({}); // Local state for quantities
  const [errors, setErrors] = useState({}); // Local state for error messages
  const [adminID, setAdminID] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null); 
  
  const router = useRouter();

  useEffect(() => {
    // Fetch adminID from localStorage or sessionStorage
    const storedAdminID = localStorage.getItem("adminID") || sessionStorage.getItem("adminID");
    if (storedAdminID) {
      setAdminID(storedAdminID);
    } else {
      console.error("Admin ID not found in storage");
    }
  }, []);


  useEffect(() => {
    axios.get("http://localhost:8081/api/customers")
      .then(response => setCustomers(response.data))
      .catch(error => console.error("Error fetching customers:", error));
  }, []);

useEffect(() => {
  if (selectedCustomer && selectedProducts.length > 0) {
    // For each product, fetch discount if wholesale, else set retail price
    const updatePrices = async () => {
      const updatedProducts = await Promise.all(selectedProducts.map(async (product, idx) => {
        let price = selectedCustomer.cusType === "Wholesale" ? product.wholesalePrice : product.retailPrice;
        let discountPercent = 0;
        if (selectedCustomer.cusType === "Wholesale") {
          try {
            const today = new Date().toISOString().split('T')[0];
            const qty = quantities[product.productID] || 0;
            const res = await axios.get(
              `http://localhost:8081/api/discounts?productID=${product.productID}&qty=${qty}&date=${today}`
            );
            discountPercent = res.data.discount_percent || 0;
            if (discountPercent > 0) {
              price = (product.wholesalePrice * (1 - discountPercent / 100)).toFixed(2);
            }
          } catch (err) {
            console.error("Error fetching discount:", err);
          }
        }
        return {
          ...product,
          price: parseFloat(price),
          discountPercent,
        };
      }));
      setSelectedProducts(updatedProducts);
    };
    updatePrices();
  }
  // eslint-disable-next-line
}, [selectedCustomer, selectedProducts.length]);

  useEffect(() => {
    if (isOpen) {
      const savedCustomer = sessionStorage.getItem("selectedCustomer");
      const savedProducts = sessionStorage.getItem("selectedProducts");
      const savedQuantities = sessionStorage.getItem("quantities");
 
      // Debugging: Log the retrieved data
      console.log("Session Storage Data on Modal Open:", {
        savedCustomer: savedCustomer ? JSON.parse(savedCustomer) : null,
        savedProducts: savedProducts ? JSON.parse(savedProducts) : null,
        savedQuantities: savedQuantities ? JSON.parse(savedQuantities) : null,
      });
 
      // Update state with retrieved data or reset if no data exists
      setSelectedCustomer(savedCustomer ? JSON.parse(savedCustomer) : null);
      setSelectedProducts(savedProducts ? JSON.parse(savedProducts) : []);
      setQuantities(savedQuantities ? JSON.parse(savedQuantities) : {});
    }
  }, [isOpen]);


  useEffect(() => {
  if (isOpen) {
    const returnToOrder = sessionStorage.getItem("returnToOrder");
    if (returnToOrder) {
      sessionStorage.removeItem("returnToOrder");
      const savedCustomer = sessionStorage.getItem("selectedCustomer");
      const savedProducts = sessionStorage.getItem("selectedProducts");
      const savedQuantities = sessionStorage.getItem("quantities");


      if (savedCustomer) setSelectedCustomer(JSON.parse(savedCustomer));
      if (savedProducts) setSelectedProducts(JSON.parse(savedProducts));
      if (savedQuantities) setQuantities(JSON.parse(savedQuantities));
    }
  }
}, [isOpen]);


 


  const handleClose = () => {
    setSelectedCustomer(null); // Reset selected customer
    setQuantities({}); // Clear quantities
    setErrors({}); // Clear errors
    onClose(); // Call the parent onClose function
  };


  const handleAddNewProducts = () => {
    // Save order details in sessionStorage
    sessionStorage.setItem("selectedCustomer", JSON.stringify(selectedCustomer));
    sessionStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
    sessionStorage.setItem("quantities", JSON.stringify(quantities));
 
    // Debugging: Log the data being saved
    console.log("Saving to Session Storage:", {
      selectedCustomer,
      selectedProducts,
      quantities,
    });
 
    // Close the modal
    onClose();
 
    // Redirect to the product page
    router.push("/Product");
  };


  // Handle Quantity Update
  const updateQuantity = (index, value) => {
    //console.log(`Updating quantity for index ${index} with value ${value}`);
    const product = selectedProducts[index];


    // Validate quantity
    if (value < 0) {
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
    // Always use the current product.price, which may be discounted
    return total + (product.price || 0) * quantity;
  }, 0).toFixed(2);
};


  // Redirect to Customer Registration & Save State
  const navigateToCustomerPage = () => {
    sessionStorage.setItem("returnToOrder", "true");
    router.push("/Customer");
  };


  // Clear Session Storage
  const handleClearSession = () => {


    // Generate a unique session ID
  const sessionID = Date.now().toString();
 
  // Clear all session storage
  sessionStorage.clear();
 
  // Set a new session ID to mark this as a fresh session
  sessionStorage.setItem("sessionID", sessionID);
 
  // Reset all local state variables
  setSelectedCustomer(null);
  setSelectedProducts([]);
  setQuantities({});
  setErrors({});
 
  // Important: Also update the parent component's state
  // This directly communicates to the parent component (Product page)
  if (typeof setSelectedProducts === 'function') {
    setSelectedProducts([]);
  }
 
  console.log("Session cleared with new ID:", sessionID);
    alert("Session cleared successfully!");
  
    // Clear the selected rows in the DataGrid
    if (typeof setRowSelectionModel === "function") {
      setRowSelectionModel([]); // Reset the selection
    }
  };

  const fetchDiscountAndUpdatePrice = async (index, value) => {
  const product = selectedProducts[index];
  let price = selectedCustomer?.cusType === "Wholesale" ? product.wholesalePrice : product.retailPrice;
  let discountPercent = 0;

  if (selectedCustomer?.cusType === "Wholesale") {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await axios.get(
        `http://localhost:8081/api/discounts?productID=${product.productID}&qty=${value}&date=${today}`
      );
      discountPercent = res.data.discount_percent || 0;
      if (discountPercent > 0) {
        price = (product.wholesalePrice * (1 - discountPercent / 100)).toFixed(2);
      }
    } catch (err) {
      console.error("Error fetching discount:", err);
    }
  }

  // Update product price and discountPercent in selectedProducts
  const updatedProducts = [...selectedProducts];
  updatedProducts[index] = {
    ...product,
    price: parseFloat(price),
    discountPercent,
  };
  setSelectedProducts(updatedProducts);
};


    /* // Set a special flag
  sessionStorage.setItem("freshStart", "true");


    sessionStorage.removeItem("selectedCustomer");
    sessionStorage.removeItem("selectedProducts");
    sessionStorage.removeItem("quantities");
    sessionStorage.removeItem("returnToOrder");


 


    // Reset local state
    setSelectedCustomer(null);
    setSelectedProducts([]);
    setQuantities({});
    setErrors({});


    // Debugging: Log the cleared states
  console.log("Session cleared. States reset:", {
    selectedCustomer: null,
    selectedProducts: [],
    quantities: {},
    errors: {},
  });


  console.log("Session Storage After Clearing:", {
    selectedCustomer: sessionStorage.getItem("selectedCustomer"),
    selectedProducts: sessionStorage.getItem("selectedProducts"),
    quantities: sessionStorage.getItem("quantities"),
  });


    alert("Session cleared. Please select a customer and products again."); */
  


  const placeOrder = async () => {
    if (!selectedCustomer) {
      alert("Please select a customer");
      return;
    }
  
    if (!adminID) {
      alert("Admin ID is missing. Please log in again.");
      return;
    }
  
    // Prepare the order data
    const orderData = {
      cusID: selectedCustomer.cusID, // Use cusID from the selected customer
      adminID,
      cusType: selectedCustomer.cusType,
      products: selectedProducts.map((product) => ({
        productID: product.productID,
        quantity: quantities[product.productID] || 0,
        price: product.price, // Use the price field from the product
      })),
      totalPrice: calculateTotal(), // Calculate the total price
    };
  
    try {
      // Send the order data to the backend
      const response = await axios.post("http://localhost:8081/api/orders", orderData);
      alert("Order placed successfully!");
  
      // Fetch the order details for the invoice
      const orderResponse = await axios.get(`http://localhost:8081/api/orders/${response.data.orderID}`);
      setOrderDetails(orderResponse.data); // Set the order details for the invoice
      console.log("Order Response:", orderResponse.data);
      setInvoiceModalOpen(true); // Open the InvoiceModal

      // Ensure orderDetails is set before opening the modal
    if (orderResponse.data && orderResponse.data.order && orderResponse.data.items) {
      setInvoiceModalOpen(true); // Open the InvoiceModal
    } else {
      console.error("Order details are incomplete:", orderResponse.data);
    }

    // Clear session storage after successful order placement
    sessionStorage.clear();
    console.log("Session storage cleared after order placement.");

    // Reset local state
    setSelectedCustomer(null);
    setSelectedProducts([]);
    setQuantities({});
    setErrors({});

    onClose(); // Close the OrderModal
      if (typeof setRowSelectionModel === "function") {
        setRowSelectionModel([]); // Reset the selection
      }
    } catch (error) {
      console.error("Error placing order:", error.response?.data || error.message);
      alert("Failed to place order.");
    }
  };






  return (
    <>
    <Modal open={isOpen} onClose={handleClose}>
      <Box sx={{ ...modalStyle }}>
        <h2>My Order</h2>


              {/* Customer Search */}
              <Autocomplete
                options={customers}
                getOptionLabel={(customer) => `${customer.name} (ID: ${customer.cusID})`}
                value={selectedCustomer} // Bind the value to the selectedCustomer state
                onChange={(event, newValue) => {
                  console.log("Customer Selected:", newValue); // Debugging: Check selected customer
                  setSelectedCustomer(newValue);
                }}
                renderInput={(params) => <TextField {...params} label="Select Customer" />}
              />
        <Button variant="contained" onClick={navigateToCustomerPage}>+ New Customer</Button>


        {selectedProducts.map((product, index) => {
  console.log("Rendering Product:", product);
  return (
    <div key={product.productID} className="order-item">
      <p>{product.name}</p>
      <TextField
        type="number"
        placeholder="Enter quantity"
        value={quantities[product.productID] || ""}
        onChange={(e) => {
          const value = parseInt(e.target.value) || 0;
          updateQuantity(index, value);
          fetchDiscountAndUpdatePrice(index, value);
        }}
        error={!!errors[product.productID]}
        helperText={errors[product.productID] || ""}
      />
      <span>
        Rs.{" "}
        {(
          (quantities[product.productID] || 0) *
          (product.price || 0)
        ).toFixed(2)}
        {selectedCustomer?.cusType === "Wholesale" && product.discountPercent
          ? ` (Discount: ${product.discountPercent}%)`: ""}
      </span>
      <IconButton onClick={() => removeProduct(index)}>
        <FaTrash />
      </IconButton>
    </div>
  );
})}


        <h3>Total: Rs.{calculateTotal()}</h3>
        <Button variant="contained" color="primary" onClick={placeOrder}>Place Order</Button>
        <Button variant="outlined" onClick={handleAddNewProducts}>Add New Products</Button>
        <Button variant="outlined" onClick={handleClearSession}>clear session</Button>
      </Box>
    </Modal>

    <InvoiceModal
      isOpen={invoiceModalOpen}
      onClose={() => setInvoiceModalOpen(false)}
      orderDetails={orderDetails}
     
      />
      </>
  );
};


// Modal Styling
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  maxHeight: "80vh",         
  overflowY: "auto",         
  bgcolor: "white",
  boxShadow: 24,
  p: 4,
};

export default OrderModal;



