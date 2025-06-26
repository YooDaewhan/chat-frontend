import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { id, password } = await req.json();

    const renderRes = await fetch(
      "https://chat-backend-2qm3.onrender.com/api/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, password }),
      }
    );

    const data = await renderRes.json();
    return NextResponse.json(data, { status: renderRes.status });
  } catch (err) {
    console.error("Render API 호출 실패:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
