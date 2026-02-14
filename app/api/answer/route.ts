import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";


export async function POST(request: Request) {
  try {
    const body = await request.json();

    const sessionId = body.sessionId;
    const text = body.text;

    // ✅ Only sessionId is mandatory
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // ✅ FIX: prevent empty speech from breaking backend
    const safeText =
      typeof text === "string" && text.trim().length > 0
        ? text.trim()
        : "skip";

    const res = await fetch(`${BACKEND_URL}/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        text: safeText,
      }),
    });

    // ✅ backend error safety
    if (!res.ok) {
      const errText = await res.text();
      console.error("Backend error:", errText);

      return NextResponse.json(
        { error: "Backend error" },
        { status: 500 }
      );
    }

    const data = await res.json();

    return NextResponse.json({
      question: data.question,
      repeat_question: data.repeat_question,
      questionCount: data.question_count,
      stage: data.stage,
      elapsed: data.elapsed,
      action: data.action,
    });

  } catch (error) {
    console.error("PROXY ANSWER ERROR:", error);

    return NextResponse.json(
      { error: "Failed to connect to interview backend" },
      { status: 500 }
    );
  }
}
