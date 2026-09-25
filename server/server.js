const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const societyRoutes = require("./routes/societyRoutes");
const fundRoutes = require("./routes/fundRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const invitationRoutes = require('./routes/invitationRoutes')
const societyRegistrationRoutes = require("./routes/societyRegistrationRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

//Routes
app.use("/api/societies", societyRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/funds", fundRoutes);
app.use("/api/expenses", expenseRoutes);
app.use('/api/invitations', invitationRoutes)
app.use("/api/society", societyRegistrationRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Society Fund Transparency API is running!"
    });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

// Start server
const PORT = process.env.PORT || 5050;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});