const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();


const pool = mysql.createPool({
  host: process.env.DB_HOST || "",
  user: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});



// Execute SQL query
async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error("Query error:", error);
    throw error;
  }
}

// Initialize database tables
async function initializeDatabase() {
  try {
    const dbModelPath = path.join(__dirname, "..", "models", "dbModel.js");
    const dbModel = require(dbModelPath);

    const dbInitQueries = dbModel.dbInitQueries;

    for (const sql of dbInitQueries) {
      await query(sql, []);
    }

    console.log("Database tables initialized successfully");
    return true;
  } catch (error) {
    console.error("Database initialization failed:", error);
    return false;
  }
}


//initializeDatabase();

module.exports = {
  
  query,
};
