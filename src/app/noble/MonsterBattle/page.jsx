"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function MonsterBattlePage() {
  const searchParams = useSearchParams();
  const enemyMid = searchParams.get("enemy");
  const myMid = searchParams.get("my");

  const [enemyData, setEnemyData] = useState(null);
  const [myData, setMyData] = useState(null);

  useEffect(() => {
    const fetchMonster = async (mid, setter) => {
      try {
        const res = await fetch(
          `https://chat-backend-2qm3.onrender.com/api/monsters/detail?mid=${mid}`
        );
        const data = await res.json();
        setter(data);
      } catch (err) {
        console.error("몬스터 정보 불러오기 실패:", err);
      }
    };

    if (enemyMid) fetchMonster(enemyMid, setEnemyData);
    if (myMid) fetchMonster(myMid, setMyData);
  }, [enemyMid, myMid]);

  if (!enemyData || !myData) return <div>로딩 중...</div>;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "2rem",
        height: "100vh",
        backgroundColor: "#f9fafb",
      }}
    >
      {/* 내 몬스터 */}
      <div style={{ textAlign: "center" }}>
        <h2>{myData.name}</h2>
        <p>Kind: {myData.kind}</p>
        <p>Info: {myData.info}</p>
        <p>Skill1: {myData.skil1}</p>
        <p>Skill2: {myData.skil2}</p>
        <p>Skill3: {myData.skil3}</p>
        <p>Skill4: {myData.skil4}</p>
      </div>

      {/* VS */}
      <h1 style={{ fontSize: "2rem" }}>VS</h1>

      {/* 상대 몬스터 */}
      <div style={{ textAlign: "center" }}>
        <h2>{enemyData.name}</h2>
        <p>Kind: {enemyData.kind}</p>
        <p>Info: {enemyData.info}</p>
        <p>Skill1: {enemyData.skil1}</p>
        <p>Skill2: {enemyData.skil2}</p>
        <p>Skill3: {enemyData.skil3}</p>
        <p>Skill4: {enemyData.skil4}</p>
      </div>
    </div>
  );
}
