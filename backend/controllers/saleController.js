import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import Sale from "../models/saleModel.js";

// @desc    Get sales for a specific date range
// @route   GET /api/sales/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// @access  Private/User
const getSalesByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date();

  // Set start time to beginning of the day and end time to the end of the day
  const startOfDay = new Date(start.setHours(0, 0, 0, 0));
  const endOfDay = new Date(end.setHours(23, 59, 59, 999));

  // Find sales within the date range
  const sales = await Sale.find({
    saleDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  }).populate("product");

  res.status(200).json(sales);
});

// @desc    Create a new sale and update product quantity
// @route   POST /api/sales
// @access  Private/User
const createSale = asyncHandler(async (req, res) => {
  const { productId, quantitySold } = req.body;

  const product = await Product.findById(productId);

  if (product) {
    if (quantitySold > product.quantity) {
      res.status(400);
      throw new Error("Not enough stock available");
    }

    const sale = new Sale({
      product: productId,
      quantitySold,
      sellingPrice: product.sellingPrice,
    });

    // Save the sale
    const createdSale = await sale.save();

    // Update the product quantity
    product.quantity -= quantitySold;

    // Delete product if quantity reaches zero
    if (product.quantity === 0) {
      await product.deleteOne();
    } else {
      await product.save();
    }

    res.status(201).json(createdSale);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Get sales for a specific date
// @route   GET /api/sales?date=YYYY-MM-DD
// @access  Private/User
const getSalesByDate = asyncHandler(async (req, res) => {
  const { date } = req.query;

  if (!date) {
    res.status(400);
    throw new Error("Date is required");
  }

  const queryDate = new Date(date);

  // Set start time to beginning of the day and end time to the end of the day
  const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

  // Find sales within the start and end of the specified day
  const sales = await Sale.find({
    saleDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  }).populate("product");

  res.status(200).json(sales);
});

// @desc    Update a sale (edit quantity or other details)
// @route   PUT /api/sales/:id
// @access  Private/Admin
const updateSale = asyncHandler(async (req, res) => {
  const { quantitySold } = req.body;

  const sale = await Sale.findById(req.params.id);

  if (sale) {
    const product = await Product.findById(sale.product);

    // Update the product's quantity by adjusting the difference in sold quantity
    const quantityDifference = quantitySold - sale.quantitySold;

    if (quantitySold > product.quantity + sale.quantitySold) {
      res.status(400);
      throw new Error("Not enough stock available to update the sale");
    }

    // Update the sale quantity
    sale.quantitySold = quantitySold;
    await sale.save();

    // Adjust product quantity accordingly
    product.quantity -= quantityDifference;
    if (product.quantity < 0) {
      res.status(400).json({ message: "Not enough stock available" });
    } else {
      await product.save();
    }

    res.json(sale);
  } else {
    res.status(404);
    throw new Error("Sale not found");
  }
});

// @desc    Delete a sale
// @route   DELETE /api/sales/:id
// @access  Private/Admin
const deleteSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id);

  if (sale) {
    const product = await Product.findById(sale.product);

    // Restore the product's quantity
    product.quantity += sale.quantitySold;
    await product.save();

    await sale.deleteOne();

    res.json({ message: "Sale removed" });
  } else {
    res.status(404);
    throw new Error("Sale not found");
  }
});

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private/User
const getAllSales = asyncHandler(async (req, res) => {
  const sales = await Sale.find().populate("product"); // Populate the product field
  res.status(200).json(sales);
});

export {
  createSale,
  getSalesByDate,
  updateSale,
  deleteSale,
  getSalesByDateRange,
  getAllSales,
};
