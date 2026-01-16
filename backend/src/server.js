const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// 1. Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: false
}));
app.use(express.json());

// 2. Health Check / Test Routes
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "Backend is running fine",
    message: "VeriVault API is online 🚀" 
  });
});

// --- ADDED TEST DB ROUTE HERE ---
app.get("/api/test-db", (req, res) => {
  res.json({ message: "DB models ready" });
});

// 3. Main Route
app.get("/", (req, res) => {
  res.send("Backend is running securely 🚀");
});

// 4. Future Routes 
// app.use("/api/auth", authRoutes);
// app.use("/api/documents", docRoutes);

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});