import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 100 }, // Added maxlength for safety
    email: { type: String, required: false, maxlength: 100 }, // Made optional
    message: { type: String, required: true, maxlength: 500 }, // Added maxlength to limit message length
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    }, // Added status field
    reply: { type: String, maxlength: 500 }, // Single reply field
    repliedAt: { type: Date }, // Timestamp for when the reply was added
  },
  { timestamps: true }
);

const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);

export default Feedback;