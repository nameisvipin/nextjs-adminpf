
import connectDB from "@/lib/mongodb";
import Experience from "@/models/Experience";
import { NextResponse } from "next/server";



// PUT: Update an experience
export async function PUT(request, { params }) {
    await connectDB();
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData = {
      title: body.title,
      company: body.company,
      location: body.location || "",
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      isCurrent: body.isCurrent || false,
      description: body.description || "",
    };

    const experience = await Experience.findByIdAndUpdate(id, updateData, { new: true });
    if (!experience) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }
    return NextResponse.json(experience, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update experience" }, { status: 500 });
  }
}

// DELETE: Delete an experience
export async function DELETE(request, { params }) {
    await connectDB();
  try {
    const { id } = await params;
    const experience = await Experience.findByIdAndDelete(id);
    if (!experience) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Experience deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete experience" }, { status: 500 });
  }
}