
import connectDB from "@/lib/mongodb";
import Experience from "@/models/Experience";
import { NextResponse } from "next/server";



// GET: Fetch all experiences
export async function GET() {
    await connectDB();
  try {
    const experiences = await Experience.find().sort({ startDate: -1 }); // Sort by startDate (newest first)
    return NextResponse.json(experiences, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch experiences" }, { status: 500 });
  }
}

// POST: Create a new experience
export async function POST(request) {
    await connectDB();
  try {
    const body = await request.json();

    // Basic validation
    if (!body.title || !body.company || !body.startDate) {
      return NextResponse.json({ error: "Title, company, and start date are required" }, { status: 400 });
    }

    const experience = new Experience({
      title: body.title,
      company: body.company,
      location: body.location || "",
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      isCurrent: body.isCurrent || false,
      description: body.description || "",
    });
    await experience.save();
    return NextResponse.json(experience, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create experience" }, { status: 500 });
  }
}