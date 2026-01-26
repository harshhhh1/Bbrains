import { getAllProducts, createProduct as createProductService } from "../services/market.service.js"

const products = async (req, res) => {
    try {
        const result = await getAllProducts();
        res.json({
            status: "success", // Fixed typo
            products: result
        });
    } catch (error) {
        console.error("Market Controller Error:", error);
        res.status(500).json({ 
            status: "error", 
            message: "Failed to fetch products",
            error: error.message 
        });
    }
}

const createProduct = async (req, res) => {
    try {
        const { name, description, price, quantity, image } = req.body;
        
        const creatorId = req.user.id;
        const result = await createProductService(name, description, price, quantity, image, creatorId);
        res.json({
            status: "success",
            product: result
        });
    } catch (error) {
        console.error("Market Controller Error:", error);
        res.status(500).json({ 
            status: "error", 
            message: "Failed to create product",
            error: error.message 
        });
    }
}
export { products, createProduct }