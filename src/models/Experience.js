import mongoose from "mongoose";

const ExperienceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 100 }, // e.g., "Software Engineer"
    company: { type: String, required: true, maxlength: 100 }, // e.g., "Tech Corp"
    location: { type: String, maxlength: 100 }, // e.g., "Remote" or "New York, NY"
    startDate: { type: Date, required: true }, // e.g., "2023-01-01"
    endDate: { type: Date }, // Optional if isCurrent is true
    isCurrent: { type: Boolean, default: false }, // Indicates if this is the current role
    description: { type: String, maxlength: 1000 }, // Role description
  },
  { timestamps: true }
);

const Experience = mongoose.models.Experience || mongoose.model("Experience", ExperienceSchema);

export default Experience;