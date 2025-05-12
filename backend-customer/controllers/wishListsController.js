import pool from '../config/db.js';

// Add a product to the wishlist
export const addToWishlist = async (req, res) => {
  const { productID } = req.body; // Use productID as per your schema
  const cusID = req.user.cusID; // Extract cusID from the token

  try {
    const query = `
      INSERT INTO wishlist (cusID, productID)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE productID = productID; -- Prevent duplicate entries
    `;
    await pool.query(query, [cusID, productID]);

    res.status(200).json({ message: 'Product added to wishlist successfully' });
  } catch (error) {
    console.error('Error adding product to wishlist:', error);
    res.status(500).json({ message: 'Failed to add product to wishlist' });
  }
};

// Remove a product from the wishlist
export const removeFromWishlist = async (req, res) => {
  const { productID } = req.body; // Use productID as per your schema
  const cusID = req.user.cusID; // Extract cusID from the token

  try {
    const query = `
      DELETE FROM wishlist
      WHERE cusID = ? AND productID = ?
    `;
    await pool.query(query, [cusID, productID]);

    res.status(200).json({ message: 'Product removed from wishlist successfully' });
  } catch (error) {
    console.error('Error removing product from wishlist:', error);
    res.status(500).json({ message: 'Failed to remove product from wishlist' });
  }
};

// Fetch the wishlist for a specific user
export const getWishlist = async (req, res) => {
  const cusID = req.user.cusID; 

  if (!cusID) {
    return res.status(400).json({ message: 'Customer ID is required' });
  }

  try {
    const query = `
      SELECT 
        p.productID AS id,
        p.name AS name,
        p.description AS description,
        p.image AS image,
        p.category AS category,
        i.retailPrice AS retailPrice,
        i.wholesalePrice AS wholesalePrice
      FROM wishlist w
      JOIN product p ON w.productID = p.productID
      JOIN inventory i ON p.productID = i.productID
      WHERE w.cusID = ?
      GROUP BY p.productID,
      p.name, 
        p.description, 
        p.image, 
        p.category, 
        i.retailPrice, 
        i.wholesalePrice;
    `;
    const [rows] = await pool.query(query, [cusID]);

    res.status(200).json(rows); // Return detailed product information
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Failed to fetch wishlist' });
  }
};

// Clear all items from the wishlist for a specific user
export const clearWishlist = async (req, res) => {
  const cusID = req.user.cusID; // Extract cusID from the token

  try {
    const query = `DELETE FROM wishlist WHERE cusID = ?`;
    await pool.promise().query(query, [cusID]);

    res.status(200).json({ message: 'Wishlist cleared successfully' });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ message: 'Failed to clear wishlist' });
  }
};