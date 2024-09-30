import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import Shop from "../models/shopModel.js";

// @desc Get all products in shop or by date range
// @route GET /api/shop
export const getShopProducts = async (req, res) => {
  try {
    const { start, end } = req.query;

    let query = {};

    // Check if start and end dates are provided
    if (start && end) {
      query = {
        dateAdded: {
          $gte: new Date(start),
          $lte: new Date(end),
        },
      };
    }

    const products = await Shop.find(query);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Add a product to shop and deduct from store (product)
// @route POST /api/shop
export const addProductToShop = asyncHandler(async (req, res) => {
  const { productId, batchNumber, quantity, sellingPrice, userName } = req.body;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      res.status(404);
      throw new Error("Product not found in the store");
    }

    // Check if requested quantity is available
    if (product.quantity < quantity) {
      res.status(400);
      throw new Error("Not enough stock available");
    }

    // Deduct the quantity from the store
    product.quantity -= quantity;

    // If the remaining quantity is 0, delete the product from the store
    if (product.quantity === 0) {
      await product.deleteOne();
    } else {
      await product.save(); // Save the updated product with reduced quantity
    }

    // Add the product to the shop
    const newShopProduct = new Shop({
      productName: product.name,
      batchNumber,
      quantity,
      sellingPrice,
      userName,
    });

    const savedShopProduct = await newShopProduct.save();

    res.status(201).json(savedShopProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc Update a product in the shop
// @route PUT /api/shop/:id
export const updateProductInShop = async (req, res) => {
  const { productName, batchNumber, quantity, sellingPrice, userName } =
    req.body;

  try {
    const product = await Shop.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.productName = productName || product.productName;
    product.batchNumber = batchNumber || product.batchNumber;
    product.quantity = quantity || product.quantity;
    product.sellingPrice = sellingPrice || product.sellingPrice;
    product.userName = userName || product.userName;

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete a product from shop
// @route DELETE /api/shop/:id
export const deleteProductFromShop = async (req, res) => {
  try {
    const product = await Shop.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();
    res.status(200).json({ message: "Product removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
