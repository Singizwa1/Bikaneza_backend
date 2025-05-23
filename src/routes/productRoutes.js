const express=require ("express")
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getExpiringProducts,
}=require("../controllers/productController")
const { authenticateToken }=require( "../middleware/auth")
const{ validateProduct }=require("../middleware/validation")

const router = express.Router()

// Apply authentication middleware to all product routes
router.use(authenticateToken)

// Get all products for the authenticated user
router.get("/", getAllProducts)

// Get a single product
router.get("/:id", getProductById)

// Create a new product
router.post("/", validateProduct, createProduct)

// Update a product
router.put("/:id", updateProduct)

// Delete a product
router.delete("/:id", deleteProduct)

// Get low stock products
router.get("/status/low-stock", getLowStockProducts)

// Get expiring products
router.get("/status/expiring-soon", getExpiringProducts)

module.exports = router;
