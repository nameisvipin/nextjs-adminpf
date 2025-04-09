import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET all projects
export async function GET() {
  await connectDB();
  const projects = await Project.find();
  return NextResponse.json(projects);
}

// ADD a new project
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { title, description, technologies, liveUrl, githubUrl, imageUrl } = await req.json();

  const newProject = new Project({ title, description, technologies, liveUrl, githubUrl, imageUrl });
  await newProject.save();

  return NextResponse.json({ message: "Project added successfully" });
}
