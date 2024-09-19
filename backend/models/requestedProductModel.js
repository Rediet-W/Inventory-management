import mongoose from "mongoose";

const RequestedProductSchema = new mongoose.Schema({
  product: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1, // Add default quantity
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const RequestedProduct = mongoose.model(
  "RequestedProduct",
  RequestedProductSchema
);

export default RequestedProduct;
