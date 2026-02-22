import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    productTitle: { type: String, required: true },
    color: { type: String, default: "" },
    size: { type: String, default: "" },
    quantity: { type: Number, default: 1 },
    price: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
      get: (v: mongoose.Schema.Types.Decimal128) => parseFloat(v.toString()),
    },
  },
  { _id: false, toJSON: { getters: true } }
);

const OrderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, default: "Guest" },
    customerEmail: { type: String, default: "" },
    country: { type: String, default: "Unknown" },
    items: [OrderItemSchema],
    totalAmount: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
      get: (v: mongoose.Schema.Types.Decimal128) => parseFloat(v.toString()),
    },
    currency: { type: String, default: "USD" },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { toJSON: { getters: true } }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ customer: 1 });

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
