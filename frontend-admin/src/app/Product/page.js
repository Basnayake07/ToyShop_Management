
'use client';


import React, { useState, useEffect } from "react";
import "@/styles/ProductList.css";
import { FaStar } from "react-icons/fa";
import { DataGrid } from "@mui/x-data-grid";
import { Paper, Modal, Box, Button } from "@mui/material";
import axios from "axios";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import AddProductForm from "@/components/AddProductForm";
import Sidebar from "@/components/Sidebar";
import OrderModal from "@/components/OrderModal";



const ProductTable = ({ products, handleMoreSettings,onSelectionChange }) => {
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const columns = [
    { field: 'productID', headerName: 'Product ID', width: 80 },
    {
      field: "image",
      headerName: "Product",
      width: 130,
      renderCell: (params) => {
        const imageUrl = params.value;
        console.log("Image URL:", imageUrl);


        return (
          <LazyLoadImage
            src={imageUrl}
            alt="product"
            effect="blur"
            onError={(e) => {
              console.log("Error loading image:", imageUrl);
              e.target.src = "https://dummyimage.com/150/cccccc/000000.png&text=No+Image";
            }}
            style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 5 }}
          />
        );
      },
    },
    { field: "name", headerName: "Product Name", width: 160},
    { field: "wholesalePrice", headerName: "Wholesale Price", width: 100 },
    { field: "retailPrice", headerName: "Retail Price", width: 100 },
    { field: "quantity", headerName: "Stock", width: 80 },
    { field: "category", headerName: "Category", width: 130 },
    {
      field: "productRating",
      headerName: "Rating",
      width: 80,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <FaStar style={{ color: "#FFD700" }} />
          {params.value}
        </div>
      ),
    },
    
  ];

  const handleRowSelectionChange = (ids) => {
    setRowSelectionModel(ids); // Update the selected row IDs in state

    // Get the currently selected rows based on IDs
    const selectedRows = products.filter((product) => ids.includes(product.productID));

    // Get the current session ID
    const currentSessionID = sessionStorage.getItem("sessionID");

    // Check if this is the first selection after a session clear
    const previousProducts = currentSessionID
      ? [] // If we have a session ID, start fresh
      : JSON.parse(sessionStorage.getItem("selectedProducts")) || [];

    // Merge products
    const mergedProducts = [
      ...previousProducts,
      ...selectedRows.filter(
        (newProd) => !previousProducts.some((prev) => prev.productID === newProd.productID)
      ),
    ];

    // Save to session
    sessionStorage.setItem("selectedProducts", JSON.stringify(mergedProducts));
    sessionStorage.removeItem("sessionID"); // Remove the session ID so future selections merge normally

    // Update parent state
    onSelectionChange(mergedProducts);
  };


  return (
    <Paper sx={{ height: 700, width: "100%" }}>
      <DataGrid
        rows={products}
        columns={columns}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        rowHeight={100}
        sx={{ border: 0 }}
        getRowId={(row) => row.productID}
        rowSelectionModel={rowSelectionModel} // Controlled selection model
        onRowSelectionModelChange={handleRowSelectionChange} // Use the refactored function
      />
    </Paper>
  );
};


const Product = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
  const [open, setOpen] = useState(false); // State to manage modal open/close
  const [orderModalOpen, setOrderModalOpen] = useState(false); // State to manage order modal visibility
  const [selectedProducts, setSelectedProducts] = useState([]); // State to store selected products
  const [selectedCustomer, setSelectedCustomer] = useState(null); // State to store selected customer
  const [rowSelectionModel, setRowSelectionModel] = useState([]);


  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/products"); // Adjust the URL if necessary
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };


  useEffect(() => {
    // Fetch product data from the backend
    fetchProducts();
  }, []);


  useEffect(() => {
    if (selectedCustomer) {
      axios
        .get(`http://localhost:8081/api/products?cusType=${selectedCustomer.cusType}`)
        .then((response) => setProducts(response.data))
        .catch((error) => console.error("Error fetching products:", error));
    }
  }, [selectedCustomer]);


  useEffect(() => {
    // Filter products based on search query, category, and age group
    const filtered = products.filter(product => {
      const matchesSearchQuery = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
      const matchesAgeGroup = selectedAgeGroup ? product.ageGrp === selectedAgeGroup : true;
      return matchesSearchQuery && matchesCategory && matchesAgeGroup;
    });
    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, selectedAgeGroup, products]);


  // Add this to your Product component
useEffect(() => {
  // Check if there's a new session ID each time orderModalOpen changes
  const currentSessionID = sessionStorage.getItem("sessionID");
 
  if (orderModalOpen && currentSessionID) {
    // If there's a session ID and we're opening the modal,
    // make sure our local state is in sync
    const storedProducts = sessionStorage.getItem("selectedProducts");
    if (!storedProducts || storedProducts === "[]") {
      setSelectedProducts([]);
    } else {
      try {
        setSelectedProducts(JSON.parse(storedProducts));
      } catch (e) {
        console.error("Error parsing stored products:", e);
        setSelectedProducts([]);
      }
    }
  }
}, [orderModalOpen]);


  /* // Handle product selection from table
  const handleProductSelection = (selection) => {
    const selectedItems = products.filter(product => selection.includes(product.productID));
    setSelectedProducts(selectedItems);
  }; */


  const handleMoreSettings = (productId) => {
    // Handle more settings click event
    console.log(`More settings for product ID: ${productId}`);
  };


  const handleOpen = () => setOpen(true); // Function to open the modal
  const handleClose = () => setOpen(false); // Function to close the modal


  const handleProductAdded = async () => {
  await fetchProducts(); // Fetch the latest products after a new product is added
  
};


  const handleOpenOrderModal = () => setOrderModalOpen(true);
  const handleCloseOrderModal = () => setOrderModalOpen(false);
 
  const clearSessionFromProduct = () => {
    console.log("Clearing session from Product component");
    //sessionStorage.clear();
    setSelectedProducts([]);
  };


 return (
  <div style={{ display: "flex", minHeight: "100vh", background: "#f6f8fa" }}>
    {/* Sidebar */}
    <Sidebar />

    <div className="product-container" style={{
      flex: 1,
      padding: "32px 40px",
      background: "#fff",
      borderRadius: "16px",
      margin: "32px auto",
      boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
      maxWidth: 1200
    }}>
      <h1 style={{
        fontSize: "2.5rem",
        fontWeight: 700,
        marginBottom: 24,
        color: "	#111111",
        letterSpacing: 1
      }}>
        Products
      </h1>

      {/* Top Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        marginBottom: 24,
        flexWrap: "wrap"
      }}>
        <input
          type="text"
          placeholder="Search"
          className="search-box"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #ccc",
            minWidth: 180
          }}
        />
        <select
          className="filter-dropdown"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: "8px", borderRadius: 6, border: "1px solid #ccc" }}
        >
          <option value="">Category</option>
          <option value="Birthday Deco">Birthday Deco</option>
          <option value="Soft Toys">Soft Toys</option>
          <option value="Educational Toys">Educational Toys</option>
          <option value="Christmas Deco">Christmas Deco</option>
          <option value="Other Toys">Other Toys</option>
        </select>
        <select
          className="filter-dropdown"
          value={selectedAgeGroup}
          onChange={(e) => setSelectedAgeGroup(e.target.value)}
          style={{ padding: "8px", borderRadius: 6, border: "1px solid #ccc" }}
        >
          <option value="">Age-wise</option>
          <option value="0-12 months">0-12 months</option>
          <option value="1-4 years">1-4 years</option>
          <option value="4-8 years">4-8 years</option>
          <option value="12+ years">12+ years</option>
        </select>
        <Button
          onClick={handleOpen}
          variant="contained"
          color="primary"
          style={{ fontWeight: 600 }}
        >
          + Add New Product
        </Button>
        <Button
          onClick={handleOpenOrderModal}
          variant="outlined"
          color="secondary"
          style={{ fontWeight: 600 }}
        >
          📝 Place Order
        </Button>
      </div>

      {/* Product Table */}
      <ProductTable
        products={filteredProducts}
        handleMoreSettings={handleMoreSettings}
        onSelectionChange={setSelectedProducts}
      />

      {/* Order Modal */}
      <OrderModal
        isOpen={orderModalOpen}
        onClose={handleCloseOrderModal}
        selectedProducts={selectedProducts}
        setSelectedProducts={setSelectedProducts}
        setRowSelectionModel={setRowSelectionModel}
      />

      {/* Modal for Add Product Form */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={{ ...modalStyle }}>
          <AddProductForm onClose={handleClose} onProductAdded={handleProductAdded} />
        </Box>
      </Modal>
    </div>
  </div>
);
}


// Modal styling
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxHeight: '80vh', // Set maximum height
  overflowY: 'auto',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};




export default Product;



