import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// UPDATE a project
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { title, description, technologies, liveUrl, githubUrl, imageUrl } = await req.json();

  const updatedProject = await Project.findByIdAndUpdate(
    await params.id,
    { title, description, technologies, liveUrl, githubUrl, imageUrl },
    { new: true }
  );

  return NextResponse.json(updatedProject);
}

export async function DELETE(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
    await connectDB();
  
    try {
      const deletedProject = await Project.findByIdAndDelete(params.id);
      if (!deletedProject) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
  
      return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: "Error deleting project" }, { status: 500 });
    }
  }
