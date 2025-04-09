// components/Sidebar.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // <-- Import usePathname
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  LayoutDashboard,
  Info,
  Briefcase,
  MessageSquare,
  Star,
  LogOut,
  ChevronsLeft, // Icon for collapsing
  ChevronsRight, // Icon for expanding
  User, // Icon for user
} from "lucide-react"; // <-- Import necessary icons

// You can pass the user prop from DashboardLayout or fetch using useSession
// import { useSession } from "next-auth/react";

export default function Sidebar({ user }) {
  // If using useSession instead of passing props:
  // const { data: session } = useSession();
  // const user = session?.user;

  const pathname = usePathname(); // Get current path
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // State for desktop collapse
  const [isMobile, setIsMobile] = useState(false);

  // --- Navigation Items ---
  const navItems = [
    { href: "/MAIN/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/MAIN/about", label: "About", icon: Info },
    { href: "/MAIN/project", label: "Projects", icon: Briefcase },
    { href: "/MAIN/feedback", label: "Feedback", icon: MessageSquare },
    { href: "/MAIN/experience", label: "Experience", icon: Star },
  ];

  const logoutItem = {
    href: "/api/auth/signout?callbackUrl=/login", // Redirect to login after signout
    label: "Logout",
    icon: LogOut,
  };
  // --- End Navigation Items ---

  // --- Responsive Handling ---
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(false); // Can't be collapsed on mobile view
        setIsMobileOpen(false); // Close menu on resize to mobile
      } else {
        setIsMobileOpen(false); // Ensure mobile menu is closed on desktop
        // Optional: You might want to persist collapsed state via localStorage
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // --- End Responsive Handling ---

  // --- Framer Motion Variants ---
  const sidebarVariants = {
    open: (isMobile) => ({
      x: 0,
      width: isMobile ? "256px" : isCollapsed ? "80px" : "256px", // Animate width
      transition: { type: "spring", stiffness: 300, damping: 30, duration: 0.3 },
    }),
    closed: {
      x: "-100%",
      width: "256px", // Keep width consistent when off-screen for animation
      transition: { type: "spring", stiffness: 300, damping: 30, duration: 0.3 },
    },
  };

  const navItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const textVariants = {
    collapsed: { opacity: 0, width: 0, marginLeft: 0, transition: { duration: 0.2 } },
    expanded: { opacity: 1, width: "auto", marginLeft: "0.75rem", transition: { duration: 0.2, delay: 0.1 } }, // ml-3
  };
  // --- End Framer Motion Variants ---

  const commonLinkClasses =
    "flex items-center py-3 px-4 rounded-lg transition-all duration-200 ease-in-out group";
  const hoverClasses =
    "hover:bg-gradient-to-r hover:from-[#39FF14]/20 hover:to-[#00DDEB]/20 hover:shadow-md";
  const activeClasses =
    "bg-gradient-to-r from-[#39FF14]/30 to-[#00DDEB]/30 text-white shadow-lg scale-[1.02]";
  const inactiveClasses = "text-gray-300 hover:text-white";

  const logoutHoverClasses = "hover:bg-red-600/80";
  const logoutActiveClasses = "bg-red-700/80";

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#1A1A1A] border border-[#39FF14]/50 text-[#39FF14] rounded-md hover:bg-[#39FF14] hover:text-black transition-colors"
        aria-label="Toggle Menu"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <motion.aside
        custom={isMobile} // Pass isMobile to variants if needed
        variants={sidebarVariants}
        initial={isMobile ? "closed" : "open"} // Initial state based on device
        animate={
          isMobile ? (isMobileOpen ? "open" : "closed") : "open" // Control mobile open/close
        }
        className={`fixed top-0 left-0 z-40 h-screen bg-[#1A1A1A]/90 backdrop-blur-lg shadow-xl border-r border-[#39FF14]/20 flex flex-col justify-between
                   ${
                     isMobile
                       ? "w-64" // Fixed width when animating in/out on mobile
                       : isCollapsed
                       ? "w-20" // Collapsed width on desktop
                       : "w-64" // Expanded width on desktop
                   }
                   md:static md:h-screen md:z-auto md:backdrop-blur-none md:bg-[#1A1A1A]`} // Static position on desktop
      >
        {/* Top Section: Logo/Title and User Info */}
        <div>
          <div className={`flex items-center mb-8 px-6 pt-6 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <motion.h1
              initial={false}
              animate={isCollapsed ? "collapsed" : "expanded"}
              variants={{
                collapsed: { opacity: 0, width: 0 },
                expanded: { opacity: 1, width: 'auto', transition: { delay: 0.1 } },
              }}
              className="text-2xl font-bold text-[#39FF14] overflow-hidden whitespace-nowrap"
            >
               {!isCollapsed && "Admin"} {/* Only show text when expanded */}
            </motion.h1>
            {/* Collapse Button (Desktop only) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:block p-1 rounded-md text-gray-400 hover:bg-[#39FF14]/20 hover:text-white transition-colors"
              aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
            </button>
          </div>

          {/* User Info */}
          {user && (
              <div className={`flex items-center gap-3 px-6 py-3 mb-4 border-y border-[#39FF14]/10 ${isCollapsed ? 'justify-center' : ''}`}>
                <User size={isCollapsed ? 24 : 20} className="text-[#00DDEB] flex-shrink-0" />
                <motion.div
                   initial={false}
                   animate={isCollapsed ? "collapsed" : "expanded"}
                   variants={textVariants}
                   className="text-sm text-gray-300 overflow-hidden whitespace-nowrap"
                >
                    {user.email || user.name || 'Admin User'}
                </motion.div>
            </div>
          )}


          {/* Navigation Links */}
          <nav className="px-3">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <motion.li
                    key={item.href}
                    variants={navItemVariants} // Use simpler variants for list items
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout // Animate layout changes (like width change)
                  >
                    <Link
                      href={item.href}
                      title={isCollapsed ? item.label : ""} // Tooltip when collapsed
                      onClick={() => isMobile && setIsMobileOpen(false)} // Close mobile menu on click
                      className={`${commonLinkClasses} ${
                        isActive ? activeClasses : inactiveClasses
                      } ${hoverClasses} ${isCollapsed ? "justify-center" : ""}`}
                    >
                      <item.icon
                        size={20}
                        className={`flex-shrink-0 ${isActive ? "text-[#39FF14]" : ""}`}
                      />
                      <motion.span
                        initial={false}
                        animate={isCollapsed ? "collapsed" : "expanded"}
                        variants={textVariants}
                        className="overflow-hidden whitespace-nowrap" // Ensure text doesn't wrap
                      >
                        {item.label}
                      </motion.span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Bottom Section: Logout */}
        <div className="px-3 pb-6 mt-auto">
          <motion.div layout>
            <Link
              href={logoutItem.href}
              title={isCollapsed ? logoutItem.label : ""} // Tooltip when collapsed
              onClick={() => isMobile && setIsMobileOpen(false)}
              className={`${commonLinkClasses} ${inactiveClasses} ${logoutHoverClasses} hover:!text-white ${isCollapsed ? "justify-center" : ""}`} // Ensure hover overrides inactive text color
            >
              <logoutItem.icon size={20} className="flex-shrink-0 text-red-400 group-hover:text-white transition-colors" />
              <motion.span
                initial={false}
                animate={isCollapsed ? "collapsed" : "expanded"}
                variants={textVariants}
                className="overflow-hidden whitespace-nowrap" // Ensure text doesn't wrap
              >
                {logoutItem.label}
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/60 z-30 md:hidden" // Higher opacity overlay
          />
        )}
      </AnimatePresence>
    </>
  );
}