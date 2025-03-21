import pool from '../config/db.js'; 
import dotenv from 'dotenv';
dotenv.config();


// Fetch all products for dropdown selection
export const getProducts = async (req, res) => {
    try {
        const [products] = await pool.query("SELECT productID, name FROM product");
        return res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Search products by name or ID
export const searchProducts = async (req, res) => {
    const { search } = req.query;
    try {
        const [products] = await pool.query("SELECT productID, name FROM product WHERE productID LIKE ? OR name LIKE ?", [`%${search}%`, `%${search}%`]);
        return res.status(200).json(products);
    } catch (error) {
        console.error('Error searching products:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetch existing inventories
export const getInventory = async (req, res) => {
    try {
        const [inventory] = await pool.query("SELECT * FROM inventory");
        return res.status(200).json(inventory);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add new inventory item
export const addInventory = async (req, res) => {
    const { productID, receivedDate, quantity, cost, wholesalePrice, retailPrice, minStock, minProfitMargin } = req.body;
  
    // Check if all fields are provided
    if (!productID || !receivedDate || !quantity || !cost || !wholesalePrice || !retailPrice || !minStock || !minProfitMargin) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    // Validate date (only past and current dates allowed)
    const today = new Date().toISOString().split('T')[0];
    const received = receivedDate;
    
    if (received > today) {
        return res.status(400).json({ message: 'Received date cannot be a future date!' });
    }

    // Validate numerical fields (should not contain letters)
    const numericFields = { quantity, cost, wholesalePrice, retailPrice, minStock, minProfitMargin };
    for (const [key, value] of Object.entries(numericFields)) {
        if (isNaN(value) || value < 0) {
            return res.status(400).json({ message: `${key} must be a valid positive number!` });
        }
    }
    
    // Validate minStock (must be lower than quantity)
    if (Number(minStock) >= Number(quantity)) {
        return res.status(400).json({ message: 'Minimum stock should be lower than quantity!' });
    }
  
    try {
        const insertInventoryQuery = `INSERT INTO inventory (productID, receivedDate, quantity, cost, wholesalePrice, retailPrice, minStock, minProfitMargin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        await pool.query(insertInventoryQuery, [productID, receivedDate, quantity, cost, wholesalePrice, retailPrice, minStock, minProfitMargin]);
  
        return res.status(200).json({ message: 'Inventory added successfully' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

