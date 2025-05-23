const { query } = require("../config/db");
const { ProductModel } = require("../models/productModel");
const { SalesModel } = require("../models/salesModel");
const { checkLowStockForProduct } = require("./notificationController");

// Get all sales for the logged-in user
const getAllSales = async (req, res) => {
  try {
    const sales = await SalesModel.findAllByUser(req.user.id);

    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales,
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sales",
    });
  }
};

// Get sales for a specific product
const getSalesByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product exists and belongs to user
    const product = await ProductModel.findByIdAndUser(productId, req.user.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you do not have permission to view its sales",
      });
    }

    const sales = await SalesModel.findByProductAndUser(productId, req.user.id);

    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales,
    });
  } catch (error) {
    console.error("Error fetching product sales:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product sales",
    });
  }
};

// Record a new sale
const createSale = async (req, res) => {
  try {
    const { product_id, quantity_sold, selling_price } = req.body;

    // Check if product exists and belongs to user
    const product = await ProductModel.findByIdAndUser(product_id, req.user.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you do not have permission to record sales for it",
      });
    }

    // Check if there's enough stock
    if (product.current_quantity < quantity_sold) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Current quantity: ${product.current_quantity}`,
      });
    }

    // Calculate total amount and profit/loss
    const totalAmount = selling_price * quantity_sold;
    const costPrice = product.buying_price * quantity_sold;
    const profitLoss = totalAmount - costPrice;

    // Begin transaction
    await query("START TRANSACTION");

    try {
      // Insert sale record
      const saleId = await SalesModel.create({
        product_id,
        quantity_sold,
        selling_price,
        total_amount: totalAmount,
        profit_loss: profitLoss,
        user_id: req.user.id,
      });

      // Update product quantity
      const newQuantity = product.current_quantity - quantity_sold;
      await ProductModel.updateQuantity(product_id, newQuantity);

      // Commit transaction
      await query("COMMIT");

      // Check if product needs low stock notification after sale
      await checkLowStockForProduct(product_id);

      // Get the newly created sale with product details
      const newSale = await SalesModel.findById(saleId);

      res.status(201).json({
        success: true,
        message: "Sale recorded successfully",
        data: {
          ...newSale,
          profitStatus: profitLoss > 0 ? "Profit" : profitLoss < 0 ? "Loss" : "Break-even",
        },
      });
    } catch (error) {
      // Rollback transaction in case of error
      await query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error recording sale:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record sale",
    });
  }
};

// Get sales summary
const getSalesSummary = async (req, res) => {
  try {
    const summary = await SalesModel.getSummary(req.user.id);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Error fetching sales summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sales summary",
    });
  }
};

module.exports = {
  getAllSales,
  getSalesByProduct,
  createSale,
  getSalesSummary,
};
