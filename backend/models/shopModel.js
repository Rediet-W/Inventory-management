import mongoose from "mongoose";

const ShopSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  batchNumber: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  sellingPrice: {
    type: Number,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
});

const Shop = mongoose.model("Shop", ShopSchema);
export default Shop;
