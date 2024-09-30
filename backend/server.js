import path from "path";
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import requestedProductRoutes from "./routes/requestedProductRoutes.js"; // Import requested products routes
import saleRoute from "./routes/saleRoutes.js"; // Import transaction routes
import purchaseRoute from "./routes/purchaseRoutes.js"; // Import purchase routes
import User from "./models/userModel.js";
import bcrypt from "bcryptjs";
import shopRoute from "./routes/shopRoutes.js"; // Import shop routes

dotenv.config();

const port = process.env.PORT || 5000;

connectDB();

const app = express();

// Middleware to parse incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for cookies
app.use(cookieParser());

// Route handling
app.use("/api/users", userRoutes); // User routes
app.use("/api/products", productRoutes); // Product routes
app.use("/api/requested-products", requestedProductRoutes); // Requested products routes
app.use("/api/sales", saleRoute); // Transaction routes
app.use("/api/purchases", purchaseRoute); // Purchase routes
app.use("/api/shop", shopRoute); // Shop routes

// Serve frontend assets in production
if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running....");
  });
}

// Error handling middlewares
app.use(notFound);
app.use(errorHandler);

// Start the server
app.listen(port, () => console.log(`Server started on port ${port}`));
