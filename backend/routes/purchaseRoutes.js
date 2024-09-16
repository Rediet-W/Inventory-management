import express from "express";
import {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  deletePurchase,
} from "../controllers/purchaseController.js";

const router = express.Router();

// @route   POST /api/purchases
// @desc    Create a new purchase
// @access  Private (admin only)
router.post("/", createPurchase);

// @route   GET /api/purchases
// @desc    Get all purchases (with optional date range filter)
// @access  Private
router.get("/", getAllPurchases);

// @route   GET /api/purchases/:id
// @desc    Get purchase by ID
// @access  Private
router.get("/:id", getPurchaseById);

// @route   DELETE /api/purchases/:id
// @desc    Delete a purchase
// @access  Private (admin only)
router.delete("/:id", deletePurchase);

export default router;
