const path = require("path");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool, initializeDatabase } = require("./database");

require("dotenv").config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from .env");
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/status", (req, res) => {
  res.json({
    message: "TechVerse Secure API is running!",
    database: "Neon PostgreSQL connected"
  });
});

// Registration
app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      password.length < 8
    ) {
      return res.status(400).json({
        message: "Valid email and password of at least 8 characters are required."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Account already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await pool.query(
      `INSERT INTO users (email, password)
       VALUES ($1, $2)`,
      [normalizedEmail, hashedPassword]
    );

    return res.status(201).json({
      message: "Registration successful!"
    });

  } catch (error) {
    console.error("Registration error:", error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Account already exists."
      });
    }

    return res.status(500).json({
      message: "Server error."
    });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      "SELECT id, email, password FROM users WHERE email = $1",
      [normalizedEmail]
    );

    const user = result.rows[0];

    if (
      !user ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      message: "Login successful!",
      token
    });

  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Server error."
    });
  }
});

// JWT authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication token required."
    });
  }

  try {
    req.user = jwt.verify(
      authHeader.slice(7),
      process.env.JWT_SECRET
    );

    next();

  } catch (error) {
    return res.status(403).json({
      message: "Invalid or expired token."
    });
  }
}

// Protected profile
app.get("/api/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Welcome to your protected dashboard!",
    email: req.user.email
  });
});

// Start only after PostgreSQL initialization
async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`TechVerse Secure running on port ${PORT}`);
      console.log("Neon PostgreSQL authentication enabled.");
    });

  } catch (error) {
    console.error("Database startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
