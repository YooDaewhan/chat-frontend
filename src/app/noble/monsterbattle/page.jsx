"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function MonsterBattlePage() {
  const searchParams = useSearchParams();
  const myUid = searchParams.get("myUid");
  const myName = searchParams.get("myName");
  const enemyUid = searchParams.get("enemyUid");
  const enemyName = searchParams.get("enemyName");

  const [myDetail, setMyDetail] = useState(null);
  const [enemyDetail, setEnemyDetail] = useState(null);
  const [battleLog, setBattleLog] = useState("");
  const [loading, setLoading] = useState(true);
  const [storySaved, setStorySaved] = useState(false); // 중복 저장 방지

  // 1. 몬스터 상세정보 조회
  useEffect(() => {
    if (!myUid || !myName || !enemyUid || !enemyName) return;

    const fetchDetail = async (uid, name, setter) => {
      try {
        const res = await fetch(
          `https://chat-backend-2qm3.onrender.com/api/monsters/detail?uid=${encodeURIComponent(
            uid
          )}&name=${encodeURIComponent(name)}`
        );
        const data = await res.json();
        setter(data);
      } catch (err) {
        setter(null);
      }
    };

    fetchDetail(myUid, myName, setMyDetail);
    fetchDetail(enemyUid, enemyName, setEnemyDetail);
  }, [myUid, myName, enemyUid, enemyName]);

  // 2. 두 몬스터 모두 받아오면 GPT 프록시 호출
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

  // 3. battleLog가 생성된 뒤 story 저장 (중복 저장 방지용 플래그 포함)
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
                uid: myDetail.uid, // 나의 uid
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
          // 저장 실패 무시
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
      {/* 두 몬스터 정보 VS로 */}
      <div style={{ display: "flex", gap: "3rem", marginBottom: "2rem" }}>
        {/* 내 몬스터 */}
        <div style={{ textAlign: "center", minWidth: 200 }}>
          {myDetail && (
            <>
              <h2>{myDetail.name}</h2>
              <p>종족: {myDetail.kind}</p>
              <p>소개: {myDetail.info}</p>
              <p>스킬1: {myDetail.skil1}</p>
              <p>스킬2: {myDetail.skil2}</p>
              <p>스킬3: {myDetail.skil3}</p>
              <p>스킬4: {myDetail.skil4}</p>
            </>
          )}
        </div>
        <h1 style={{ alignSelf: "center" }}>VS</h1>
        {/* 상대 몬스터 */}
        <div style={{ textAlign: "center", minWidth: 200 }}>
          {enemyDetail && (
            <>
              <h2>{enemyDetail.name}</h2>
              <p>종족: {enemyDetail.kind}</p>
              <p>소개: {enemyDetail.info}</p>
              <p>스킬1: {enemyDetail.skil1}</p>
              <p>스킬2: {enemyDetail.skil2}</p>
              <p>스킬3: {enemyDetail.skil3}</p>
              <p>스킬4: {enemyDetail.skil4}</p>
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
