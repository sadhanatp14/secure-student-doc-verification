const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// 1. Middleware - CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://crypt-o-course-frontend.vercel.app",
  "https://secure-student-doc-verification.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === "development") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json());

// 2. Health Check / Test Routes
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "Backend is running fine",
    message: "VeriVault API is online 🚀" 
  });
});

app.get("/api/test-db", (req, res) => {
  res.json({ message: "DB models ready" });
});

// 3. Main Route
app.get("/", (req, res) => {
  res.send("Backend is running securely 🚀");
});

// 4. Auth & Functional Routes 
// Public routes
app.use("/api/auth", require("../routes/authRoutes")); 

// Protected/Functional routes (The "Objects" in your Access Control Matrix)
app.use("/api/protected", require("../routes/protectedRoutes")); 
app.use("/api/courses", require("../routes/courseRoutes")); // <--- ADD THIS HERE
app.use("/api/enrollment", require("../routes/enrollmentRoutes")); // Enrollment routes

app.use("/api/admin", require("../routes/adminRoutes"));
app.use("/api/users", require("../routes/userRoutes")); // User management routes
// ---------------------------------

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
