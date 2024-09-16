import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true, // Make sure quantity is required
      default: 0,
    },
    buyingPrice: {
      type: Number,
      required: true,
    },
    sellingPrice: {
      type: Number,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
