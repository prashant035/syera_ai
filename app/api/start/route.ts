import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";


export async function POST(request: Request) {
  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    // Map session_id from Python backend to sessionId for frontend
    return NextResponse.json({
      sessionId: data.session_id,
      question: data.question,
      repeat_question: data.repeat_question,
      duration: data.duration,
    });
  } catch (error) {
    console.error("PROXY START ERROR:", error);
    return NextResponse.json(
      { error: "Failed to connect to interview backend" },
      { status: 500 }
    );
  }
}
