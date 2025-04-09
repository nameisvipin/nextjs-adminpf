import connectDB from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import { NextResponse } from "next/server";



// GET: Fetch all feedback
export async function GET() {
    await connectDB();
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    return NextResponse.json(feedback, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}

// POST: Create new feedback
export async function POST(request) {
    await connectDB();
  try {
    const body = await request.json();
    console.log('hello');

    // Basic validation
    if (!body.name || !body.message) {
      return NextResponse.json({ error: "Name and message are required" }, { status: 400 });
    }

    const feedback = new Feedback({
      name: body.name,
      email: body.email || "", // Optional email
      message: body.message,
      status: "pending", // Default status
      createdAt: new Date(),
    });
    await feedback.save();
    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to create feedback" }, { status: 500 });
  }
}