import { uploadToyImage } from '../app.js'; // Import the uploadToyImage function

// Purpose: Contains functions that handle API requests, interact with the database, and return responses.
// Keeps business logic separate from routes.

export const productController = {
    createProduct: async (req, res) => {
        console.log("Database in Controller:", req.db ? "Available" : "Not Available");

        if (!req.db) {
            return res.status(500).json({ message: "Database connection not found" });
        }

        const { productID, name, category, description, ageGrp } = req.body;
        const file = req.file; // Get the uploaded file from Multer

        if (!file) {
            return res.status(400).json({ message: "Image file is required" });
        }

        try {
            // Upload the image to Cloudinary
            const imageUrl = await uploadToyImage(file.path);

            // Save the product information to the database
            const [result] = await req.db.execute(
                "INSERT INTO product (productID, name, category, description, image, ageGrp) VALUES (?, ?, ?, ?, ?, ?)",
                [productID, name, category, description, imageUrl, ageGrp]
            );

            res.status(201).json({ message: "Product created successfully", result });
        } catch (error) {
            console.error("Error creating product:", error);
            res.status(500).json({ message: "Error creating product", error });
        }
    },
    
    
    // Fetch all products
    getAllProducts: async (req, res) => {
        try {
            const [products] = await req.db.execute("SELECT * FROM product");
            res.status(200).json(products);
        } catch (error) {
            console.error("Error fetching products:", error);
            res.status(500).json({ message: "Error fetching products", error });
        }
    },
};
