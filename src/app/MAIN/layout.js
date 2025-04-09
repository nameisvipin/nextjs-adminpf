// app/MAIN/layout.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar"; // Assuming Sidebar is in components folder

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login"); // Redirect to your enhanced login page
  }

  // Pass session data down to client components if needed,
  // or let Sidebar fetch it using useSession()
  const user = session.user; // Example: Get user info

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#121212] text-white overflow-hidden">
      {/* Pass user data to Sidebar if you want to display it */}
      <Sidebar user={user} />
      {/*
         The main content area will automatically adjust if the Sidebar width changes
         due to the `flex-1` property. Adding a transition for margin could smooth
         this out visually if the sidebar collapse animation isn't perfectly synced,
         but often `flex-1` handles it well enough. Add transition-all if needed.
      */}
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto scrollbar-thin scrollbar-thumb-[#39FF14]/50 scrollbar-track-[#1A1A1A]">
        {children}
      </main>
    </div>
  );
}

// Optional: Install tailwind-scrollbar if you haven't
// npm install -D tailwind-scrollbar
// Add to tailwind.config.js plugins: [require('tailwind-scrollbar'),]