import mongoose from "mongoose";

const EducationSchema = new mongoose.Schema({
  degree: { type: String, required: true, maxlength: 100 }, // e.g., "B.S. in Computer Science"
  institution: { type: String, required: true, maxlength: 100 }, // e.g., "XYZ University"
  year: { type: String, maxlength: 10 }, // e.g., "2020"
});

const AboutSchema = new mongoose.Schema(
  {
    bio: { type: String, maxlength: 1000 }, // Personal bio
    skills: [{ type: String, maxlength: 50 }], // Array of skills (e.g., ["JavaScript", "React"])
    education: [EducationSchema], // Array of education entries
    resumeLink: { type: String, maxlength: 500 }, // URL to a downloadable resume
  },
  { timestamps: true }
);

const About = mongoose.models.About || mongoose.model("About", AboutSchema);

export default About;