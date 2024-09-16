import express from "express";
import {
  getRequestedProducts,
  createRequestedProduct,
  deleteRequestedProduct,
} from "../controllers/requestedproductController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getRequestedProducts)
  .post(protect, createRequestedProduct);

router.route("/:id").delete(protect, deleteRequestedProduct);

export default router;
