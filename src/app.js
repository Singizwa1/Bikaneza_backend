const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cron = require("node-cron");
const { connectToDatabase, initializeDatabase } = require("./config/db.js");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const salesRoutes = require("./routes/salesRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { checkExpiringProducts, checkLowStockProducts } = require("./controllers/notificationController");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 6000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/notifications", notificationRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Stock Management API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Function to start server after DB connection and initialization
async function startServer() {
  const isConnected = await connectToDatabase();
  if (!isConnected) {
    console.error("Failed to connect to the database.");
    process.exit(1);
  }

  const isDbInitialized = await initializeDatabase();
  if (!isDbInitialized) {
    console.error("Failed to initialize database tables. Server not started.");
    process.exit(1);
  }

  // Schedule daily cron jobs at midnight
  cron.schedule("0 0 * * *", async () => {
    try {
      await checkLowStockProducts();
      await checkExpiringProducts();
      console.log("Scheduled notification checks completed");
    } catch (error) {
      console.error("Error in scheduled tasks:", error);
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

module.exports = app;
