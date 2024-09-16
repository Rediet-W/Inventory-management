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
  buyingPrice: {
    type: Number,
    required: true,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
});
const Purchase = mongoose.model("Purchase", PurchaseSchema);

export default Purchase;
