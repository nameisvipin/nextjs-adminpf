import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    technologies: [{ type: String, required: true }],
    liveUrl: { type: String },
    githubUrl: { type: String },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

// Fix: Correct model initialization
const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
export default Project;
