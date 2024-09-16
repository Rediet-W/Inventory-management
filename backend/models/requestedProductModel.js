import mongoose from "mongoose";

const RequestedProductSchema = new mongoose.Schema({
  product: {
    type: String, // Changed from ObjectId to String
    required: true,
  },
  description: {
    type: String,
    required: true,
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
