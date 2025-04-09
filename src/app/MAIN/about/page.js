"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function AboutPage() {
  const [formData, setFormData] = useState({
    bio: "",
    skills: [],
    education: [],
    resumeLink: "",
  });
  const [newSkill, setNewSkill] = useState("");
  const [newEducation, setNewEducation] = useState({ degree: "", institution: "", year: "" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAboutData();
  }, []);

  async function fetchAboutData() {
    setIsLoading(true);
    const res = await fetch("/api/about");
    const data = await res.json();
    setFormData({
      bio: data.bio || "",
      skills: data.skills || [],
      education: data.education || [],
      resumeLink: data.resumeLink || "",
    });
    setIsLoading(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleAddSkill(e) {
    e.preventDefault();
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  }

  function handleRemoveSkill(skill) {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  }

  function handleEducationChange(index, field, value) {
    const updatedEducation = [...formData.education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setFormData((prev) => ({ ...prev, education: updatedEducation }));
  }

  function handleAddEducation(e) {
    e.preventDefault();
    if (newEducation.degree && newEducation.institution) {
      setFormData((prev) => ({
        ...prev,
        education: [...prev.education, { ...newEducation }],
      }));
      setNewEducation({ degree: "", institution: "", year: "" });
    }
  }

  function handleRemoveEducation(index) {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    await fetch("/api/about", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setIsLoading(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-[#121212] text-white min-h-screen"
    >
      <div className="p-6 md:p-10 pt-16 md:pt-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl md:text-4xl font-bold text-[#39FF14] mb-8"
        >
          About
        </motion.h1>

        {isLoading ? (
          <p className="text-gray-400 text-center">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            {/* Bio */}
            <div>
              <label className="block text-[#39FF14] font-semibold mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full p-3 bg-[#1A1A1A] text-white border border-[#39FF14]/20 rounded-md resize-none"
                rows={5}
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-[#39FF14] font-semibold mb-2">Skills</label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="w-full p-3 bg-[#1A1A1A] text-white border border-[#39FF14]/20 rounded-md"
                  placeholder="Add a skill (e.g., JavaScript)"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-[#39FF14] text-black font-semibold rounded-md hover:bg-[#00DDEB] transition-colors"
                >
                  Add
                </motion.button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center bg-[#39FF14]/20 text-white px-3 py-1 rounded-full"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 text-red-500 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <label className="block text-[#39FF14] font-semibold mb-2">Education</label>
              <div className="space-y-4">
                {formData.education.map((edu, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-[#1A1A1A] border border-[#39FF14]/20 rounded-md"
                  >
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                        className="w-full p-2 bg-[#121212] text-white border border-[#39FF14]/20 rounded-md"
                        placeholder="Degree (e.g., B.S. in Computer Science)"
                        required
                      />
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(index, "institution", e.target.value)}
                        className="w-full p-2 bg-[#121212] text-white border border-[#39FF14]/20 rounded-md"
                        placeholder="Institution (e.g., XYZ University)"
                        required
                      />
                      <input
                        type="text"
                        value={edu.year}
                        onChange={(e) => handleEducationChange(index, "year", e.target.value)}
                        className="w-24 p-2 bg-[#121212] text-white border border-[#39FF14]/20 rounded-md"
                        placeholder="Year (e.g., 2020)"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => handleRemoveEducation(index)}
                      className="px-4 py-1 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </motion.button>
                  </motion.div>
                ))}
                <div className="p-4 bg-[#1A1A1A] border border-[#39FF14]/20 rounded-md">
                  <h3 className="text-[#39FF14] font-semibold mb-2">Add New Education</h3>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={newEducation.degree}
                      onChange={(e) => setNewEducation((prev) => ({ ...prev, degree: e.target.value }))}
                      className="w-full p-2 bg-[#121212] text-white border border-[#39FF14]/20 rounded-md"
                      placeholder="Degree"
                    />
                    <input
                      type="text"
                      value={newEducation.institution}
                      onChange={(e) => setNewEducation((prev) => ({ ...prev, institution: e.target.value }))}
                      className="w-full p-2 bg-[#121212] text-white border border-[#39FF14]/20 rounded-md"
                      placeholder="Institution"
                    />
                    <input
                      type="text"
                      value={newEducation.year}
                      onChange={(e) => setNewEducation((prev) => ({ ...prev, year: e.target.value }))}
                      className="w-24 p-2 bg-[#121212] text-white border border-[#39FF14]/20 rounded-md"
                      placeholder="Year"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleAddEducation}
                    className="px-4 py-2 bg-[#39FF14] text-black font-semibold rounded-md hover:bg-[#00DDEB] transition-colors"
                  >
                    Add Education
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Resume Link */}
            <div>
              <label className="block text-[#39FF14] font-semibold mb-2">Resume Link</label>
              <input
                type="url"
                name="resumeLink"
                value={formData.resumeLink}
                onChange={handleChange}
                className="w-full p-3 bg-[#1A1A1A] text-white border border-[#39FF14]/20 rounded-md"
                placeholder="URL to your resume (e.g., Google Drive link)"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 bg-[#39FF14] text-black font-semibold rounded-md hover:bg-[#00DDEB] transition-colors ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </motion.button>
          </form>
        )}
      </div>
    </motion.div>
  );
}