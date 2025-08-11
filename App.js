const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Route files

const auth = require("./routes/auth");
const memes = require("./routes/memes");
const templates = require("./routes/templates");
const transactions = require("./routes/transactions");

// Mount routers
app.use("/api/auth", auth);
app.use("/api/memes", memes);
app.use("/api/templates", templates);
app.use("/api/transactions", transactions);

// Error handler middleware
app.use(errorHandler);

// Export the app so server.js can use it
module.exports = app;
