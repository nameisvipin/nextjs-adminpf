import connectDB from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import { NextResponse } from "next/server";



// PUT: Update feedback (status and/or reply)
export async function PUT(request, { params }) {
    await connectDB();
  try {
    const { id } = await params;
    const body = await request.json();
    console.log(body);
    console.log('checking....')

    const updateData = {};
    if (body.status) {
      updateData.status = body.status;
    }
    if (body.reply) {
      updateData.reply = body.reply;
      updateData.repliedAt = new Date(); // Set timestamp when reply is added
    }

    const feedback = await Feedback.findByIdAndUpdate(id, updateData, { new: true });
    console.log('feedback', feedback);
    if (!feedback) {
        console.log('not found');
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }
    return NextResponse.json(feedback, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 });
  }
}

// DELETE: Delete feedback
export async function DELETE(request, { params }) {
    await connectDB();
  try {
    const { id } = await params;
    const feedback = await Feedback.findByIdAndDelete(id);
    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Feedback deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete feedback" }, { status: 500 });
  }
}