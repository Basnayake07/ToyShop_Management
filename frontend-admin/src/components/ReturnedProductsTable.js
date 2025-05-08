import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Paper, Typography } from "@mui/material";
import axios from "axios";

const ReturnedProductsTable = () => {
  const [returnedProducts, setReturnedProducts] = useState([]);

  useEffect(() => {
    const fetchReturnedProducts = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/returnsProducts");
        setReturnedProducts(response.data.items);
      } catch (error) {
        console.error("Error fetching returned products:", error);
      }
    };

    fetchReturnedProducts();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "productID", headerName: "Product ID", width: 150 },
    { field: "productName", headerName: "Product Name", width: 200 },
    { field: "quantity", headerName: "Quantity", width: 120 },
    { field: "note", headerName: "Note", width: 250 },
    {
      field: "addedAt",
      headerName: "Added At",
      width: 200,
      renderCell: (params) => (
        <span>{new Date(params.value).toLocaleDateString()}</span>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Returned Products
      </Typography>
      <Paper sx={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={returnedProducts}
          getRowId={(row) => row.id}
          columns={columns}
          pageSizeOptions={[5, 10]}
        />
      </Paper>
    </div>
  );
};

export default ReturnedProductsTable;