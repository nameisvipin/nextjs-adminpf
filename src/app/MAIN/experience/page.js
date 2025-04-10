"use client";
import { useState, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ExperienceModal from "@/components/ExperienceModal"; // Assuming path
import { format, formatDistanceStrict } from 'date-fns'; // For date formatting
import {
    Plus, Edit, Trash2, Loader2, AlertTriangle, Briefcase, Building, MapPin, Calendar, ServerCrash // Icons
} from "lucide-react";

// --- Skeleton Loader for Table Rows ---
const SkeletonRow = () => (
    <tr className="border-b border-gray-700/50">
        {[...Array(5)].map((_, i) => ( // Adjust count based on columns
            <td key={i} className={`p-4 ${i === 2 ? 'hidden lg:table-cell' : ''}`}> {/* Hide Location on smaller screens */}
                <div className="h-4 bg-gray-700/50 rounded animate-pulse w-full"></div>
                {i === 0 && <div className="h-3 mt-1.5 bg-gray-700/50 rounded animate-pulse w-1/2"></div>} {/* Smaller line for company/location */}
            </td>
        ))}
        <td className="p-4">
            <div className="flex space-x-2">
                <div className="h-8 w-8 bg-gray-700/50 rounded-full animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-700/50 rounded-full animate-pulse"></div>
            </div>
        </td>
    </tr>
);

// --- Helper to format date range ---
function formatDateRange(startDateStr, endDateStr, isCurrent) {
    try {
        const start = new Date(startDateStr);
        const end = endDateStr ? new Date(endDateStr) : null;
        const startFormatted = format(start, 'MMM yyyy');

        if (isCurrent) {
            const duration = formatDistanceStrict(start, new Date(), { addSuffix: false });
            return `${startFormatted} - Present (${duration})`;
        } else if (end) {
            const endFormatted = format(end, 'MMM yyyy');
             // Calculate duration only if end date is valid and different from start date
             let duration = "";
             if (!isNaN(end.getTime()) && start.getTime() !== end.getTime()) {
                  // Ensure end is after start for valid duration
                 if (end > start) {
                    duration = formatDistanceStrict(start, end, { addSuffix: false });
                 }
             }
            return `${startFormatted} - ${endFormatted}${duration ? ` (${duration})` : ''}`;
        } else {
            return `${startFormatted} - N/A`; // No end date provided, not current
        }
    } catch (e) {
        console.error("Date formatting error:", e);
        return "Invalid Date";
    }
}


export default function ExperiencePage() {
    const [experiences, setExperiences] = useState([]);
    const [selectedExperience, setSelectedExperience] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // --- Framer Motion Variants ---
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, x: -50, transition: { duration: 0.3 } } };

    // --- Data Fetching ---
    useEffect(() => { fetchExperiences(); }, []);

    async function fetchExperiences() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/experience");
            if (!res.ok) throw new Error(`Failed to fetch experiences (${res.status})`);
            const data = await res.json();
             // Sort by start date, newest first
             const sortedData = data.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
            setExperiences(Array.isArray(sortedData) ? sortedData : []);
        } catch (err) {
            console.error("Fetch Experiences Error:", err);
            setError(err.message || "Could not load experiences.");
            setExperiences([]);
        } finally {
            setLoading(false);
        }
    }

    // --- Delete Handler ---
    async function handleDelete(id) {
        if (!window.confirm("Are you sure you want to delete this experience?")) return;
        setDeletingId(id);
        setError(null);
        try {
            const res = await fetch(`/api/experience/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`Failed to delete experience (${res.status})`);
            setExperiences(prev => prev.filter(exp => exp._id !== id)); // Optimistic UI
        } catch (err) {
            console.error("Delete Experience Error:", err);
            setError(err.message || "Could not delete experience.");
            // fetchExperiences(); // Optionally refetch to revert optimistic update on error
        } finally {
            setDeletingId(null);
        }
    }

    // --- Edit/Add Handlers ---
    function handleEdit(experience) { setSelectedExperience(experience); setIsModalOpen(true); }
    function handleAddExperience() { setSelectedExperience(null); setIsModalOpen(true); }
    function handleSaveSuccess() { setIsModalOpen(false); fetchExperiences(); }

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
            className="p-6 md:p-10" // Let layout handle bg/min-h
        >
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-3xl md:text-4xl font-bold text-[#39FF14] tracking-wide">
                    Manage Experience
                </motion.h1>
                <motion.button whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(57, 255, 20, 0.5)" }} whileTap={{ scale: 0.95 }}
                    onClick={handleAddExperience} className="flex items-center gap-2 px-5 py-2 bg-[#39FF14] text-black font-semibold rounded-lg hover:bg-[#00DDEB] transition-all duration-300">
                    <Plus size={20} /> Add Experience
                </motion.button>
            </div>

            {/* Error Display */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
                        <AlertTriangle size={20} /> <span>Error: {error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content Area */}
            <div className="bg-[#1A1A1A]/80 backdrop-blur-sm p-1 sm:p-2 md:p-4 rounded-xl shadow-lg border border-[#39FF14]/20 overflow-hidden">
                 <div className="overflow-x-auto">
                     {loading ? (
                         <table className="w-full min-w-[700px]">
                             <thead className="bg-[#1A1A1A]">
                                 <tr className="border-b border-gray-600 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                                     <th className="p-4">Role / Company</th>
                                     <th className="p-4 hidden lg:table-cell">Location</th>
                                     <th className="p-4">Duration</th>
                                     <th className="p-4">Actions</th>
                                 </tr>
                             </thead>
                             <tbody>{[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}</tbody>
                         </table>
                     ) : experiences.length === 0 && !error ? (
                         <div className="text-center py-20 text-gray-400">
                             <ServerCrash size={48} className="mx-auto mb-4 opacity-50" />
                             <p className="text-xl mb-2">No experiences added yet.</p>
                             <p>Click &quot;Add Experience&quot; to build your timeline.</p>
                         </div>
                     ) : (
                         <table className="w-full min-w-[700px] text-left">
                             <thead className="bg-[#1A1A1A]/50 sticky top-0 z-10 backdrop-blur-sm">
                                 <tr className="border-b border-[#39FF14]/30 text-left text-xs sm:text-sm font-semibold text-[#39FF14] uppercase tracking-wider">
                                     <th className="p-3 sm:p-4">Role / Company</th>
                                     <th className="p-3 sm:p-4 hidden lg:table-cell">Location</th>
                                     <th className="p-3 sm:p-4">Duration</th>
                                     <th className="p-3 sm:p-4">Actions</th>
                                 </tr>
                             </thead>
                             <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                                 <AnimatePresence initial={false}>
                                     {experiences.map((exp) => (
                                         <motion.tr key={exp._id} variants={itemVariants} layout exit="exit"
                                             className="border-b border-gray-700/50 hover:bg-gray-500/10 transition-colors duration-200 group align-top">
                                             {/* Role / Company */}
                                             <td className="p-3 sm:p-4">
                                                 <div className="flex items-center gap-2 mb-0.5">
                                                     <Briefcase size={14} className="text-[#39FF14] flex-shrink-0" />
                                                     <span className="font-semibold text-white text-sm sm:text-base">{exp.title}</span>
                                                 </div>
                                                  <div className="flex items-center gap-2 pl-[22px]">
                                                      <Building size={12} className="text-gray-400 flex-shrink-0" />
                                                      <span className="text-gray-400 text-xs sm:text-sm">{exp.company}</span>
                                                  </div>
                                             </td>
                                              {/* Location */}
                                             <td className="p-3 sm:p-4 text-gray-400 text-xs sm:text-sm hidden lg:table-cell">
                                                 {exp.location || 'N/A'}
                                             </td>
                                             {/* Duration */}
                                             <td className="p-3 sm:p-4 text-gray-300 text-xs sm:text-sm whitespace-nowrap">
                                                 {formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}
                                             </td>
                                             {/* Actions */}
                                             <td className="p-3 sm:p-4">
                                                 <div className="flex items-center space-x-1 sm:space-x-2">
                                                     <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEdit(exp)}
                                                         className="p-1.5 rounded-md bg-cyan-600/20 text-cyan-300 hover:bg-[#00DDEB]/30 hover:text-white transition-all" title="Edit Experience">
                                                         <Edit size={16} />
                                                     </motion.button>
                                                     <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(exp._id)} disabled={deletingId === exp._id}
                                                         className={`p-1.5 rounded-md bg-red-600/20 text-red-300 hover:bg-red-500/30 hover:text-white transition-all ${deletingId === exp._id ? 'opacity-50 cursor-not-allowed' : ''}`} title="Delete Experience">
                                                         {deletingId === exp._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                     </motion.button>
                                                 </div>
                                             </td>
                                         </motion.tr>
                                     ))}
                                 </AnimatePresence>
                             </motion.tbody>
                         </table>
                     )}
                 </div>
            </div>

            {/* Modal Rendering */}
            <AnimatePresence>
                {isModalOpen && (
                    <ExperienceModal
                        key={selectedExperience?._id || 'new-experience-modal'}
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSaveSuccess={handleSaveSuccess}
                        experience={selectedExperience}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}