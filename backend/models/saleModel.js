import mongoose from "mongoose";

const saleSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String, // New field to store the product name
      required: true,
    },
    batchNumber: {
      type: String, // Store the batch number
      required: true, // Batch number is now required
    },
    quantitySold: {
      type: Number,
      required: true,
    },
    sellingPrice: {
      type: Number,
      required: true,
    },
    saleDate: {
      type: Date,
      default: Date.now,
    },
    userName: {
      type: String, // New field to store the user's name
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Sale = mongoose.model("Sale", saleSchema);
export default Sale;
