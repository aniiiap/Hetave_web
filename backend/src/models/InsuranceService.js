import mongoose from "mongoose";

const insuranceServiceSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
  },
  { timestamps: true }
);

const InsuranceService = mongoose.model("InsuranceService", insuranceServiceSchema);
export default InsuranceService;


