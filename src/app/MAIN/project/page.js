"use client";
import { useState, useEffect, Fragment } from "react"; // Added Fragment
import { motion, AnimatePresence } from "framer-motion";
import ProjectModal from "@/components/ProjectModal"; // Assuming path is correct
import { Plus, Edit, Trash2, Loader2, AlertTriangle, ServerCrash } from "lucide-react"; // Icons
import { format } from 'date-fns'; // For formatting dates

// --- Skeleton Loader for Table Rows ---
const SkeletonRow = () => (
    <tr className="border-b border-gray-700/50">
        <td className="p-4"><div className="h-4 bg-gray-700/50 rounded animate-pulse w-3/4"></div></td>
        <td className="p-4 hidden md:table-cell"><div className="h-4 bg-gray-700/50 rounded animate-pulse w-1/2"></div></td>
        <td className="p-4">
            <div className="flex space-x-2">
                <div className="h-8 w-16 bg-gray-700/50 rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-gray-700/50 rounded animate-pulse"></div>
            </div>
        </td>
    </tr>
);

export default function ProjectPage() {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null); // Track which project is being deleted

    // --- Framer Motion Variants ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }, // Faster stagger for table rows
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, x: -50, transition: { duration: 0.3 } } // Slide out on delete
    };

    // --- Data Fetching ---
    useEffect(() => {
        fetchProjects();
    }, []);

    async function fetchProjects() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/project");
            if (!res.ok) throw new Error(`Failed to fetch projects (${res.status})`);
            const data = await res.json();
            setProjects(Array.isArray(data) ? data : []); // Ensure data is an array
        } catch (err) {
            console.error("Fetch Projects Error:", err);
            setError(err.message || "Could not load projects.");
            setProjects([]); // Clear projects on error
        } finally {
            setLoading(false);
        }
    }

    // --- CRUD Handlers ---
    async function handleDelete(id) {
        // Confirmation Dialog
        if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
            return;
        }

        setDeletingId(id); // Show loading state on the specific delete button
        setError(null); // Clear previous errors
        try {
            const res = await fetch(`/api/project/${id}`, { method: "DELETE" });
            if (!res.ok) {
                 const errorData = await res.json().catch(() => ({ message: "Unknown error occurred" }));
                 throw new Error(errorData.message || `Failed to delete project (${res.status})`);
            }
            // Optimistic UI update (remove immediately) or refetch:
            // setProjects(prev => prev.filter(p => p._id !== id));
            await fetchProjects(); // Refetch to ensure consistency
        } catch (err) {
            console.error("Delete Project Error:", err);
            setError(err.message || "Could not delete project.");
            // Optionally: add the item back if optimistic UI was used and failed
        } finally {
            setDeletingId(null); // Clear loading state for the button
        }
    }

    function handleEdit(project) {
        setSelectedProject(project);
        setIsModalOpen(true);
    }

    function handleAddProject() {
        setSelectedProject(null); // Ensure no project data is passed for adding
        setIsModalOpen(true);
    }

    // Saved via Modal, just need to refetch
    function handleSaveSuccess() {
        setIsModalOpen(false);
        fetchProjects(); // Refresh the list after saving
    }
    // --- End CRUD Handlers ---

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-6 md:p-10" // Let layout handle bg and min-h
        >
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-3xl md:text-4xl font-bold text-[#39FF14] tracking-wide"
                >
                    Manage Projects
                </motion.h1>
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(57, 255, 20, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddProject}
                    className="flex items-center gap-2 px-5 py-2 bg-[#39FF14] text-black font-semibold rounded-lg hover:bg-[#00DDEB] transition-all duration-300"
                >
                    <Plus size={20} />
                    Add Project
                </motion.button>
            </div>

            {/* Error Display */}
            <AnimatePresence>
                {error && (
                     <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center gap-3"
                    >
                        <AlertTriangle size={20} />
                        <span>Error: {error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content Area */}
            <div className="bg-[#1A1A1A]/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-[#39FF14]/20 overflow-x-auto">
                {loading ? (
                    // --- Loading Skeletons ---
                    <table className="w-full min-w-[600px]">
                        <thead>
                             <tr className="border-b border-gray-600 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                                <th className="p-4">Title</th>
                                <th className="p-4 hidden md:table-cell">Date Added</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                           {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
                        </tbody>
                    </table>
                ) : projects.length === 0 && !error ? (
                     // --- Empty State ---
                    <div className="text-center py-16 text-gray-400">
                         <ServerCrash size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-xl mb-2">No projects found.</p>
                        <p>Click &quot;Add Project&quot; to get started!</p>
                    </div>
                ) : (
                     // --- Projects Table ---
                     <table className="w-full min-w-[600px] text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#39FF14]/30 text-left text-sm font-semibold text-[#39FF14] uppercase tracking-wider">
                                <th className="p-4">Title</th>
                                <th className="p-4 hidden md:table-cell">Date Added</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                         <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                             {/* Use AnimatePresence to animate row exits */}
                            <AnimatePresence initial={false}>
                                {projects.map((project) => (
                                    <motion.tr
                                        key={project._id}
                                        variants={itemVariants}
                                        layout // Enable layout animation for smooth reordering/deletion
                                        exit="exit" // Use the exit variant defined above
                                        className="border-b border-gray-700/50 hover:bg-gray-500/10 transition-colors duration-200 group"
                                    >
                                        <td className="p-4 text-white font-medium align-middle">{project.title}</td>
                                        <td className="p-4 text-gray-400 align-middle hidden md:table-cell">
                                            {project.createdAt ? format(new Date(project.createdAt), 'dd MMM yyyy') : 'N/A'}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center space-x-2">
                                                 <motion.button
                                                     whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}
                                                     onClick={() => handleEdit(project)}
                                                     className="p-2 rounded-md bg-cyan-600/20 text-cyan-300 hover:bg-[#00DDEB]/30 hover:text-white transition-all"
                                                     title="Edit Project"
                                                 >
                                                     <Edit size={16} />
                                                 </motion.button>
                                                 <motion.button
                                                     whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}
                                                     onClick={() => handleDelete(project._id)}
                                                     disabled={deletingId === project._id} // Disable while deleting this specific item
                                                     className={`p-2 rounded-md bg-red-600/20 text-red-300 hover:bg-red-500/30 hover:text-white transition-all relative ${deletingId === project._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                     title="Delete Project"
                                                 >
                                                     {deletingId === project._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
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

            {/* Modal Rendering */}
            {/* Wrap Modal in AnimatePresence for smooth entry/exit */}
             <AnimatePresence>
                {isModalOpen && (
                    <ProjectModal
                        // key prop helps AnimatePresence track the modal instance
                        key={selectedProject?._id || 'new-project-modal'}
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSaveSuccess={handleSaveSuccess} // Use the new handler
                        project={selectedProject}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}