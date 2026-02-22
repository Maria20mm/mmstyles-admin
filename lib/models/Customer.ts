import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
  clerkId: { type: String, index: true, sparse: true },
  name: { type: String, required: true },
  email: { type: String, required: true, index: true },
  country: { type: String, default: "Unknown" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

CustomerSchema.index({ createdAt: -1 });

const Customer =
  mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);

export default Customer;
