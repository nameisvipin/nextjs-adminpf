"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ExperienceModal from "@/components/ExperienceModal";

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchExperiences();
  }, []);

  async function fetchExperiences() {
    const res = await fetch("/api/experience");
    const data = await res.json();
    setExperiences(data);
  }

  async function handleDelete(id) {
    if (confirm("Are you sure you want to delete this experience?")) {
      await fetch(`/api/experience/${id}`, { method: "DELETE" });
      fetchExperiences();
    }
  }

  function handleEdit(experience) {
    setSelectedExperience(experience);
    setIsModalOpen(true);
  }

  function handleAddExperience() {
    setSelectedExperience(null);
    setIsModalOpen(true);
  }

  async function handleSaveExperience(formData) {
    const method = selectedExperience ? "PUT" : "POST";
    const url = selectedExperience ? `/api/experience/${selectedExperience._id}` : "/api/experience";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setIsModalOpen(false);
    fetchExperiences();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-[#121212] text-white min-h-screen"
    >
      <div className="p-6 md:p-10 pt-16 md:pt-10">
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold text-[#39FF14]"
          >
            Experiences
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddExperience}
            className="px-6 py-2 bg-[#39FF14] text-black font-semibold rounded-md hover:bg-[#00DDEB] transition-colors"
          >
            + Add Experience
          </motion.button>
        </div>

        {experiences.length === 0 ? (
          <p className="text-gray-400 text-center">No experiences yet. Add one to get started!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1A1A1A] text-[#39FF14]">
                  <th className="p-4 font-semibold">Title</th>
                  <th className="p-4 font-semibold">Company</th>
                  <th className="p-4 font-semibold">Date Range</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {experiences.map((experience, index) => (
                  <motion.tr
                    key={experience._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border-b border-[#39FF14]/20 hover:bg-[#1A1A1A] transition-colors"
                  >
                    <td className="p-4">{experience.title}</td>
                    <td className="p-4">{experience.company}</td>
                    <td className="p-4">
                      {new Date(experience.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      -{" "}
                      {experience.isCurrent
                        ? "Present"
                        : experience.endDate
                        ? new Date(experience.endDate).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })
                        : "N/A"}
                    </td>
                    <td className="p-4 flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(experience)}
                        className="px-4 py-1 bg-[#00DDEB] text-black font-semibold rounded-md hover:bg-[#39FF14] transition-colors"
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(experience._id)}
                        className="px-4 py-1 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ExperienceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExperience}
        experience={selectedExperience}
      />
    </motion.div>
  );
}