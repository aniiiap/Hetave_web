import mongoose from "mongoose";

const insuranceEnquirySchema = new mongoose.Schema(
  {
    service: { type: mongoose.Schema.Types.ObjectId, ref: "InsuranceService" },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const InsuranceEnquiry = mongoose.model("InsuranceEnquiry", insuranceEnquirySchema);
export default InsuranceEnquiry;


