"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiLoader, FiAlertTriangle } from "react-icons/fi";

// Simple component for the animated graphic on the left side
const AnimatedGraphic = () => {
    const lineVariants = {
        initial: { pathLength: 0, opacity: 0 },
        animate: (i) => ({
            pathLength: 1,
            opacity: [0, 0.5, 1, 0.5, 0], // Fade in and out during stroke
            transition: {
                pathLength: { delay: i * 0.3, duration: 2, ease: "easeInOut" },
                opacity: { delay: i * 0.3, duration: 2, ease: "linear" },
                repeat: Infinity,
                repeatDelay: 3, // Wait 3 seconds before repeating
            },
        }),
    };

    // Create some random-ish lines for visual interest
    const lines = [
        { d:"M10 80 Q 50 10, 90 80 T 170 80", stroke: "#39FF14" },
        { d:"M10 50 C 40 100, 150 0, 190 50", stroke: "#00DDEB" },
        { d:"M50 10 H 150 V 90 H 50 Z", stroke: "#39FF14" }, // Rectangle
        { d:"M100 10 L 120 90 L 80 90 Z", stroke: "#00DDEB" }, // Triangle
        { d:"M30 30 Q 70 150, 170 30", stroke: "#39FF14"},
    ];


    return (
         <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Optional: Add a subtle background element */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#121212] via-[#181818] to-[#121212] opacity-50"></div>

             <motion.svg
                viewBox="0 0 200 100" // Adjust viewBox as needed
                initial="initial"
                animate="animate"
                className="w-2/3 h-auto max-w-xs md:max-w-sm z-10" // Responsive size
                style={{ filter: 'drop-shadow(0 0 10px rgba(57, 255, 20, 0.3))' }} // Neon glow
            >
                <defs>
                    {/* Define gradients or filters if needed */}
                </defs>
                 {lines.map((line, i) => (
                    <motion.path
                        key={i}
                        d={line.d}
                        fill="none"
                        stroke={line.stroke}
                        strokeWidth="1.5" // Thinner lines
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        custom={i} // Pass index to stagger delay
                        variants={lineVariants}
                    />
                 ))}
            </motion.svg>
             {/* More decorative elements */}
             <div className="absolute top-1/4 left-1/4 w-16 h-16 border-2 border-[#39FF14]/30 rounded-full animate-pulse"></div>
             <div className="absolute bottom-1/4 right-1/4 w-10 h-10 border-2 border-[#00DDEB]/30 rounded-sm animate-pulse animation-delay-500"></div>
         </div>
    );
};


export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        setError("");
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email, password, redirect: false,
            });
            // ... (keep the existing result handling logic) ...
            if (result?.error) {
                setError("Invalid email or password. Please try again.");
            } else if (result?.ok) {
                router.push("/MAIN/dashboard");
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("An error occurred during login.");
        } finally {
            setIsLoading(false);
        }
    };

    // Animation Variants
    const formContainerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delay: 0.3 } } }; // Added delay
    const formItemVariants = { hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } } };
    const errorVariants = { hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 15 } }, exit: { opacity: 0, y: -10 } };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-[#121212] text-white">
            {/* Left Side - Animated Graphic */}
            <div className="w-full md:w-1/2 h-64 md:h-screen bg-[#121212]">
                <AnimatedGraphic />
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full md:w-1/2 h-screen flex items-center justify-center bg-[#1A1A1A] p-4 md:p-8">
                <motion.div
                    variants={formContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md" // Max width for the form area
                >
                    <motion.h2
                        variants={formItemVariants}
                        className="text-3xl font-bold text-[#39FF14] mb-8 text-center tracking-wider"
                    >
                        Admin Portal Access
                    </motion.h2>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div variants={errorVariants} initial="hidden" animate="visible" exit="exit" className="flex items-center justify-center gap-2 bg-red-500/20 border border-red-500/50 text-red-300 text-sm mb-6 p-3 rounded-md text-center">
                                <FiAlertTriangle /> <span>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form */}
                    <motion.form onSubmit={handleSubmit} className="space-y-6">
                         {/* Email Input */}
                        <motion.div className="relative" variants={formItemVariants}>
                            <FiMail className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 peer-focus:text-[#00DDEB]" size={18}/>
                            <input
                                id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading}
                                className="peer w-full p-3 pl-10 bg-[#121212] border border-[#39FF14]/50 rounded-md text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-[#00DDEB]/50 focus:border-transparent transition-all"
                                placeholder="Email Address" autoComplete="email"
                            />
                            <label htmlFor="email" className={`absolute left-10 top-3 text-gray-400 transition-all duration-300 ease-in-out pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-10 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:left-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-[#00DDEB] ${email ? "top-1 left-3 -translate-y-0 text-xs text-[#39FF14]" : ""}`}>
                                Email Address
                            </label>
                        </motion.div>

                        {/* Password Input */}
                        <motion.div className="relative" variants={formItemVariants}>
                             <FiLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 peer-focus:text-[#00DDEB]" size={18}/>
                            <input
                                id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading}
                                className="peer w-full p-3 pl-10 bg-[#121212] border border-[#39FF14]/50 rounded-md text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-[#00DDEB]/50 focus:border-transparent transition-all"
                                placeholder="Password" autoComplete="current-password"
                            />
                            <label htmlFor="password" className={`absolute left-10 top-3 text-gray-400 transition-all duration-300 ease-in-out pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-10 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:left-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-[#00DDEB] ${password ? "top-1 left-3 -translate-y-0 text-xs text-[#39FF14]" : ""}`}>
                                Password
                            </label>
                        </motion.div>

                        {/* Login Button */}
                         <motion.button type="submit" disabled={isLoading} variants={formItemVariants} whileHover={!isLoading ? { scale: 1.03, boxShadow: "0px 0px 20px rgba(57, 255, 20, 0.6)" } : {}} whileTap={!isLoading ? { scale: 0.98 } : {}} transition={{ duration: 0.2 }} className={`w-full p-3.5 flex items-center justify-center bg-[#39FF14] text-black text-base font-bold rounded-lg hover:bg-[#00DDEB] hover:text-black transition-all duration-300 ease-in-out relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed group shadow-lg shadow-[#39FF14]/20 hover:shadow-[#00DDEB]/30`}>
                            <span className="relative z-10 flex items-center gap-2">
                                {isLoading ? (<><FiLoader className="animate-spin" /> Authenticating...</>) : ("Login Securely")}
                            </span>
                         </motion.button>
                    </motion.form>
                </motion.div>
            </div>
        </div>
    );
}