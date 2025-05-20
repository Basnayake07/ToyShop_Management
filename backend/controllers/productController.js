import { uploadToyImage } from '../app.js'; // Import the uploadToyImage function

// Purpose: Contains functions that handle API requests, interact with the database, and return responses.
// Keeps business logic separate from routes.

export const productController = {
    createProduct: async (req, res) => {
        console.log("Database in Controller:", req.db ? "Available" : "Not Available");

        if (!req.db) {
            return res.status(500).json({ message: "Database connection not found" });
        }

        const { name, category, description, ageGrp } = req.body;
        const file = req.file; // Get the uploaded file from Multer

        if (!file) {
            return res.status(400).json({ message: "Image file is required" });
        }

        try {
            // Find the next productID
            const getLastIDQuery = "SELECT MAX(CAST(SUBSTRING(productID, 3) AS UNSIGNED)) AS lastID FROM product";
            const [result] = await req.db.execute(getLastIDQuery);
            const lastID = result[0].lastID || 0; // If no ID exists, start from 0
            const nextID = `PR${lastID + 1}`;

            // Upload the image to Cloudinary
            const imageUrl = await uploadToyImage(file.path);

            // Save the product information to the database
            const [insertResult] = await req.db.execute(
                "INSERT INTO product (productID, name, category, description, image, ageGrp) VALUES (?, ?, ?, ?, ?, ?)",
                [nextID, name, category, description, imageUrl, ageGrp]
            );

            res.status(201).json({ message: "Product created successfully", result: insertResult });
        } catch (error) {
            console.error("Error creating product:", error);
            res.status(500).json({ message: "Error creating product", error });
        }
    },
    
    
    // Fetch all products
    // Fetch all products with price and quantity from the inventory table
getAllProducts: async (req, res) => {
    try {
        const query = `
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
            LEFT JOIN 
                inventory i
            ON 
                p.productID = i.productID
        `;

        const [products] = await req.db.execute(query);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products with inventory details:", error);
        res.status(500).json({ message: "Error fetching products", error });
    }
} ,

getProductById: async (req, res) => {
    const { productID } = req.params;
  
    try {
      const [product] = await req.db.execute(
        `SELECT productID, name FROM product WHERE productID = ?`,
        [productID]
      );
  
      if (product.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      res.status(200).json(product[0]);
    } catch (error) {
      console.error("Error fetching product details:", error);
      res.status(500).json({ message: "Error fetching product details", error });
    }
  }
};


