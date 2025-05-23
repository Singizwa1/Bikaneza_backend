const validateProduct = (req, res, next) => {
  try {
    const { name, supplier_name, buying_price, current_quantity, expiration_date } = req.body;

    if (!name || !supplier_name || !buying_price || !current_quantity || !expiration_date) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: name, supplier_name, buying_price, current_quantity, expiration_date",
      });
    }

    if (isNaN(buying_price) || isNaN(current_quantity)) {
      return res.status(400).json({
        success: false,
        message: "buying_price and current_quantity must be numbers",
      });
    }

    const expirationDate = new Date(expiration_date);
    if (isNaN(expirationDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid expiration_date format. Use YYYY-MM-DD",
      });
    }

    next();
  } catch (error) {
    console.error("Validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Validation failed",
    });
  }
};

const validateSale = (req, res, next) => {
  try {
    const { product_id, quantity_sold, selling_price } = req.body;

    if (!product_id || !quantity_sold || !selling_price) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: product_id, quantity_sold, selling_price",
      });
    }

    if (isNaN(quantity_sold) || isNaN(selling_price)) {
      return res.status(400).json({
        success: false,
        message: "quantity_sold and selling_price must be numbers",
      });
    }

    next();
  } catch (error) {
    console.error("Validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Validation failed",
    });
  }
};

const validateRegistration = (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    next();
  } catch (error) {
    console.error("Validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Validation failed",
    });
  }
};

const validateLogin = (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    next();
  } catch (error) {
    console.error("Validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Validation failed",
    });
  }
};

module.exports = {
  validateProduct,
  validateSale,
  validateRegistration,
  validateLogin,
};
