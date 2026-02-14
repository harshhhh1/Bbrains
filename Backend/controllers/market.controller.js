import { getAllProducts, createProduct as createProductService, updateProduct, deleteProduct, findProductByName, addToCart, getCart, removeFromCart, checkout } from "../services/market.service.js"

const products = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { products: result, total } = await getAllProducts(skip, limit);

    res.json({
      status: "success",
      products: result,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
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
    const { name, description, price, stock, image } = req.body;

    const creatorId = req.user.id;
    const result = await createProductService(name, description, price, stock, image, creatorId);
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
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await updateProduct(id, data);
    res.json({
      status: "success",
      product: result
    });
  } catch (error) {
    console.error("Market Controller Error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update product",
      error: error.message
    });
  }
}

const removeProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteProduct(id);
    res.json({
      status: "success",
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Market Controller Error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete product",
      error: error.message
    });
  }
}

const searchProduct = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: "Product name required" });

    const result = await findProductByName(name);
    res.json({ status: "success", products: result });
  } catch (error) {
    console.error("Market Controller Error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
}

const addItemToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    const result = await addToCart(userId, productId, quantity);
    res.json({ status: "success", message: "Added to cart", cartItem: result });
  } catch (error) {
    console.error("Cart Error:", error);
    res.status(400).json({ status: "error", message: error.message });
  }
}

const getUserCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await getCart(userId);
    res.json({ status: "success", cart: result });
  } catch (error) {
    console.error("Cart Error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
}

const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    await removeFromCart(userId, id);
    res.json({ status: "success", message: "Removed from cart" });
  } catch (error) {
    console.error("Cart Error:", error);
    res.status(400).json({ status: "error", message: error.message });
  }
}

const checkoutHandler = async (req, res) => {
  try {
    const { pin } = req.body;
    const userId = req.user.id;

    if (!pin) return res.status(400).json({ message: "Wallet PIN required" });

    const order = await checkout(userId, pin);
    res.json({ status: "success", message: "Purchase successful", order });
  } catch (error) {
    console.error("Checkout Error:", error);
    res.status(400).json({ status: "error", message: error.message });
  }
}

export { products, createProduct, editProduct, removeProduct, searchProduct, addItemToCart, getUserCart, removeCartItem, checkoutHandler }