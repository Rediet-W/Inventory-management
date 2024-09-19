import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // Reference to the Product model
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  productName: {
    type: String, // New field to store the product name
    required: true,
  },
  buyingPrice: {
    type: Number,
    required: true,
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
});
const Purchase = mongoose.model("Purchase", PurchaseSchema);

export default Purchase;
