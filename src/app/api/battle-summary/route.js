import { NextResponse } from "next/server";

export async function POST(req) {
  const { my, enemy } = await req.json();

  // my.skill1, my.skill2, enemy.skill1, enemy.skill2는 각각 "skil2" 등 필드명
  // 혹은 값 자체로 전달받았다면 바로 my.skill1Name, my.skill1Desc 등으로도 가능
  const mySkill1 = my[my.skill1] || "";
  const mySkill2 = my[my.skill2] || "";
  const enemySkill1 = enemy[enemy.skill1] || "";
  const enemySkill2 = enemy[enemy.skill2] || "";

  const prompt = `
두 몬스터가 가상의 전투를 벌임. 전투 장면을 실시간 중계 형식으로 400자 이내로 묘사. 승패여부 필수.

[몬스터1]
이름: ${my.name}
종족: ${my.kind}
소개: ${my.info}
사용 스킬1: ${mySkill1}
사용 스킬2: ${mySkill2}

[몬스터2]
이름: ${enemy.name}
종족: ${enemy.kind}
소개: ${enemy.info}
사용 스킬1: ${enemySkill1}
사용 스킬2: ${enemySkill2}

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
