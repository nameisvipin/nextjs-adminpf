"use client";
import { useState, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, format } from 'date-fns'; // For relative and specific dates
import {
    CheckCircle, // Approved
    XCircle, // Rejected
    Clock, // Pending
    Trash2, // Delete
    Send, // Submit Reply
    Loader2, // Loading
    AlertTriangle, // Error
    Inbox, // Empty state icon
    User, // Name icon
    Mail, // Email icon
    MessageCircle // Message icon
} from "lucide-react";

// --- Skeleton Loader for Table Rows ---
const SkeletonRow = () => (
    <tr className="border-b border-gray-700/50">
        {[...Array(6)].map((_, i) => ( // Adjust count based on columns
            <td key={i} className={`p-4 ${i === 2 || i === 4 ? 'hidden lg:table-cell' : ''} ${i === 1 ? 'hidden md:table-cell' : ''}`}>
                <div className="h-4 bg-gray-700/50 rounded animate-pulse w-full"></div>
                {i === 4 && <div className="h-12 mt-2 bg-gray-700/50 rounded animate-pulse w-full"></div>} {/* Skeleton for reply area */}
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

// --- Status Badge Component ---
const StatusBadge = ({ status }) => {
    const statusConfig = {
        pending: { icon: Clock, color: "text-yellow-400", bgColor: "bg-yellow-900/30", label: "Pending" },
        approved: { icon: CheckCircle, color: "text-green-400", bgColor: "bg-green-900/30", label: "Approved" },
        rejected: { icon: XCircle, color: "text-red-400", bgColor: "bg-red-900/30", label: "Rejected" },
    };
    const config = statusConfig[status] || statusConfig.pending; // Default to pending if status is unknown
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
            <Icon size={14} />
            {config.label}
        </span>
    );
};


export default function FeedbackPage() {
    const [feedbackList, setFeedbackList] = useState([]);
    const [replyInputs, setReplyInputs] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Loading states for specific actions
    const [actionStates, setActionStates] = useState({}); // { [feedbackId]: { status?: 'loading' | 'error', reply?: 'loading' | 'error', delete?: 'loading' | 'error' } }

    // --- Framer Motion Variants ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
    };

    // --- Data Fetching ---
    useEffect(() => {
        fetchFeedback();
    }, []);

    async function fetchFeedback() {
        setLoading(true);
        setError(null);
        setActionStates({}); // Clear action states on refresh
        try {
            const res = await fetch("/api/feedback");
            if (!res.ok) throw new Error(`Failed to fetch feedback (${res.status})`);
            const data = await res.json();
            const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by newest first
            setFeedbackList(Array.isArray(sortedData) ? sortedData : []);

            const initialReplies = {};
            sortedData.forEach((feedback) => {
                initialReplies[feedback._id] = feedback.reply || "";
            });
            setReplyInputs(initialReplies);

        } catch (err) {
            console.error("Fetch Feedback Error:", err);
            setError(err.message || "Could not load feedback.");
            setFeedbackList([]);
        } finally {
            setLoading(false);
        }
    }

    // --- Action State Helper ---
    const setActionState = (id, action, state) => {
        setActionStates(prev => ({
            ...prev,
            [id]: { ...prev[id], [action]: state }
        }));
    };
    const clearActionState = (id, action) => {
        setActionStates(prev => {
            const currentActions = { ...prev[id] };
            delete currentActions[action];
            // If no actions left for this ID, remove the ID key
            if (Object.keys(currentActions).length === 0) {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            }
            return { ...prev, [id]: currentActions };
        });
    };

    // --- Update Status ---
    async function handleUpdateStatus(id, status) {
        setActionState(id, 'status', 'loading');
        setError(null);
        try {
            const res = await fetch(`/api/feedback/${id}`, {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error(`Failed to update status (${res.status})`);
            // Update UI directly for faster feedback (Optimistic UI)
            setFeedbackList(prev => prev.map(f => f._id === id ? { ...f, status } : f));
        } catch (err) {
            console.error("Update Status Error:", err);
            setError(`Failed to update status for feedback ID ${id.slice(-4)}.`); // Show specific error if possible
             setActionState(id, 'status', 'error'); // Keep error state
             // Revert optimistic UI if needed here by refetching or storing original state
            return; // Stop execution on error
        } finally {
             // Clear loading state only if no error occurred (or clear regardless based on desired UX)
             if (actionStates[id]?.status !== 'error') {
                 clearActionState(id, 'status');
             }
             // Option: Short delay before clearing loading to show success visually
             // setTimeout(() => clearActionState(id, 'status'), 500);
        }
    }

    // --- Add Reply ---
    async function handleAddReply(id) {
        const reply = replyInputs[id]?.trim();
        if (!reply || actionStates[id]?.reply === 'loading') return;

        setActionState(id, 'reply', 'loading');
        setError(null);
        try {
            const res = await fetch(`/api/feedback/${id}`, {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reply }),
            });
            if (!res.ok) throw new Error(`Failed to add reply (${res.status})`);
            const updatedFeedback = await res.json(); // Get updated feedback with repliedAt
            // Update UI
            setFeedbackList(prev => prev.map(f => f._id === id ? { ...f, reply: updatedFeedback.reply, repliedAt: updatedFeedback.repliedAt } : f));
            setReplyInputs(prev => ({ ...prev, [id]: updatedFeedback.reply })); // Ensure input matches saved reply
        } catch (err) {
            console.error("Add Reply Error:", err);
            setError(`Failed to add reply for feedback ID ${id.slice(-4)}.`);
             setActionState(id, 'reply', 'error');
            return;
        } finally {
             if (actionStates[id]?.reply !== 'error') {
                 clearActionState(id, 'reply');
             }
             // setTimeout(() => clearActionState(id, 'reply'), 500);
        }
    }

    // --- Delete Feedback ---
    async function handleDelete(id) {
        if (!window.confirm("Are you sure you want to delete this feedback?")) return;

        setActionState(id, 'delete', 'loading');
        setError(null);
        try {
            const res = await fetch(`/api/feedback/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`Failed to delete feedback (${res.status})`);
            // Optimistic UI update
            setFeedbackList(prev => prev.filter(f => f._id !== id));
        } catch (err) {
            console.error("Delete Feedback Error:", err);
            setError(`Failed to delete feedback ID ${id.slice(-4)}.`);
             setActionState(id, 'delete', 'error'); // Keep error state
            // Revert optimistic UI if needed by refetching
            // fetchFeedback();
            return;
        } finally {
             // Clear loading/error state regardless for delete as the item is gone or error is shown
            clearActionState(id, 'delete');
        }
    }

    // --- Handle Reply Input Change ---
    function handleReplyChange(id, value) {
        setReplyInputs((prev) => ({ ...prev, [id]: value }));
    }


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-6 md:p-10" // Let layout handle bg and min-h
        >
            {/* Header */}
            <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl md:text-4xl font-bold text-[#39FF14] mb-8 tracking-wide"
            >
                Manage Feedback
            </motion.h1>

            {/* Global Error Display */}
             <AnimatePresence>
                {error && !Object.values(actionStates).some(s => s.status === 'error' || s.reply === 'error' || s.delete === 'error') && ( // Show global error if no specific action error
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
            <div className="bg-[#1A1A1A]/80 backdrop-blur-sm rounded-xl shadow-lg border border-[#39FF14]/20 overflow-hidden"> {/* overflow-hidden needed for rounded corners */}
                <div className="overflow-x-auto">
                    {loading && feedbackList.length === 0 ? ( // Show skeletons only on initial load
                        <table className="w-full min-w-[1000px]">    
                            <thead className="bg-[#1A1A1A]">
                                <tr className="border-b border-[#39FF14]/30 text-left text-sm font-semibold text-[#39FF14] uppercase tracking-wider">
                                    <th className="p-4">Sender</th>
                                    <th className="p-4 hidden md:table-cell">Email</th>
                                    <th className="p-4 hidden lg:table-cell">Message</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 hidden lg:table-cell">Reply</th>
                                    <th className="p-4">Received</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                            </tbody>
                        </table>
                    ) : !loading && feedbackList.length === 0 && !error ? (
                        // --- Empty State ---
                        <div className="text-center py-20 text-gray-400">
                            <Inbox size={56} className="mx-auto mb-4 opacity-50" />
                            <p className="text-xl mb-2">No feedback received yet.</p>
                            <p>Feedback submitted by users will appear here.</p>
                        </div>
                    ) : (
                        // --- Feedback Table ---
                         <table className="w-full min-w-[1000px] text-left"> {/* Min width */}
                             <thead className="bg-[#1A1A1A]/50 sticky top-0 z-10 backdrop-blur-sm"> {/* Sticky header */}
                                 <tr className="border-b border-[#39FF14]/30 text-left text-sm font-semibold text-[#39FF14] uppercase tracking-wider">
                                    <th className="p-4">Sender</th>
                                    <th className="p-4 hidden md:table-cell">Email</th>
                                    <th className="p-4 hidden lg:table-cell">Message</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 hidden lg:table-cell">Reply</th>
                                    <th className="p-4">Received</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                                <AnimatePresence initial={false}>
                                    {feedbackList.map((feedback) => {
                                        const id = feedback._id;
                                        const isLoadingStatus = actionStates[id]?.status === 'loading';
                                        const isLoadingReply = actionStates[id]?.reply === 'loading';
                                        const isLoadingDelete = actionStates[id]?.delete === 'loading';
                                        const hasErrorStatus = actionStates[id]?.status === 'error';
                                        const hasErrorReply = actionStates[id]?.reply === 'error';
                                        const hasErrorDelete = actionStates[id]?.delete === 'error'; // Currently unused visually, could add indicators

                                        return (
                                            <motion.tr
                                                key={id}
                                                variants={itemVariants}
                                                layout exit="exit"
                                                className="border-b border-gray-700/50 hover:bg-gray-500/10 transition-colors duration-200"
                                            >
                                                {/* Sender */}
                                                <td className="p-4 align-top">
                                                    <div className="flex items-center gap-2">
                                                        <User size={16} className="text-gray-400 flex-shrink-0" />
                                                        <span className="font-medium text-white">{feedback.name}</span>
                                                    </div>
                                                </td>
                                                {/* Email */}
                                                <td className="p-4 align-top hidden md:table-cell">
                                                    <span className="text-gray-400 text-sm">{feedback.email || "N/A"}</span>
                                                </td>
                                                {/* Message */}
                                                <td className="p-4 align-top hidden lg:table-cell">
                                                    <p className="text-gray-300 text-sm max-w-xs whitespace-pre-wrap">{feedback.message}</p>
                                                </td>
                                                {/* Status */}
                                                <td className="p-4 align-top">
                                                     {isLoadingStatus ? <Loader2 size={18} className="animate-spin text-gray-400" /> : <StatusBadge status={feedback.status} />}
                                                     {hasErrorStatus && <AlertTriangle size={16} className="text-red-500 ml-1 inline" title="Failed to update status" />}
                                                </td>
                                                {/* Reply */}
                                                <td className="p-4 align-top hidden lg:table-cell min-w-[250px]">
                                                    {feedback.reply ? (
                                                        <div className="text-sm">
                                                            <p className="text-gray-300 mb-1 whitespace-pre-wrap">{feedback.reply}</p>
                                                            <p className="text-gray-500">
                                                                Replied {feedback.repliedAt ? formatDistanceToNow(new Date(feedback.repliedAt), { addSuffix: true }) : ''}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col space-y-2">
                                                            <textarea
                                                                value={replyInputs[id] || ""}
                                                                onChange={(e) => handleReplyChange(id, e.target.value)}
                                                                placeholder="Write a reply..."
                                                                className={`p-2 text-sm bg-[#121212] text-white border rounded-md resize-none focus:outline-none focus:border-[#00DDEB] transition-colors ${hasErrorReply ? 'border-red-500' : 'border-[#39FF14]/30'}`}
                                                                rows={3}
                                                                disabled={isLoadingReply}
                                                            />
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleAddReply(id)}
                                                                disabled={!replyInputs[id]?.trim() || isLoadingReply}
                                                                className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-[#00DDEB] text-black font-semibold rounded-md hover:bg-[#39FF14] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {isLoadingReply ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                                                {isLoadingReply ? "Sending..." : "Submit Reply"}
                                                            </motion.button>
                                                             {hasErrorReply && <p className="text-xs text-red-400">Failed to send reply.</p>}
                                                        </div>
                                                    )}
                                                </td>
                                                {/* Received Date */}
                                                <td className="p-4 align-top text-gray-400 text-sm">
                                                     {feedback.createdAt ? formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true }) : 'N/A'}
                                                </td>
                                                {/* Actions */}
                                                <td className="p-4 align-top">
                                                     <div className="flex items-center space-x-1">
                                                         {/* Status Actions */}
                                                         {feedback.status === "pending" && !isLoadingStatus && (
                                                             <>
                                                                 <motion.button
                                                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                                    onClick={() => handleUpdateStatus(id, "approved")}
                                                                    className="p-1.5 rounded-md bg-green-600/20 text-green-300 hover:bg-green-500/30 hover:text-white transition-all"
                                                                    title="Approve Feedback" disabled={isLoadingStatus}
                                                                >
                                                                     <CheckCircle size={16} />
                                                                </motion.button>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                                    onClick={() => handleUpdateStatus(id, "rejected")}
                                                                    className="p-1.5 rounded-md bg-yellow-600/20 text-yellow-300 hover:bg-yellow-500/30 hover:text-white transition-all"
                                                                    title="Reject Feedback" disabled={isLoadingStatus}
                                                                >
                                                                    <XCircle size={16} />
                                                                </motion.button>
                                                             </>
                                                         )}
                                                         {/* Delete Action */}
                                                          <motion.button
                                                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleDelete(id)}
                                                            disabled={isLoadingDelete}
                                                            className={`p-1.5 rounded-md bg-red-600/20 text-red-300 hover:bg-red-500/30 hover:text-white transition-all ${isLoadingDelete ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            title="Delete Feedback"
                                                        >
                                                            {isLoadingDelete ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                        </motion.button>
                                                     </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </motion.tbody>
                        </table>
                    )}
                </div>
            </div>
        </motion.div>
    );
}