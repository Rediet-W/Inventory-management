import asyncHandler from "express-async-handler";
import Purchase from "../models/purchaseModel.js"; // Import Purchase model
import Product from "../models/productModel.js";

// @desc    Create a new purchase
// @route   POST /api/purchases
// @access  Private (admin only)
const createPurchase = asyncHandler(async (req, res) => {
  const { productId, quantity, buyingPrice } = req.body;

  // Find the product associated with the purchase
  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Create a new purchase
  const newPurchase = new Purchase({
    product: productId,
    quantity,
    buyingPrice,
  });

  // Save the purchase
  await newPurchase.save();

  // Update the product quantity
  product.quantity += quantity;
  await product.save();

  res.status(201).json(newPurchase);
});

// @desc    Get all purchases (optionally filter by date range)
// @route   GET /api/purchases
// @access  Private
const getAllPurchases = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  let query = {};

  // If a date range is provided, add it to the query
  if (startDate && endDate) {
    query.purchaseDate = {
      $gte: new Date(startDate), // Greater than or equal to startDate
      $lte: new Date(endDate), // Less than or equal to endDate
    };
  }

  const purchases = await Purchase.find(query).populate("product", "name");
  res.status(200).json(purchases);
});

// @desc    Get purchase by ID
// @route   GET /api/purchases/:id
// @access  Private
const getPurchaseById = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findById(req.params.id).populate(
    "product",
    "name"
  );

  if (!purchase) {
    res.status(404);
    throw new Error("Purchase not found");
  }

  res.status(200).json(purchase);
});

// @desc    Delete a purchase
// @route   DELETE /api/purchases/:id
// @access  Private (admin only)
const deletePurchase = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findById(req.params.id);

  if (!purchase) {
    res.status(404);
    throw new Error("Purchase not found");
  }

  // Decrement the product's quantity when a purchase is deleted
  const product = await Product.findById(purchase.product);
  if (product) {
    product.quantity -= purchase.quantity;
    await product.save();
  }

  // Delete the purchase
  await purchase.deleteOne();

  res.status(200).json({ message: "Purchase deleted successfully" });
});

export { createPurchase, getAllPurchases, getPurchaseById, deletePurchase };
