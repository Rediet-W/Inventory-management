import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create a new product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, quantity, buyingPrice, sellingPrice } = req.body;

  const product = new Product({
    name,
    quantity: 0,
    buyingPrice,
    sellingPrice,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, quantity, buyingPrice, sellingPrice } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.quantity = quantity || product.quantity;
    product.buyingPrice = buyingPrice || product.buyingPrice;
    product.sellingPrice = sellingPrice || product.sellingPrice;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: "Product removed" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Get products (purchases) for a specific date or date range
// @route   GET /api/products?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// @access  Private/User
const getProductsByDate = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // Default to today's date if not provided
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date();

  // Set start time to the beginning of the day and end time to the end of the day
  const startOfDay = new Date(start.setHours(0, 0, 0, 0));
  const endOfDay = new Date(end.setHours(23, 59, 59, 999));

  // Find products (purchases) between the start and end date
  const products = await Product.find({
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  if (products.length > 0) {
    res.status(200).json(products);
  } else {
    res
      .status(404)
      .json({ message: "No products found for the selected date(s)" });
  }
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByDate,
};
