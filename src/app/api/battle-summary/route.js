// src/app/api/battle-summary/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  const { my, enemy } = await req.json();
  const prompt = `
다음 두 몬스터가 가상의 전투를 벌입니다. 전투 장면을 실시간 중계 형식으로 300자 이내로 요약해서 묘사해주세요.

[몬스터1]
이름: ${my.name}
종족: ${my.kind}
소개: ${my.info}
스킬1: ${my.skil1}
스킬2: ${my.skil2}
스킬3: ${my.skil3}
스킬4: ${my.skil4}

[몬스터2]
이름: ${enemy.name}
종족: ${enemy.kind}
소개: ${enemy.info}
스킬1: ${enemy.skil1}
스킬2: ${enemy.skil2}
스킬3: ${enemy.skil3}
스킬4: ${enemy.skil4}

중계 시작:
`;

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    return NextResponse.json({
      result: data.choices?.[0]?.message?.content || "GPT 응답 없음",
    });
  } catch (err) {
    return NextResponse.json(
      { result: "오류: " + err.message },
      { status: 500 }
    );
  }
}
