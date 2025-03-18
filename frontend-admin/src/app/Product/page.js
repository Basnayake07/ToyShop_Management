'use client';

import React, { useState, useEffect } from "react";
import "@/styles/ProductList.css";
import { FaStar } from "react-icons/fa";
import { DataGrid } from "@mui/x-data-grid";
import { Paper, Modal, Box, Button } from "@mui/material";
import axios from "axios";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import AddProductForm from "@/components/AddProductForm"; // Import the AddProductForm component
import Sidebar from "@/components/Sidebar";

// ProductTable Component

const ProductTable = ({ products, handleMoreSettings }) => {
  const columns = [
    { field: 'productID', headerName: 'Product ID', width: 100 },
    {
      field: "image",
      headerName: "Product",
      width: 150,
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
    { field: "name", headerName: "Product Name", width: 200 },
    { field: "price", headerName: "Price", width: 100 },
    { field: "stock", headerName: "Stock", width: 100 },
    { field: "category", headerName: "Category", width: 130 },
    {
      field: "rating",
      headerName: "Rating",
      width: 130,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <FaStar style={{ color: "#FFD700" }} />
          {params.value}
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "More",
      width: 80,
      renderCell: (params) => (
        <div style={{ cursor: "pointer" }} onClick={() => handleMoreSettings(params.row.productID)}>
          &#x22EE;
        </div>
      ),
    },
  ];

  return (
    <Paper sx={{ height: 500, width: "100%" }}>
      <DataGrid 
        rows={products} 
        columns={columns} 
        pageSizeOptions={[5, 10]} 
        checkboxSelection 
        rowHeight={100}
        sx={{ border: 0 }}
        getRowId={(row) => row.productID} />
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

  useEffect(() => {
    // Fetch product data from the backend
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/products"); // Adjust the URL if necessary
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

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

  const handleMoreSettings = (productId) => {
    // Handle more settings click event
    console.log(`More settings for product ID: ${productId}`);
  };

  const handleOpen = () => setOpen(true); // Function to open the modal
  const handleClose = () => setOpen(false); // Function to close the modal

  return (
    <div style={{ display: "flex", backgroundColor: "#f0f0f0" }}>
      {/* Sidebar */}
      <Sidebar />
    <div className="product-container">
      
      {/* Top Bar */}
      <div className="product-header">
        <input 
          type="text" 
          placeholder="Search" 
          className="search-box" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select 
          className="filter-dropdown"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
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
        >
          <option value="">Age-wise</option>
          <option value="0-2 months">0-2 months</option>
          <option value="1-3 years">1-3 years</option>
          <option value="4-8 years">4-8 years</option>
          <option value="12+ years">12+ years</option>
        </select>
        <button className="export-btn">⬇ Export</button>
        <Button onClick={handleOpen} className="add-btn">+ Add New Product</Button> {/* Open modal on click */}
        <button className="order-btn">📝 Set Order</button>
      </div>

      <ProductTable products={filteredProducts} handleMoreSettings={handleMoreSettings} />

      {/* Modal for Add Product Form */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={{ ...modalStyle }}>
          <AddProductForm onClose={handleClose} /> {/* Render AddProductForm inside the modal */}
        </Box>
      </Modal>
    </div>
    </div>
  );
};

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
