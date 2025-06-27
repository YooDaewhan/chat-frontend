"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function getRandomSkills(detail) {
  const skillKeys = ["skil1", "skil2", "skil3", "skil4"].filter(
    (k) => detail && detail[k]
  );
  const shuffled = [...skillKeys].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}

export default function MonsterBattlePage() {
  const searchParams = useSearchParams();
  const myMid = searchParams.get("myMid");
  const enemyMid = searchParams.get("enemyMid");
  const mySkill1 = searchParams.get("mySkill1");
  const mySkill2 = searchParams.get("mySkill2");

  const [myDetail, setMyDetail] = useState(null);
  const [enemyDetail, setEnemyDetail] = useState(null);
  const [battleLog, setBattleLog] = useState("");
  const [loading, setLoading] = useState(true);
  const [storySaved, setStorySaved] = useState(false);
  const [enemySkills, setEnemySkills] = useState([]);

  // 몬스터 상세정보 조회
  useEffect(() => {
    if (!myMid || !enemyMid) return;

    const fetchDetail = async (mid, setter) => {
      try {
        const res = await fetch(
          `https://chat-backend-2qm3.onrender.com/api/monsters/detail?mid=${encodeURIComponent(
            mid
          )}`
        );
        const data = await res.json();
        setter(data);
      } catch (err) {
        setter(null);
      }
    };

    fetchDetail(myMid, setMyDetail);
    fetchDetail(enemyMid, setEnemyDetail);
  }, [myMid, enemyMid]);

  // 상대 스킬 랜덤 선택
  useEffect(() => {
    if (enemyDetail) setEnemySkills(getRandomSkills(enemyDetail));
  }, [enemyDetail]);

  // GPT 호출
  useEffect(() => {
    if (!myDetail || !enemyDetail) return;
    const getBattleLog = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/battle-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ my: myDetail, enemy: enemyDetail }),
        });
        const data = await res.json();
        setBattleLog(data.result || "전투 결과 생성 실패");
      } catch (err) {
        setBattleLog("전투 결과 생성 중 오류 발생");
      }
      setLoading(false);
    };
    getBattleLog();
  }, [myDetail, enemyDetail]);

  // battleLog가 생성된 뒤 story 저장 (중복 저장 방지용 플래그 포함)
  useEffect(() => {
    if (!loading && battleLog && myDetail && enemyDetail && !storySaved) {
      const saveStory = async () => {
        try {
          await fetch(
            "https://chat-backend-2qm3.onrender.com/api/story/create",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                uid: myDetail.uid,
                storyinfo: JSON.stringify({
                  enemyUid: enemyDetail.uid,
                  enemyName: enemyDetail.name,
                  myUid: myDetail.uid,
                  myName: myDetail.name,
                }),
                storytext: battleLog,
              }),
            }
          );
          setStorySaved(true);
        } catch (err) {
          console.error("스토리 저장 실패:", err);
        }
      };
      saveStory();
    }
  }, [loading, battleLog, myDetail, enemyDetail, storySaved]);

  return (
    <div
      style={{
        padding: "2rem",
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1 style={{ marginBottom: "2rem" }}>Monster Battle</h1>
      <div style={{ display: "flex", gap: "3rem", marginBottom: "2rem" }}>
        {/* 내 몬스터: 선택 스킬만 */}
        <div style={{ textAlign: "center", minWidth: 200 }}>
          {myDetail && (
            <>
              <h2>{myDetail.name}</h2>
              <p>종족: {myDetail.kind}</p>
              <p>소개: {myDetail.info}</p>
              {[mySkill1, mySkill2].filter(Boolean).map(
                (sk, idx) =>
                  sk &&
                  myDetail[sk] && (
                    <div
                      key={sk}
                      style={{
                        marginBottom: 6,
                        background: "#eef",
                        borderRadius: 5,
                        padding: "2px 10px",
                        fontWeight: 600,
                      }}
                    >
                      스킬{sk.replace("skil", "")}: {myDetail[sk]}
                    </div>
                  )
              )}
            </>
          )}
        </div>
        <h1 style={{ alignSelf: "center" }}>VS</h1>
        {/* 상대 몬스터: 랜덤 2개 스킬 */}
        <div style={{ textAlign: "center", minWidth: 200 }}>
          {enemyDetail && (
            <>
              <h2>{enemyDetail.name}</h2>
              <p>종족: {enemyDetail.kind}</p>
              <p>소개: {enemyDetail.info}</p>
              {enemySkills.map(
                (sk, idx) =>
                  sk &&
                  enemyDetail[sk] && (
                    <div
                      key={sk}
                      style={{
                        marginBottom: 6,
                        background: "#fee",
                        borderRadius: 5,
                        padding: "2px 10px",
                        fontWeight: 600,
                      }}
                    >
                      스킬{sk.replace("skil", "")}: {enemyDetail[sk]}
                    </div>
                  )
              )}
            </>
          )}
        </div>
      </div>
      {/* 전투 결과 중계 */}
      <div
        style={{
          background: "white",
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 24,
          width: "100%",
          maxWidth: 600,
          minHeight: 120,
          marginTop: 24,
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
        }}
      >
        {loading ? "전투 결과 생성 중..." : battleLog}
      </div>
    </div>
  );
}
