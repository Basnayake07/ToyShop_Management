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
                i.wholesalePrice,
                i.retailPrice
            FROM 
                product p
            LEFT JOIN 
                inventory i
            ON 
                p.productID = i.productID
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

        const [products] = await req.db.execute(query, queryParams);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Error fetching products", error });
    }
};