const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// 1. Middleware (Stays at the top)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: false
}));
app.use(express.json());

// 2. Health Check / Test Routes (ADD IT HERE)
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "Backend is running fine",
    message: "VeriVault API is online 🚀" 
  });
});

// 3. Main Route (Existing)
app.get("/", (req, res) => {
  res.send("Backend is running securely 🚀");
});

// 4. Future Routes (This is where you'll put Auth/Doc routes later)
// app.use("/api/auth", authRoutes);
// app.use("/api/documents", docRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});