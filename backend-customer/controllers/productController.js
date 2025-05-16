const pool = require('../config/db'); // Import the database connection

// Fetch Product details for ProductCards
exports.getProductCards = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.ProductID AS id,
        p.Product_Name AS name, 
        CAST(MIN(b.Selling_Price) AS DECIMAL(10, 2)) AS price,  
        pi.ImageURL_1 AS image,
        p.Product_Rating AS rating,
        COALESCE(SUM(po.Quantity), 0) AS sold_count
      FROM product p
      JOIN batch b ON p.ProductID = b.ProductID
      JOIN productsimages pi ON p.ProductID = pi.ProductID
      LEFT JOIN ProductOrders po ON p.ProductID = po.ProductID
      GROUP BY p.ProductID, p.Product_Name, pi.ImageURL_1;
    `;
    const [rows] = await pool.promise().query(query); // Execute the query
    res.status(200).json(rows); // Return the product cards
  } catch (error) {
    console.error('Error fetching product cards:', error);
    res.status(500).json({ message: 'Failed to fetch product cards' });
  }
};

// Search Products by Name
exports.searchProducts = async (req, res) => {
  const { query } = req.query; // Extract the search query from the request

  try {
    const searchQuery = `
      SELECT 
        p.ProductID AS id,
        p.Product_Name AS name, 
        CAST(MIN(b.Selling_Price) AS DECIMAL(10, 2)) AS price,  
        pi.ImageURL_1 AS image,
        p.Product_Rating AS rating,
        COALESCE(SUM(po.Quantity), 0) AS sold_count
      FROM product p
      JOIN batch b ON p.ProductID = b.ProductID
      JOIN productsimages pi ON p.ProductID = pi.ProductID
      LEFT JOIN ProductOrders po ON p.ProductID = po.ProductID
      WHERE p.Product_Name LIKE ?
      GROUP BY p.ProductID, p.Product_Name, pi.ImageURL_1;
    `;
    const [rows] = await pool.promise().query(searchQuery, [`%${query}%`]); // Execute the query with the search term
    res.status(200).json(rows); // Return the search results
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Failed to search products' });
  }
};

exports.getProductsByCategory = async (req, res) => {
  const { category } = req.query; // Extract the category name from the query parameters

  try {
    const query = `
      SELECT 
        p.ProductID AS id,
        p.Product_Name AS name, 
        CAST(MIN(b.Selling_Price) AS DECIMAL(10, 2)) AS price,  
        pi.ImageURL_1 AS image
      FROM product p
      JOIN batch b ON p.ProductID = b.ProductID
      JOIN productsimages pi ON p.ProductID = pi.ProductID
      JOIN category c ON p.CategoryID = c.CategoryID
      WHERE c.Category_Name = ?
      GROUP BY p.ProductID, p.Product_Name, pi.ImageURL_1;
    `;
    const [rows] = await pool.promise().query(query, [category]); // Use the category name to filter products
    res.status(200).json(rows); // Return the products
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ message: 'Failed to fetch products by category' });
  }
};

exports.getProductDetails = async (req, res) => {
  const { id } = req.params; // Extract ProductID from the request parameters

  try {
    const query = `
      SELECT 
          p.ProductID AS id,
          p.Product_Name AS name,
          p.Description AS description,
          CAST(MIN(b.Selling_Price) AS DECIMAL(10, 2)) AS price,
          p.Product_Rating AS rating,
          pi.ImageURL_1 AS image1,
          pi.ImageURL_2 AS image2,
          pi.ImageURL_3 AS image3,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'attribute', a.Attribute_Name,
              'value', pa.value
            )
          ) AS attributes
      FROM product p
      JOIN batch b ON p.ProductID = b.ProductID
      JOIN productsimages pi ON p.ProductID = pi.ProductID
      LEFT JOIN product_attributes pa ON p.ProductID = pa.ProductID
      LEFT JOIN attributes a ON pa.attribute_id = a.id
      WHERE p.ProductID = ?
      GROUP BY p.ProductID, p.Product_Name, p.Description, pi.ImageURL_1, pi.ImageURL_2, pi.ImageURL_3;
      `;
    const [rows] = await pool.promise().query(query, [id]); // Fetch product details by ProductID

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(rows[0]); // Return the product details
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ message: 'Failed to fetch product details' });
  }
};

exports.getProductComments = async (req, res) => {
  const { id } = req.params; // Extract ProductID from the request parameters

  try {
    const query = `
      SELECT 
        pv.ReviewID AS id,
        pv.Comment AS text,
        pv.Created_at AS date,
        pv.CustomerRating AS rating,
        CONCAT(c.FirstName, ' ', c.LastName) AS name
      FROM product_review pv
      JOIN customer c ON pv.CustomerID = c.CustomerID
      WHERE pv.ProductID = ?
      ORDER BY pv.Created_at DESC;
    `;
    const [rows] = await pool.promise().query(query, [id]); // Fetch comments for the product

    res.status(200).json(rows); // Return the comments
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};