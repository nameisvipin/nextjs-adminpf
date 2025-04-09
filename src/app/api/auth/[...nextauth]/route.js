import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        console.log("🟢 Received credentials:", credentials);  // Log received data

        await connectDB();
        const user = await AdminUser.findOne({ email: credentials.email });

        console.log("🟡 User found in DB:", user);  // Log user found in database

        if (!user) {
          throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        console.log("🔵 Password match:", isPasswordValid);  // Log password comparison

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        console.log("✅ Login Successful");
        return { id: user._id, email: user.email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
