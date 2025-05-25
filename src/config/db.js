const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();


const caCertPath = path.resolve(__dirname, "../certs/ca.pem");

const sslOptions = {
  ca: fs.readFileSync(caCertPath),
};

const pool = mysql.createPool({
  host: process.env.DB_HOST || "",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: sslOptions,
  connectTimeout: 10000,
});


// Connect to database
async function connectToDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to MySQL database");
    connection.release();
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error("Query error:", error);
    throw error;
  }
}

async function initializeDatabase() {
  try {
    const dbModel = require("../models/dbModel");
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

// Initialize tables on startup
initializeDatabase();

module.exports = {
  connectToDatabase,
  query,
  initializeDatabase,
};
