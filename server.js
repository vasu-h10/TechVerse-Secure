const path = require("path");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const users = [];

// Home API
app.get("/api/status", (req, res) => {
  res.json({
    message: "TechVerse Secure API is running!"
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

    const existingUser = users.find(
      user => user.email === normalizedEmail
    );

    if (existingUser) {
      return res.status(409).json({
        message: "Account already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    users.push({
      email: normalizedEmail,
      password: hashedPassword
    });

    res.status(201).json({
      message: "Registration successful!"
    });

  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
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
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = users.find(
      user => user.email === normalizedEmail
    );

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful!",
      token
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
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
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;
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
app.listen(3000, "0.0.0.0", () => {
  console.log("TechVerse Secure running on port 3000");
});
