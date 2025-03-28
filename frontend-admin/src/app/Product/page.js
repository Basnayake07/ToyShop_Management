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
import OrderModal from "@/components/OrderModal"; // Import OrderModal component

// ProductTable Component

const ProductTable = ({ products, handleMoreSettings,onSelectionChange }) => {
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
      field: "rating",
      headerName: "Rating",
      width: 80,
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
        getRowId={(row) => row.productID} 
        onRowSelectionModelChange={(ids) => {
          const selectedRows = products.filter((product) => ids.includes(product.productID));
          onSelectionChange(selectedRows); // Pass selected rows to the parent component
        }}/>
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
    // Filter products based on search query, category, and age group
    const filtered = products.filter(product => {
      const matchesSearchQuery = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
      const matchesAgeGroup = selectedAgeGroup ? product.ageGrp === selectedAgeGroup : true;
      return matchesSearchQuery && matchesCategory && matchesAgeGroup;
    });
    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, selectedAgeGroup, products]);

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

  const handleProductAdded = () => {
    fetchProducts(); // Fetch the latest products after a new product is added
  };

  const handleOpenOrderModal = () => setOrderModalOpen(true);
  const handleCloseOrderModal = () => setOrderModalOpen(false);
  


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

        <button className="order-btn" onClick={handleOpenOrderModal} >
          📝 Set Order</button>


         {/*  <div style={{ height: 500, width: "100%" }}> 
          <DataGrid
          rows={products}
          columns={[
            { field: "productID", headerName: "ID", width: 80 },
            { field: "name", headerName: "Product Name", width: 200 },
            { field: "wholesalePrice", headerName: "Price", width: 100 },
            { field: "stock", headerName: "Stock", width: 100 }
          ]}
          checkboxSelection
          onRowSelectionModelChange={handleProductSelection}
          getRowId={(row) => row.productID}
      />
      </div> */}


        <OrderModal
          isOpen={orderModalOpen}
          onClose={handleCloseOrderModal}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
        />


      </div>

      <ProductTable 
      products={filteredProducts} 
      handleMoreSettings={handleMoreSettings}
      onSelectionChange={setSelectedProducts} />

      {/* Modal for Add Product Form */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={{ ...modalStyle }}>
          <AddProductForm onClose={handleClose} onProductAdded={handleProductAdded} /> {/* Render AddProductForm inside the modal */}
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
