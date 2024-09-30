import asyncHandler from "express-async-handler";
import Sale from "../models/saleModel.js";
import Shop from "../models/shopModel.js";

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

// @desc    Create a new sale and update shop product quantity
// @route   POST /api/sales
// @access  Private/User
const createSale = asyncHandler(async (req, res) => {
  const { shopProductId, quantitySold, userName } = req.body;

  // Check if shopProductId, quantitySold, and userName are provided
  if (!shopProductId || !quantitySold || !userName) {
    res.status(400);
    throw new Error("Shop product ID, quantity, and user name are required");
  }

  // Find the product in the shop by ID
  const shopProduct = await Shop.findById(shopProductId);

  if (shopProduct) {
    // Check if the requested sale quantity is available in the shop
    if (quantitySold > shopProduct.quantity) {
      res.status(400);
      throw new Error(
        `Not enough stock available in the shop. You only have ${shopProduct.quantity} units.`
      );
    }

    // Create a new sale
    const sale = new Sale({
      product: shopProductId, // Reference to the shop product
      productName: shopProduct.productName,
      quantitySold,
      sellingPrice: shopProduct.sellingPrice,
      userName,
      batchNumber: shopProduct.batchNumber,
    });

    // Save the sale record
    const createdSale = await sale.save();

    // Update the shop product quantity
    shopProduct.quantity -= quantitySold;

    // If the shop product quantity reaches zero, delete the product from the shop
    if (shopProduct.quantity === 0) {
      await shopProduct.deleteOne();
    } else {
      await shopProduct.save(); // Save the updated shop product with reduced quantity
    }

    // Respond with the created sale
    res.status(201).json(createdSale);
  } else {
    res.status(404);
    throw new Error("Shop product not found");
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
