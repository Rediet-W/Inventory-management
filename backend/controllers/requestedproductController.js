import asyncHandler from "express-async-handler";
import RequestedProduct from "../models/requestedProductModel.js";

// @desc    Get all requested products for the current user
// @route   GET /api/requested-products
// @access  Private
const getRequestedProducts = asyncHandler(async (req, res) => {
  const requestedProducts = await RequestedProduct.find({});
  res.json(requestedProducts);
});

// @desc    Create a requested product
// @route   POST /api/requested-products
// @access  Private
const createRequestedProduct = asyncHandler(async (req, res) => {
  const { product, description } = req.body;

  // Ensure both product and description are provided
  if (!product || !description) {
    res.status(400);
    throw new Error("Please provide both product name and description.");
  }

  const requestedProduct = new RequestedProduct({
    product,
    description,
    user: req.user._id, // The user who is requesting the product
  });

  const createdRequestedProduct = await requestedProduct.save();
  res.status(201).json(createdRequestedProduct);
});

// @desc    Delete a requested product
// @route   DELETE /api/requested-products/:id
// @access  Private
const deleteRequestedProduct = asyncHandler(async (req, res) => {
  const requestedProduct = await RequestedProduct.findById(req.params.id);

  if (
    requestedProduct &&
    requestedProduct.user.toString() === req.user._id.toString()
  ) {
    await RequestedProduct.deleteOne({ _id: req.params.id }); // Replaced .remove() with deleteOne()
    res.json({ message: "Requested product removed" });
  } else {
    res.status(404);
    throw new Error("Requested product not found or not authorized");
  }
});

export { getRequestedProducts, createRequestedProduct, deleteRequestedProduct };
