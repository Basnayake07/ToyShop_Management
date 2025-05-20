import pool from "../config/db.js"; 

export const getAllProducts = async (req, res) => {
    try {
        const { search, category } = req.query; // Extract query parameters

        let query = `
            SELECT 
                p.productID, 
                p.name, 
                p.category, 
                p.description, 
                p.image, 
                p.ageGrp,
                p.productRating, 
                i.quantity, 
                i.wholesalePrice,
                i.retailPrice,
                i.minStock
            FROM 
                product p
            JOIN (
                SELECT 
                    inv.productID,
                    inv.quantity,
                    inv.wholesalePrice,
                    inv.retailPrice,
                    inv.minStock
                FROM inventory inv
                JOIN (
                    SELECT 
                        productID,
                        MIN(receivedDate) AS firstDate
                    FROM inventory
                    WHERE quantity > 0
                    GROUP BY productID
                ) first_batches ON inv.productID = first_batches.productID AND inv.receivedDate = first_batches.firstDate
                WHERE inv.quantity > 0
            ) i ON p.productID = i.productID;
        `;

        const queryParams = [];

        // Add conditions based on query parameters
        if (search) {
            query += ` WHERE p.name LIKE ? OR p.description LIKE ?`;
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        if (category) {
            query += search ? ` AND p.category = ?` : ` WHERE p.category = ?`;
            queryParams.push(category);
        }

                  // Add GROUP BY for all non-aggregated columns
          // query += `
          //     GROUP BY 
          //         p.productID, 
          //         p.name, 
          //         p.category, 
          //         p.description, 
          //         p.image, 
          //         p.ageGrp, 
          //         i.wholesalePrice,
          //         i.retailPrice,
          //         p.productRating
          // `;

        const [products] = await req.db.execute(query, queryParams);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Error fetching products", error });
    }
};

export const getProductDetails = async (req, res) => {
  const { id } = req.params; // Extract ProductID from the request parameters

  try {
    // Query to fetch product details
    const productQuery = `
      SELECT 
          p.productID AS id,
          p.name AS name,
          p.category AS category,
          p.description AS description,
          p.image AS image,
          p.ageGrp AS ageGroup,
          i.wholesalePrice AS wholesalePrice,
          i.retailPrice AS retailPrice,
          p.productRating AS rating
      FROM product p
      LEFT JOIN inventory i ON p.productID = i.productID
      WHERE p.productID = ?
      GROUP BY 
      p.productID, 
      p.name, 
      p.category, 
      p.description, 
      p.image, 
      p.ageGrp, 
      i.wholesalePrice,
      i.retailPrice,
      p.productRating
    `;

    const [productRows] = await pool.query(productQuery, [id]);

    if (productRows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Query to fetch product reviews
    const reviewsQuery = `
        SELECT 
            pr.reviewID AS id,
            pr.comment AS text,
            pr.customerRating AS rating,
            pr.createdAt AS date,
            c.name AS customerName
        FROM product_review pr
        JOIN customer c ON pr.cusID = c.cusID
        WHERE pr.productID = ?
        ORDER BY pr.createdAt DESC;
        `;

    const [reviews] = await pool.query(reviewsQuery, [id]);

    // Combine product details and reviews into a single response
    const productDetails = {
      ...productRows[0],
      reviews,
    };

    res.status(200).json(productDetails); // Return the combined product details
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ message: 'Failed to fetch product details' });
  }
};