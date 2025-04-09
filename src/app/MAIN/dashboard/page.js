"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bar, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    PointElement, // Needed for potential line charts later if desired
    LineElement, // Needed for potential line charts later if desired
    Filler // For area fills if needed
} from "chart.js";
import { Briefcase, MessageSquare, Star, AlertTriangle, Loader2 } from "lucide-react"; // Added icons

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    Filler
);

// --- Skeleton Loader Component ---
const SkeletonLoader = ({ className = "" }) => (
    <div className={`animate-pulse bg-gray-700/50 rounded-lg ${className}`}></div>
);

export default function DashboardPage() {
    const [stats, setStats] = useState({
        projectCount: 0,
        feedbackCount: { total: 0, approved: 0, pending: 0, reject: 0 },
        experienceCount: 0,
    });
    const [projectData, setProjectData] = useState({ labels: [], datasets: [] });
    const [pieData, setPieData] = useState({ labels: [], datasets: [] });
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    // --- Framer Motion Variants ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
    };

    // --- Chart Options (Customized) ---
    const baseChartOptions = {
        maintainAspectRatio: false, // Important for responsiveness
        plugins: {
            legend: {
                labels: {
                    color: "#E0E0E0", // Light gray for legend text
                    font: { size: 12 },
                    boxWidth: 15,
                    padding: 20,
                },
                position: 'bottom',
            },
            tooltip: {
                enabled: true,
                backgroundColor: "rgba(26, 26, 26, 0.9)", // Slightly transparent dark background
                titleColor: "#39FF14", // Neon green title
                bodyColor: "#FFFFFF", // White body text
                borderColor: "#39FF14",
                borderWidth: 1,
                padding: 10,
                cornerRadius: 4,
                bodyFont: { size: 12 },
                titleFont: { size: 14, weight: 'bold' },
                boxPadding: 5,
            },
        },
        layout: {
             padding: {
                top: 10,
                bottom: 10 // Add some padding
            }
        }
    };

    const barChartOptions = {
        ...baseChartOptions,
        scales: {
            y: {
                beginAtZero: true,
                ticks: { color: "#A0A0A0", precision: 0 }, // Gray ticks, no decimals
                grid: {
                    color: "rgba(255, 255, 255, 0.1)", // Subtle grid lines
                    drawBorder: false,
                },
            },
            x: {
                ticks: { color: "#A0A0A0", maxRotation: 0, minRotation: 0 }, // Horizontal labels
                grid: {
                    display: false, // Hide vertical grid lines
                },
            },
        },
    };

    const pieChartOptions = {
        ...baseChartOptions,
        scales: {}, // No scales for Pie chart
        plugins: {
            ...baseChartOptions.plugins,
             legend: { // Override legend position for pie if needed
                ...baseChartOptions.plugins.legend,
                position: 'right', // Example: Right position for Pie
                align: 'center'
            },
        }
    };


    // --- Data Fetching ---
    useEffect(() => {
        fetchDashboardData();
    }, []);

    async function fetchDashboardData() {
        setLoading(true);
        setError(null);
        try {
            const [projectRes, feedbackRes, experienceRes] = await Promise.all([
                fetch("/api/project"),
                fetch("/api/feedback"),
                fetch("/api/experience"),
            ]);

            if (!projectRes.ok || !feedbackRes.ok || !experienceRes.ok) {
                throw new Error("Failed to fetch dashboard data");
            }

            const projects = await projectRes.json();
            const feedback = await feedbackRes.json();
            const experiences = await experienceRes.json();

            // Process Stats
            const totalFeedback = feedback.length;
            const approvedFeedback = feedback.filter((f) => f.status === "approved").length;
            const pendingFeedback = feedback.filter((f) => f.status === "pending").length;
            const rejectedFeedback = feedback.filter((f) => f.status === "rejected").length;
            setStats({
                projectCount: projects.length,
                feedbackCount: { total: totalFeedback, approved: approvedFeedback, pending: pendingFeedback, reject: rejectedFeedback },
                experienceCount: experiences.length,
            });

            // Process Project Chart Data
            const projectCountsByMonth = processProjectData(projects);
            setProjectData({
                labels: projectCountsByMonth.labels,
                datasets: [
                    {
                        label: "Projects Added",
                        data: projectCountsByMonth.data,
                        backgroundColor: "rgba(57, 255, 20, 0.6)", // Neon green with alpha
                        borderColor: "#39FF14",
                        borderWidth: 1,
                        hoverBackgroundColor: "#39FF14", // Solid on hover
                        borderRadius: 4, // Slightly rounded bars
                    },
                ],
            });

            // Process Pie Chart Data
            setPieData({
                labels: ["Approved", "Pending", "Rejected"],
                datasets: [
                    {
                        label: "Feedback Status",
                        data: [approvedFeedback, pendingFeedback, rejectedFeedback],
                        backgroundColor: [
                            "rgba(57, 255, 20, 0.7)", // Neon Green (Approved)
                            "rgba(0, 221, 235, 0.7)", // Cyan (Pending)
                            "rgba(255, 85, 85, 0.7)", // Red (Rejected)
                        ],
                        borderColor: [ // Use dark background color for borders
                           "#1A1A1A",
                           "#1A1A1A",
                           "#1A1A1A",
                        ],
                        borderWidth: 2,
                        hoverOffset: 8, // Make slice pop out on hover
                         hoverBorderColor: ['#39FF14', '#00DDEB', '#FF5555'] // Highlight border on hover
                    },
                ],
            });

        } catch (err) {
            console.error("Dashboard fetch error:", err);
            setError(err.message || "Could not load dashboard data.");
        } finally {
            setLoading(false);
        }
    }

    // --- Helper Function (unchanged from original) ---
    function processProjectData(projects) {
         const countsByMonth = {};
        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        projects.forEach((project) => {
            // Ensure createdAt exists and is valid
            if (!project.createdAt) return;
            const createdAt = new Date(project.createdAt);
             if (isNaN(createdAt.getTime())) return; // Skip invalid dates

            const year = createdAt.getFullYear();
            const month = createdAt.getMonth();
            const key = `${monthNames[month]} ${year}`;

            if (!countsByMonth[key]) countsByMonth[key] = 0;
            countsByMonth[key] += 1;
        });

        const sortedKeys = Object.keys(countsByMonth).sort((a, b) => {
            const [monthA, yearA] = a.split(" ");
            const [monthB, yearB] = b.split(" ");
            const dateA = new Date(`${monthA} 1, ${yearA}`);
            const dateB = new Date(`${monthB} 1, ${yearB}`);
            // Handle potential invalid date parsing if needed, though previous checks help
            return (dateA.getTime() || 0) - (dateB.getTime() || 0);
        });

        // Determine the range - show last N months or ensure minimum length
        const numMonthsToShow = 6; // Show last 6 months of data
        let displayKeys = sortedKeys;

        if (sortedKeys.length > 0) {
            // Generate labels for the last N months ending with the latest data point
            const lastKey = sortedKeys[sortedKeys.length - 1];
            const [lastMonthStr, lastYearStr] = lastKey.split(" ");
            const lastDate = new Date(`${lastMonthStr} 1, ${lastYearStr}`);

            displayKeys = [];
            for (let i = numMonthsToShow - 1; i >= 0; i--) {
                const date = new Date(lastDate);
                date.setMonth(lastDate.getMonth() - i);
                const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                displayKeys.push(key);
                if (!countsByMonth[key]) {
                    countsByMonth[key] = 0; // Ensure zero count for months without data
                }
            }
        } else {
             // If NO data, still show last N months relative to today for context
             const today = new Date();
              displayKeys = [];
               for (let i = numMonthsToShow - 1; i >= 0; i--) {
                  const date = new Date(today);
                  date.setMonth(today.getMonth() - i);
                  const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                  displayKeys.push(key);
                  countsByMonth[key] = 0;
              }
        }


        const labels = displayKeys;
        const data = displayKeys.map((key) => countsByMonth[key] || 0); // Ensure 0 if key somehow missed

        return { labels, data };
    }
    // --- End Helper Function ---


    return (
        // Use AnimatePresence to handle conditional rendering of loading/error/content
        <AnimatePresence mode="wait">
            {loading ? (
                // --- Loading State ---
                <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center text-center p-10 min-h-[calc(100vh-100px)]" // Adjust min-h as needed
                >
                   <Loader2 className="w-12 h-12 animate-spin text-[#39FF14] mb-4" />
                   <p className="text-xl text-gray-300">Loading Dashboard Data...</p>
                </motion.div>

            ) : error ? (
                // --- Error State ---
                <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center text-center p-10 min-h-[calc(100vh-100px)] bg-red-900/20 border border-red-500/50 rounded-lg m-6"
                >
                    <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
                    <h2 className="text-xl text-red-300 mb-2">Oops! Something went wrong.</h2>
                    <p className="text-red-400">{error}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="mt-6 px-4 py-2 bg-[#39FF14] text-black rounded-md hover:bg-[#00DDEB] transition-colors font-semibold"
                    >
                        Retry
                    </button>
                </motion.div>

            ) : (
                // --- Content State ---
                <motion.div
                    key="content"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0 }} // Fade out on exit if needed
                    className="p-6 md:p-8 lg:p-10" // Adjust padding as needed within layout
                >
                    <motion.h1
                        variants={itemVariants} // Use item variant for consistency
                        className="text-3xl md:text-4xl font-bold text-[#39FF14] mb-8 tracking-wide"
                    >
                        Dashboard Overview
                    </motion.h1>

                    {/* Stats Cards Grid */}
                    <motion.div
                         variants={containerVariants} // Stagger cards
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
                    >
                        {/* Project Card */}
                         <motion.div
                             variants={itemVariants}
                             whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(57, 255, 20, 0.2)" }}
                             className="bg-[#1A1A1A]/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-[#39FF14]/30 flex items-start gap-4 transition-all duration-300 cursor-default"
                         >
                             <Briefcase className="w-8 h-8 text-[#39FF14] mt-1 flex-shrink-0" />
                             <div>
                                 <h2 className="text-lg font-semibold text-gray-300 mb-1">Total Projects</h2>
                                 <p className="text-4xl font-bold text-white">{stats.projectCount}</p>
                             </div>
                         </motion.div>

                         {/* Feedback Card */}
                          <motion.div
                             variants={itemVariants}
                              whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0, 221, 235, 0.2)" }}
                             className="bg-[#1A1A1A]/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-[#00DDEB]/30 flex items-start gap-4 transition-all duration-300 cursor-default"
                         >
                              <MessageSquare className="w-8 h-8 text-[#00DDEB] mt-1 flex-shrink-0" />
                              <div>
                                 <h2 className="text-lg font-semibold text-gray-300 mb-1">Total Feedback</h2>
                                 <p className="text-4xl font-bold text-white">{stats.feedbackCount.total}</p>
                                 <div className="text-xs text-gray-400 mt-2 space-x-2">
                                     <span className="inline-block px-2 py-0.5 bg-green-500/20 text-green-300 rounded">A: {stats.feedbackCount.approved}</span>
                                     <span className="inline-block px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded">P: {stats.feedbackCount.pending}</span>
                                     <span className="inline-block px-2 py-0.5 bg-red-500/20 text-red-300 rounded">R: {stats.feedbackCount.reject}</span>
                                 </div>
                              </div>
                         </motion.div>

                         {/* Experience Card */}
                         <motion.div
                             variants={itemVariants}
                             whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(57, 255, 20, 0.15)" }}
                             className="bg-[#1A1A1A]/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-600/30 flex items-start gap-4 transition-all duration-300 cursor-default" // Neutral border
                         >
                             <Star className="w-8 h-8 text-yellow-400 mt-1 flex-shrink-0" />
                             <div>
                                 <h2 className="text-lg font-semibold text-gray-300 mb-1">Total Experiences</h2>
                                 <p className="text-4xl font-bold text-white">{stats.experienceCount}</p>
                            </div>
                         </motion.div>
                    </motion.div>

                    {/* Charts Grid */}
                    <motion.div
                        variants={containerVariants} // Stagger charts
                        className="grid grid-cols-1 lg:grid-cols-5 gap-6"
                    >
                         {/* Bar Chart - Takes more space */}
                        <motion.div
                            variants={itemVariants}
                            className="lg:col-span-3 bg-[#1A1A1A]/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-[#39FF14]/30"
                        >
                            <h2 className="text-xl font-semibold text-[#39FF14] mb-4">Projects Activity (Last Months)</h2>
                            <div className="relative h-[350px] md:h-[400px]">
                                {projectData.labels?.length > 0 ? (
                                    <Bar data={projectData} options={barChartOptions} />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">No project data available.</div>
                                )}
                            </div>
                        </motion.div>

                        {/* Pie Chart - Takes less space */}
                         <motion.div
                             variants={itemVariants}
                             className="lg:col-span-2 bg-[#1A1A1A]/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-[#00DDEB]/30"
                         >
                            <h2 className="text-xl font-semibold text-[#00DDEB] mb-4 text-center">Feedback Status</h2>
                            <div className="relative h-[350px] md:h-[400px] flex items-center justify-center">
                                {stats.feedbackCount.total > 0 ? (
                                    <Pie data={pieData} options={pieChartOptions} />
                                ): (
                                     <div className="flex items-center justify-center h-full text-gray-500">No feedback data available.</div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}