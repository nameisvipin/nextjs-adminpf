"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Save, Loader2, AlertTriangle,Briefcase, Type, Building, MapPin, Calendar, CheckSquare, Square, FileText } from "lucide-react";

// --- Reusable Input/Textarea Components (Assume these exist from previous examples) ---
// You can copy the FloatingLabelInput and FloatingLabelTextarea components here
// or import them if you've extracted them to a separate file.

// Simplified version for this file:
const FloatingLabelInput = ({ id, label, icon: Icon, value, onChange, type = "text", required = false, disabled = false, ...props }) => (
    <div className="relative">
        {Icon && <Icon className={`absolute top-1/2 left-3.5 transform -translate-y-1/2 text-gray-400 z-10 ${disabled ? 'opacity-50' : 'peer-focus:text-[#00DDEB]'}`} size={18} />}
        <input
            id={id} name={id} // Assuming id and name are the same
            value={value} onChange={onChange} type={type} required={required} disabled={disabled}
            className={`peer w-full p-3.5 ${Icon ? 'pl-10' : ''} pt-5 bg-[#121212]/70 border rounded-lg text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-[#00DDEB]/60 focus:border-transparent transition-all ${disabled ? 'opacity-50 bg-[#2a2a2a] cursor-not-allowed border-[#39FF14]/20' : 'border-[#39FF14]/40'}`}
            placeholder={label}
            {...props}
        />
        <label
            htmlFor={id}
            className={`absolute left-${Icon ? '10' : '3.5'} top-1.5 text-xs transition-all duration-300 ease-in-out pointer-events-none ${disabled ? 'text-gray-500' : 'text-gray-400 peer-focus:text-[#00DDEB]'}
                        peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-${Icon ? '10' : '3.5'} peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base
                        peer-focus:top-1.5 peer-focus:left-3.5 peer-focus:-translate-y-0 peer-focus:text-xs
                         ${value && !disabled ? "top-1.5 !left-3.5 !-translate-y-0 !text-xs text-[#39FF14]" : ""}
                         ${value && disabled ? "top-1.5 !left-3.5 !-translate-y-0 !text-xs text-gray-500" : ""}`} // Style label when disabled and has value
        >
            {label}
        </label>
    </div>
);

const FloatingLabelTextarea = ({ id, label, icon: Icon, value, onChange, required = false, rows = 4, ...props }) => (
     <div className="relative">
         {Icon && <Icon className="absolute top-5 left-3.5 text-gray-400 peer-focus:text-[#00DDEB] z-10" size={18} />}
        <textarea
            id={id} name={id} value={value} onChange={onChange} required={required} rows={rows}
            className={`peer w-full p-3.5 ${Icon ? 'pl-10' : ''} pt-6 bg-[#121212]/70 border border-[#39FF14]/40 rounded-lg text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-[#00DDEB]/60 focus:border-transparent transition-all min-h-[100px] resize-y`}
            placeholder={label}
            {...props}
        />
         <label
             htmlFor={id}
             className={`absolute left-${Icon ? '10' : '3.5'} top-2 text-xs text-gray-400 transition-all duration-300 ease-in-out pointer-events-none
                        peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                        peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#00DDEB]
                         ${value ? "top-2 !text-xs text-[#39FF14]" : ""}`}
         >
             {label}
        </label>
    </div>
);
// --- End Reusable Components ---


export default function ExperienceModal({ isOpen, onClose, onSaveSuccess, experience }) {
    const [formData, setFormData] = useState({
        title: "", company: "", location: "", startDate: "", endDate: "", isCurrent: false, description: "",
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    // Format date for input type="date" (YYYY-MM-DD)
    const formatDateForInput = (dateStr) => {
        if (!dateStr) return "";
        try {
            return format(new Date(dateStr), 'yyyy-MM-dd');
        } catch {
            return ""; // Handle invalid date string
        }
    };

    // Effect to initialize/reset form data
    useEffect(() => {
        if (isOpen) {
            setSaveError(null);
            setIsSaving(false);
            if (experience) {
                setFormData({
                    title: experience.title || "",
                    company: experience.company || "",
                    location: experience.location || "",
                    startDate: formatDateForInput(experience.startDate),
                    endDate: formatDateForInput(experience.endDate),
                    isCurrent: experience.isCurrent || false,
                    description: experience.description || "",
                });
            } else {
                setFormData({ title: "", company: "", location: "", startDate: "", endDate: "", isCurrent: false, description: "" });
            }
        }
    }, [isOpen, experience]);

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
            // If 'isCurrent' is checked, clear endDate
            ...(type === "checkbox" && name === "isCurrent" && checked && { endDate: "" }),
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (isSaving) return;
        setIsSaving(true);
        setSaveError(null);

        const method = experience ? "PUT" : "POST";
        const url = experience ? `/api/experience/${experience._id}` : "/api/experience";

        // Ensure dates are valid or null before sending
         const payload = {
             ...formData,
             startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
             // Send null if current or empty, otherwise send ISO string
             endDate: formData.isCurrent || !formData.endDate ? null : new Date(formData.endDate).toISOString(),
         };
         // Remove endDate from payload if isCurrent is true (some backends might prefer this)
         if (payload.isCurrent) {
            delete payload.endDate;
         }


        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: "An error occurred during save." }));
                throw new Error(errorData.message || `Failed to save experience (${res.status})`);
            }
            onSaveSuccess();
        } catch (err) {
            console.error("Save Experience Error:", err);
            setSaveError(err.message || "Could not save experience.");
            setIsSaving(false); // Keep modal open on error
        }
        // No finally block needed for setIsSaving if success calls onSaveSuccess which closes modal
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-[#1A1A1A] p-6 sm:p-8 rounded-xl w-full max-w-2xl shadow-2xl border border-[#39FF14]/30 relative max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                 <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#39FF14]/20 flex-shrink-0">
                     <h2 className="text-2xl font-bold text-[#39FF14]">
                        {experience ? "Edit Experience" : "Add New Experience"}
                    </h2>
                    <motion.button whileHover={{ scale: 1.1, rotate: 90, color: '#FF5555' }} whileTap={{ scale: 0.9 }}
                        onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700/50 transition-colors" aria-label="Close modal">
                        <X size={24} />
                    </motion.button>
                </div>

                {/* Form Area */}
                 <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-[#39FF14]/50 scrollbar-track-[#1A1A1A]">
                     <FloatingLabelInput id="title" label="Role / Title" icon={Briefcase} value={formData.title} onChange={handleChange} required />
                     <FloatingLabelInput id="company" label="Company Name" icon={Building} value={formData.company} onChange={handleChange} required />
                     <FloatingLabelInput id="location" label="Location (e.g., City, State or Remote)" icon={MapPin} value={formData.location} onChange={handleChange} />

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                         <FloatingLabelInput id="startDate" label="Start Date" icon={Calendar} type="date" value={formData.startDate} onChange={handleChange} required />
                         {/* Conditional rendering/disabling of End Date */}
                         <FloatingLabelInput id="endDate" label="End Date" icon={Calendar} type="date" value={formData.endDate} onChange={handleChange} disabled={formData.isCurrent} />
                     </div>

                      {/* Checkbox - Using custom styling instead of floating label */}
                     <div className="pt-2">
                         <label htmlFor="isCurrent" className="flex items-center text-gray-300 cursor-pointer select-none w-fit">
                             <input type="checkbox" id="isCurrent" name="isCurrent" checked={formData.isCurrent} onChange={handleChange} className="hidden peer" />
                             {/* Custom Checkbox Appearance */}
                             <motion.div whileTap={{ scale: 0.9 }} className="mr-2 w-5 h-5 border-2 border-[#39FF14]/50 rounded flex items-center justify-center transition-colors duration-200 peer-checked:bg-[#39FF14] peer-checked:border-[#39FF14]">
                                 {formData.isCurrent && <CheckSquare size={14} className="text-black" strokeWidth={3} />}
                                 {!formData.isCurrent && <Square size={14} className="text-transparent" />} {/* Placeholder for size */}
                             </motion.div>
                             I currently work here
                         </label>
                     </div>

                     <FloatingLabelTextarea id="description" label="Description / Responsibilities" icon={FileText} value={formData.description} onChange={handleChange} rows={5} />
                 </form>

                 {/* Footer */}
                 <div className="mt-6 pt-4 border-t border-[#39FF14]/20 flex flex-col sm:flex-row justify-between items-center gap-4 flex-shrink-0">
                     <div className="w-full sm:w-auto order-2 sm:order-1 text-center sm:text-left">
                         {saveError && <p className="text-sm text-red-400 flex items-center gap-1"><AlertTriangle size={16} /> {saveError}</p>}
                    </div>
                     <div className="flex space-x-3 order-1 sm:order-2">
                        <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose} disabled={isSaving}
                            className="px-5 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"> Cancel </motion.button>
                        <motion.button type="submit" form="experience-form" // Link to form if needed, usually default works
                             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={isSaving} onClick={handleSubmit}
                             className={`flex items-center justify-center gap-2 px-5 py-2 bg-[#39FF14] text-black font-semibold rounded-lg hover:bg-[#00DDEB] transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-w-[100px]`}>
                             {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} {isSaving ? "Saving..." : "Save"}
                         </motion.button>
                    </div>
                 </div>
            </motion.div>
        </div>
    );
}