import pool from "@/lib/db";

// CORS preflight 요청 대응
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*", // 또는 Vercel 도메인
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}

export async function POST(req) {
  try {
    const { id, pw } = await req.json();

    if (!id || !pw) {
      return new Response("id와 pw는 필수입니다.", {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // 아이디 중복 체크
    const [existing] = await pool.query("SELECT id FROM user WHERE id = ?", [
      id,
    ]);
    if (existing.length > 0) {
      return new Response("이미 존재하는 아이디입니다.", {
        status: 409,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // DB 삽입 (평문 저장)
    await pool.query("INSERT INTO user (id, pw) VALUES (?, ?)", [id, pw]);

    return new Response("회원가입 성공", {
      status: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("회원가입 오류:", err);
    return new Response("서버 오류: " + err.message, {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
