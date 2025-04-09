"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Save, Loader2, Type, FileText, Link2, Github, Image as ImageIcon, Tag } from "lucide-react"; // Added icons

// Reusable Input Field Component with Floating Label
const FloatingLabelInput = ({ id, label, icon: Icon, value, onChange, ...props }) => (
    <div className="relative">
        {Icon && <Icon className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 peer-focus:text-[#00DDEB] z-10" size={18} />}
        <input
            id={id}
            value={value}
            onChange={onChange}
            className={`peer w-full p-3 ${Icon ? 'pl-10' : ''} pt-5 bg-[#121212] border border-[#39FF14]/50 rounded-md text-white placeholder-transparent focus:outline-none focus:border-[#00DDEB] transition-colors`}
            placeholder={label} // Keep placeholder for accessibility, but hide it visually
            {...props}
        />
        <label
            htmlFor={id}
            className={`absolute left-${Icon ? '10' : '3'} top-1 text-xs text-gray-400 transition-all duration-300 ease-in-out pointer-events-none
                        peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                        peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#00DDEB]
                        ${value ? "top-1 !text-xs text-[#39FF14]" : ""}`}
        >
            {label}
        </label>
    </div>
);

// Reusable Textarea Component with Floating Label
const FloatingLabelTextarea = ({ id, label, icon: Icon, value, onChange, ...props }) => (
    <div className="relative">
         {Icon && <Icon className="absolute top-5 left-3 text-gray-400 peer-focus:text-[#00DDEB] z-10" size={18} />}
        <textarea
            id={id}
            value={value}
            onChange={onChange}
            className={`peer w-full p-3 ${Icon ? 'pl-10' : ''} pt-6 bg-[#121212] border border-[#39FF14]/50 rounded-md text-white placeholder-transparent focus:outline-none focus:border-[#00DDEB] transition-colors min-h-[120px] resize-y`}
            placeholder={label}
            {...props}
        />
        <label
            htmlFor={id}
            className={`absolute left-${Icon ? '10' : '3'} top-2 text-xs text-gray-400 transition-all duration-300 ease-in-out pointer-events-none
                        peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                        peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#00DDEB]
                         ${value ? "top-2 !text-xs text-[#39FF14]" : ""}`}
        >
            {label}
        </label>
    </div>
);


export default function ProjectModal({ isOpen, onClose, onSaveSuccess, project }) {
    const [formData, setFormData] = useState({
        title: "", description: "", technologies: "", liveUrl: "", githubUrl: "", imageUrl: "",
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    // Effect to initialize/reset form data when modal opens or project changes
    useEffect(() => {
        if (isOpen) {
            setSaveError(null); // Clear previous errors on open
            setIsSaving(false); // Ensure saving state is reset
            if (project) {
                setFormData({
                    title: project.title || "",
                    description: project.description || "",
                    technologies: Array.isArray(project.technologies) ? project.technologies.join(", ") : (project.technologies || ""), // Handle array or string
                    liveUrl: project.liveUrl || "",
                    githubUrl: project.githubUrl || "",
                    imageUrl: project.imageUrl || "",
                });
            } else {
                // Reset for new project
                setFormData({ title: "", description: "", technologies: "", liveUrl: "", githubUrl: "", imageUrl: "" });
            }
        }
    }, [isOpen, project]);

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (isSaving) return; // Prevent double submission

        setIsSaving(true);
        setSaveError(null);

        const method = project ? "PUT" : "POST";
        const url = project ? `/api/project/${project._id}` : "/api/project";
        const technologiesArray = formData.technologies
            .split(",")
            .map((tech) => tech.trim())
            .filter((tech) => tech); // Remove empty entries

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, technologies: technologiesArray }),
            });

             if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: "An error occurred during save." }));
                throw new Error(errorData.message || `Failed to save project (${res.status})`);
             }

            onSaveSuccess(); // Call the success handler passed from parent
            // No need to call onClose here if onSaveSuccess handles it or if you want to keep it open briefly

        } catch (err) {
             console.error("Save Project Error:", err);
            setSaveError(err.message || "Could not save project.");
        } finally {
             // Keep modal open on error, otherwise it closes via onSaveSuccess -> setIsModalOpen(false) in parent
             if (!saveError) {
                 // If successful, let parent handle closing. If error occurred, we want to stay open.
             }
             setIsSaving(false);
        }
    }

    // if (!isOpen) return null; // Handled by AnimatePresence in parent now

    return (
        // Modal backdrop
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
            {/* Modal Content */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-[#1A1A1A] p-6 sm:p-8 rounded-xl w-full max-w-2xl shadow-2xl border border-[#39FF14]/30 relative max-h-[90vh] flex flex-col" // Limit height and make it flex column
            >
                {/* Header with Close Button */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#39FF14]/20">
                    <h2 className="text-2xl font-bold text-[#39FF14]">
                        {project ? "Edit Project" : "Add New Project"}
                    </h2>
                     <motion.button
                        whileHover={{ scale: 1.1, rotate: 90, color: '#FF5555' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-400 hover:bg-gray-700/50 transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={24} />
                    </motion.button>
                </div>

                {/* Form Area (Scrollable) */}
                 <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-[#39FF14]/50 scrollbar-track-[#1A1A1A]"> {/* Make form scrollable */}
                     {/* Use FloatingLabelInput/Textarea */}
                     <FloatingLabelInput id="title" name="title" label="Project Title" icon={Type} value={formData.title} onChange={handleChange} required />
                     <FloatingLabelTextarea id="description" name="description" label="Description" icon={FileText} value={formData.description} onChange={handleChange} required />
                     <FloatingLabelInput id="technologies" name="technologies" label="Technologies (comma-separated)" icon={Tag} value={formData.technologies} onChange={handleChange} />
                     <FloatingLabelInput id="liveUrl" name="liveUrl" label="Live URL (optional)" icon={Link2} type="url" value={formData.liveUrl} onChange={handleChange} />
                     <FloatingLabelInput id="githubUrl" name="githubUrl" label="GitHub URL (optional)" icon={Github} type="url" value={formData.githubUrl} onChange={handleChange} />
                     <FloatingLabelInput id="imageUrl" name="imageUrl" label="Image URL (optional)" icon={ImageIcon} type="url" value={formData.imageUrl} onChange={handleChange} />
                 </form>

                {/* Footer with Actions and Error */}
                <div className="mt-6 pt-4 border-t border-[#39FF14]/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                     {/* Save Error Display */}
                     <div className="w-full sm:w-auto order-2 sm:order-1 text-center sm:text-left">
                        {saveError && (
                            <p className="text-sm text-red-400 flex items-center gap-1">
                               <AlertTriangle size={16} /> {saveError}
                            </p>
                        )}
                    </div>
                    {/* Action Buttons */}
                    <div className="flex space-x-3 order-1 sm:order-2">
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-5 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            type="submit" // Changed to trigger form onSubmit
                            form="project-form" // Associate with form if needed, though default usually works
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            disabled={isSaving}
                            onClick={handleSubmit} // Also explicitly call handleSubmit
                            className={`flex items-center justify-center gap-2 px-5 py-2 bg-[#39FF14] text-black font-semibold rounded-lg hover:bg-[#00DDEB] transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-w-[100px]`}
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {isSaving ? "Saving..." : "Save"}
                        </motion.button>
                    </div>
                 </div>
            </motion.div>
        </div>
    );
}