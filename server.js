const path = require("path");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./database");

require("dotenv").config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from .env");
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// API status
app.get("/api/status", (req, res) => {
  res.json({
    message: "TechVerse Secure API is running!",
    database: "SQLite connected"
  });
});

// Registration API
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

    const existingUser = db.prepare(
      "SELECT id FROM users WHERE email = ?"
    ).get(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        message: "Account already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    db.prepare(`
      INSERT INTO users (email, password)
      VALUES (?, ?)
    `).run(normalizedEmail, hashedPassword);

    return res.status(201).json({
      message: "Registration successful!"
    });

  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        message: "Account already exists."
      });
    }

    return res.status(500).json({
      message: "Server error."
    });
  }
});

// Login API
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

    const user = db.prepare(
      "SELECT id, email, password FROM users WHERE email = ?"
    ).get(normalizedEmail);

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
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error."
    });
  }
});

// JWT authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication token required."
    });
  }

  const token = authHeader.slice(7);

  try {
    req.user = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    next();

  } catch (error) {
    return res.status(403).json({
      message: "Invalid or expired token."
    });
  }
}

// Protected profile API
app.get("/api/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Welcome to your protected dashboard!",
    email: req.user.email
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`TechVerse Secure running on port ${PORT}`);
  console.log("SQLite database authentication enabled.");
});
