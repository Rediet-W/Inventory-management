import express from "express";
const router = express.Router();
import {
  getShopProducts,
  addProductToShop,
  updateProductInShop,
  deleteProductFromShop,
} from "../controllers/shopController.js";

import { protect } from "../middleware/authMiddleware.js";

// Get all products in shop, or filter by date range
router.get("/", protect, getShopProducts);

// Add a product to the shop
router.post("/", protect, addProductToShop);

// Update a product in the shop
router.put("/:id", protect, updateProductInShop);

// Delete a product from the shop
router.delete("/:id", protect, deleteProductFromShop);

export default router;
