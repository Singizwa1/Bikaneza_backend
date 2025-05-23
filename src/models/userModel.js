const { query } = require("../config/db");

const UserModel = {
  // Find user by ID
  findById: async (id) => {
    const users = await query("SELECT id, username, email FROM users WHERE id = ?", [id]);
    return users.length > 0 ? users[0] : null;
  },

  // Find user by username
  findByUsername: async (username) => {
    const users = await query("SELECT * FROM users WHERE username = ?", [username]);
    return users.length > 0 ? users[0] : null;
  },

  // Find user by email
  findByEmail: async (email) => {
    const users = await query("SELECT * FROM users WHERE email = ?", [email]);
    return users.length > 0 ? users[0] : null;
  },

  // Check if username or email exists
  checkExisting: async (username, email) => {
    const users = await query("SELECT * FROM users WHERE username = ? OR email = ?", [username, email]);
    return users.length > 0;
  },

  // Create new user
  create: async (username, email, hashedPassword) => {
    const result = await query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );
    return result.insertId;
  },
};

module.exports = { UserModel };
