import mongoose from "mongoose";

const saleSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
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
  },
  {
    timestamps: true,
  }
);

const Sale = mongoose.model("Sale", saleSchema);
export default Sale;
