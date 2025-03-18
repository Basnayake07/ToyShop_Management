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
} from '@mui/material';

const headCells = [
  { id: 'productId', label: 'Product ID' },
  { id: 'category', label: 'Category' },
  { id: 'receivedDate', label: 'Received Date' },
  { id: 'stockQuantity', label: 'Stock Quantity' },
  { id: 'cost', label: 'Cost' },
  { id: 'sellingPrice', label: 'Selling Price' },
  { id: 'minProfitMargin', label: 'Min Profit Margin' },
];

const predefinedCategories = [
    "Birthday Deco",
    "Soft Toys",
    "Educational Toys",
    "Christmas Deco",
    "Other Toys"
  ];

export default function InventoryTable({ rows = [], onAdd, onUpdate, onDelete }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [search, setSearch] = React.useState('');
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [category, setCategory] = React.useState('');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredRows = rows.filter(row =>
    row.productId.toLowerCase().includes(search.toLowerCase()) &&
    (category === '' || row.category === category)
  );

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
            <Button variant="contained" color="success" onClick={onAdd} sx={{ marginRight: '10px' }}>
              Add Product
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
                {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                  <TableRow key={row.productId} onClick={() => setSelectedRow(row)}>
                    <TableCell>{row.productId}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.receivedDate}</TableCell>
                    <TableCell>{row.stockQuantity}</TableCell>
                    <TableCell>{row.cost}</TableCell>
                    <TableCell>{row.sellingPrice}</TableCell>
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
    </Box>
  );
}
