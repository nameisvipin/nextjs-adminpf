"use client"; 

import { SessionProvider as AuthProvider, useSession } from "next-auth/react";
import Sidebar from "./Sidebar";

export default function SessionProvider({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}


function AuthWrapper({ children }) {
  const { data: session, status } = useSession();

  // Show loading until session is determined
  if (status === "loading") return <p>Loading...</p>;

  // If user is logged in, show Sidebar + Main Content
  if (session) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    );
  }

  // If not logged in, show only the children (login page)
  return <main className="w-full h-screen flex items-center justify-center">{children}</main>;
}
export { AuthWrapper };