import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ExperienceModal({ isOpen, onClose, onSave, experience }) {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    description: "",
  });

  useEffect(() => {
    if (experience) {
      setFormData({
        title: experience.title || "",
        company: experience.company || "",
        location: experience.location || "",
        startDate: experience.startDate ? new Date(experience.startDate).toISOString().split("T")[0] : "",
        endDate: experience.endDate ? new Date(experience.endDate).toISOString().split("T")[0] : "",
        isCurrent: experience.isCurrent || false,
        description: experience.description || "",
      });
    }
  }, [experience]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(formData);
  }

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#1A1A1A] p-6 rounded-lg w-full max-w-md border border-[#39FF14]/20"
      >
        <h2 className="text-2xl font-bold text-[#39FF14] mb-4">
          {experience ? "Edit Experience" : "Add Experience"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 bg-[#121212] text-white border border-[#39FF14]/20 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-white mb-1">Company</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full p-2 bg-[#121212] text-white border border-[#39FF14]/20 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-white mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-2 bg-[#121212] text-white border border-[#39FF14]/20 rounded-md"
            />
          </div>
          <div>
            <label className="block text-white mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full p-2 bg-[#121212] text-white border border-[#39FF14]/20 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-white mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full p-2 bg-[#121212] text-white border border-[#39FF14]/20 rounded-md"
              disabled={formData.isCurrent}
            />
          </div>
          <div>
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                name="isCurrent"
                checked={formData.isCurrent}
                onChange={handleChange}
                className="mr-2"
              />
              Current Role
            </label>
          </div>
          <div>
            <label className="block text-white mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 bg-[#121212] text-white border border-[#39FF14]/20 rounded-md resize-none"
              rows={4}
            />
          </div>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-4 py-2 bg-[#39FF14] text-black font-semibold rounded-md hover:bg-[#00DDEB] transition-colors"
            >
              Save
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}