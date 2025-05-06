'use client';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { Paper, TextField, Button } from "@mui/material";
import "@/styles/Highlight.css";
import Sidebar from "@/components/Sidebar";
import UpdateInvoiceModal from "@/components/UpdateInvoiceModal"; 

const InvoicesTable = ({ invoices, onRowClick }) => {
    const columns = [
      { field: "invoiceID", headerName: "Invoice ID", width: 80 },
      { field: "orderID", headerName: "Order ID", width: 80 },
      { field: "customerName", headerName: "Customer Name", width: 120 },
      {
        field: "issue_date",
        headerName: "Issue Date",
        width: 120,
        renderCell: (params) => {
          const date = params.value ? new Date(params.value) : null;
          return <span>{date ? date.toISOString().split('T')[0] : "N/A"}</span>;
        },
      },
      {
        field: "payStatus",
        headerName: "Payment Status",
        width: 120,
        renderCell: (params) => (
          <span
            className={
              params.value === "Partially Paid" ? "highlight-cell" : ""
            }
          >
            {params.value}
          </span>
        ),
      },
      { field: "totalPrice", headerName: "Total Price (Rs.)", width: 120 },
      { field: "received_amount", headerName: "Received Amount (Rs.)", width: 150 },
      { field: "credit_amount", headerName: "Credit Amount (Rs.)", width: 120 },
      {
        field: "actions",
        headerName: "Actions",
        width: 100,
        renderCell: (params) => (
          <Button
            variant="contained"
            size="small"
            onClick={() => onRowClick(params.row.invoiceID)} // Pass the invoiceID to the handler
          >
            View
          </Button>
        ),
      },
    ];
  
    return (
      <Paper sx={{ height: 700, width: "100%" }}>
        <DataGrid
          rows={invoices}
          columns={columns}
          pageSizeOptions={[10, 20, 50]}
          rowHeight={60}
          sx={{ border: 0 }}
          getRowId={(row) => row.invoiceID}
        />
      </Paper>
    );
  };
  
  const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // Fetch all invoices
  const fetchInvoices = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/invoices");
      setInvoices(response.data);
      setFilteredInvoices(response.data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Filter invoices based on search query
  useEffect(() => {
    const filtered = invoices.filter((invoice) => {
      const query = searchQuery.toLowerCase();
      return (
        invoice.invoiceID.toLowerCase().includes(query) ||
        invoice.customerName.toLowerCase().includes(query) ||
        (invoice.orderID && invoice.orderID.toLowerCase().includes(query))
      );
    });
    setFilteredInvoices(filtered);
  }, [searchQuery, invoices]);

  // Fetch invoice details by invoiceID
  const fetchInvoiceDetails = async (invoiceID) => {
    try {
      const response = await axios.get(`http://localhost:8081/api/invoices/${invoiceID}`);
      setSelectedInvoice(response.data); // Set the fetched invoice details
      setOpenModal(true); // Open the modal
    } catch (error) {
      console.error("Error fetching invoice details:", error);
    }
  };

  const handleRowClick = (invoiceID) => {
    fetchInvoiceDetails(invoiceID); // Fetch invoice details when a row is clicked
  };

  const handleCloseModal = () => {
    setSelectedInvoice(null);
    setOpenModal(false);
  };

  return (
    <div style={{ display: "flex", backgroundColor: "#f0f0f0" }}>
      {/* Sidebar */}
      <Sidebar />
      <div style={{ flex: 1, padding: "20px" }}>
        {/* Top Bar */}
        <div className="invoices-header">
          <h2>Invoices</h2>
          <TextField
            label="Search Invoices"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: "20px", width: "300px" }}
          />
        </div>

        {/* Invoices Table */}
        <InvoicesTable invoices={filteredInvoices} onRowClick={handleRowClick} />

        {/* Invoice Details Modal */}
        <UpdateInvoiceModal
          isOpen={openModal}
          onClose={handleCloseModal}
          invoiceDetails={selectedInvoice}
        />
      </div>
    </div>
  );
};

export default Invoices;