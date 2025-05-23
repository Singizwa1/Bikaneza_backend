const express= require ("express")
const {getAllSales, getSalesByProduct, createSale, getSalesSummary } = require ("../controllers/salesController") 
const { authenticateToken }= require ("../middleware/auth")
const { validateSale }  =require("../middleware/validation")
const router = express.Router()

// Apply authentication middleware to all sales routes
router.use(authenticateToken)

// Get all sales for the authenticated user
router.get("/", getAllSales)

// Get sales for a specific product
router.get("/product/:productId", getSalesByProduct)

// Record a new sale
router.post("/", validateSale, createSale)

// Get sales summary
router.get("/summary", getSalesSummary)

module.exports = router;
