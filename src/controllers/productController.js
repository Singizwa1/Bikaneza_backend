const { ProductModel } = require("../models/productModel");
const { checkLowStockForProduct } = require("./notificationController");

// Get all products for the authenticated user
const getAllProducts = async (req, res) => {
  try {
    const products = await ProductModel.findAllByUser(req.user.id);
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// Get a single product
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findByIdAndUser(id, req.user.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

// Create a new product
const createProduct = async (req, res) => {
  try {
    const { name, supplier_name, buying_price, current_quantity, expiration_date } = req.body;

    const productId = await ProductModel.create({
      name,
      supplier_name,
      buying_price,
      current_quantity,
      expiration_date,
      user_id: req.user.id,
    });

    await checkLowStockForProduct(productId);
    const newProduct = await ProductModel.findById(productId);

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, supplier_name, buying_price, current_quantity, expiration_date } = req.body;

    const existingProduct = await ProductModel.findByIdAndUser(id, req.user.id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you do not have permission to update it",
      });
    }

    const updated = await ProductModel.update(
      id,
      { name, supplier_name, buying_price, current_quantity, expiration_date },
      req.user.id
    );

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    await checkLowStockForProduct(id);
    const updatedProduct = await ProductModel.findById(id);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existingProduct = await ProductModel.findByIdAndUser(id, req.user.id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you do not have permission to delete it",
      });
    }

    await ProductModel.delete(id, req.user.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

// Get low stock products
const getLowStockProducts = async (req, res) => {
  try {
    const lowStockProducts = await ProductModel.findLowStock(req.user.id);
    res.status(200).json({
      success: true,
      count: lowStockProducts.length,
      data: lowStockProducts,
    });
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch low stock products",
    });
  }
};

// Get expiring products
const getExpiringProducts = async (req, res) => {
  try {
    const expiringProducts = await ProductModel.findExpiringSoon(req.user.id);
    res.status(200).json({
      success: true,
      count: expiringProducts.length,
      data: expiringProducts,
    });
  } catch (error) {
    console.error("Error fetching expiring products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch expiring products",
    });
  }
};


module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getExpiringProducts,
};
