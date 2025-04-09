
import connectDB from "@/lib/mongodb";
import About from "@/models/About";
import { NextResponse } from "next/server";



// GET: Fetch the About document
export async function GET() {
    await connectDB();
  try {
    let about = await About.findOne();
    if (!about) {
      // If no About document exists, create a default one
      about = new About({
        bio: "",
        skills: [],
        education: [],
        resumeLink: "",
      });
      await about.save();
    }
    return NextResponse.json(about, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch About data" }, { status: 500 });
  }
}

// PUT: Update the About document
export async function PUT(request) {
    await connectDB();
  try {
    const body = await request.json();

    // Find the existing About document or create a new one if it doesn't exist
    let about = await About.findOne();
    if (!about) {
      about = new About({});
    }

    // Update fields
    about.bio = body.bio || "";
    about.skills = body.skills || [];
    about.education = body.education || [];
    about.resumeLink = body.resumeLink || "";

    await about.save();
    return NextResponse.json(about, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update About data" }, { status: 500 });
  }
}