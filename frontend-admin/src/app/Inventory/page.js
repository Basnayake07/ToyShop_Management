'use client';

import * as React from 'react';
import Sidebar from '@/components/Sidebar';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  Modal,
} from '@mui/material';
import AddBatchForm from '@/components/AddBatchForm';
import axios from 'axios';

const headCells = [
  { id: 'productID', label: 'Product ID' },
  {id: 'category', label: 'Category'},
  { id: 'receivedDate', label: 'Received Date' },
  { id: 'quantity', label: 'Quantity' },
  { id: 'cost', label: 'Cost' },
  { id: 'wholesalePrice', label: 'Wholesale Price' },
  { id: 'retailPrice', label: 'Retail Price' },
  { id: 'minStock', label: 'Min Stock' },
  { id: 'minProfitMargin', label: 'Min Profit Margin' },
];

const predefinedCategories = [
  "Birthday Deco",
  "Soft Toys",
  "Educational Toys",
  "Christmas Deco",
  "Other Toys"
];

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

export default function InventoryTable({ rows = [], onAdd, onUpdate, onDelete }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [search, setSearch] = React.useState('');
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [category, setCategory] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [inventory, setInventory] = React.useState([]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const fetchInventory = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/inventory/inventory");
      const inventoryData = response.data;

      // Fetch product details
      const productResponse = await axios.get("http://localhost:8081/api/products");
      const productData = productResponse.data;

      // Map category to inventory items
      const inventoryWithCategory = inventoryData.map(item => {
        const product = productData.find(p => p.productID === item.productID);
        return { ...item, category: product ? product.category : 'Unknown' };
      });
      
      // Adjust the URL if necessary
      setInventory(inventoryWithCategory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const handleBatchAdded = () => {
    fetchInventory(); // Fetch the latest inventory data after a new batch is added
  };

  React.useEffect(() => {
    fetchInventory(); // Fetch inventory data when the component mounts
  }, []);

  const filteredRows = inventory.filter(row =>
    row.productID.toLowerCase().includes(search.toLowerCase()) &&
    (category === '' || row.category === category)
  );

  React.useEffect(() => {
  inventory.forEach((row, index) => {
    console.log(`Key: ${row.productID}-${row.receivedDate} (Index: ${index})`);
});
}, [inventory]);

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ width: '100%', padding: '20px' }}>
        {/* Top Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: '250px' }}
          />
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            displayEmpty
            sx={{ width: '200px', marginLeft: '10px' }}
          >
            <MenuItem value="">All Categories</MenuItem>
            {predefinedCategories.map(cat => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
          <Box>
            <Button variant="contained" color="success" onClick={handleOpen} sx={{ marginRight: '10px' }}>
              Add New Batch
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => onDelete(selectedRow)}
              disabled={!selectedRow}
              sx={{ marginRight: '10px' }}
            >
              Delete
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => onUpdate(selectedRow)}
              disabled={!selectedRow}
            >
              Update
            </Button>
          </Box>
        </Box>
        
        {/* Inventory Table */}
        <Paper sx={{ width: '100%', mb: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {headCells.map((headCell) => (
                    <TableCell key={headCell.id}>{headCell.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow key={'${row.productID}-${row.receivedDate.split("T")[0]-${index}'} onClick={() => setSelectedRow(row)}>
                    <TableCell>{row.productID}</TableCell>
                    <TableCell>{new Date(row.receivedDate).toLocaleDateString()}</TableCell>
                    <TableCell>{row.quantity}</TableCell>
                    <TableCell>{row.cost}</TableCell>
                    <TableCell>{row.wholesalePrice}</TableCell>
                    <TableCell>{row.retailPrice}</TableCell>
                    <TableCell>{row.minStock}</TableCell>
                    <TableCell>{row.minProfitMargin}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredRows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>

      {/* Modal for Batch Registration and Update */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={{ ...modalStyle }}>
          <AddBatchForm onClose={handleClose} onBatchAdded={handleBatchAdded} /> {/* No need to pass products */}
        </Box>
      </Modal>
    </Box>
  );
}
