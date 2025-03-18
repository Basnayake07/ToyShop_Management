import React, { useState } from "react";
import { TextField, Button, MenuItem, Typography, Paper } from "@mui/material";
import axios from "axios";

const AddProductForm = ({ onClose }) => {
    const [product, setProduct] = useState({
        productID: "",
        name: "",
        category: "",
        description: "",
        ageGrp: "",
        image: null, // File object
    });

    const [preview, setPreview] = useState(null); // Image preview

    const categories = ["Birthday Deco", "Soft Toys", "Educational Toys", "Christmas Deco", "Other Toys"]; // Example categories
    const ageGroups = ["0-2 months", "1-3 years", "4-8 years", "12+ years"]; // Example age groups

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({ ...product, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProduct({ ...product, image: file });
            setPreview(URL.createObjectURL(file)); // Preview selected image
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("productID", product.productID);
        formData.append("name", product.name);
        formData.append("category", product.category);
        formData.append("description", product.description);
        formData.append("ageGrp", product.ageGrp);
        formData.append("image", product.image); // Attach the file

        try {
            const response = await axios.post("http://localhost:8081/api/products", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Product added successfully!");
            console.log(response.data);
            onClose(); // Close the modal after successful submission
        } catch (error) {
            console.error("Error adding product:", error);
            alert("Failed to add product.");
        }
    };

    return (
        <Paper style={{ padding: 20, maxWidth: 500, margin: "auto", marginTop: 20 }}>
            <Typography variant="h5" gutterBottom>
                Add New Product
            </Typography>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <TextField
                    label="Product ID"
                    name="productID"
                    value={product.productID}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                />
                <TextField
                    label="Name"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                />
                <TextField
                    select
                    label="Category"
                    name="category"
                    value={product.category}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                >
                    {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                            {cat}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    label="Description"
                    name="description"
                    value={product.description}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                    multiline
                    rows={3}
                />
                <TextField
                    select
                    label="Age Group"
                    name="ageGrp"
                    value={product.ageGrp}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                >
                    {ageGroups.map((age) => (
                        <MenuItem key={age} value={age}>
                            {age}
                        </MenuItem>
                    ))}
                </TextField>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ marginTop: 15 }}
                    required
                />
                {preview && (
                    <img
                        src={preview}
                        alt="Preview"
                        style={{ width: "100%", height: "auto", marginTop: 10, borderRadius: 5 }}
                    />
                )}
                <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: 20 }}>
                    Add Product
                </Button>
            </form>
        </Paper>
    );
};

export default AddProductForm;
