"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NoblePage() {
  const router = useRouter();

  const [allMonsters, setAllMonsters] = useState([]);
  const [myMonsters, setMyMonsters] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedEnemyMid, setSelectedEnemyMid] = useState(null);
  const [selectedMyMid, setSelectedMyMid] = useState(null);

  useEffect(() => {
    const storedId = localStorage.getItem("user");
    if (!storedId) {
      alert("로그인이 필요합니다.");
      return;
    }
    setUserId(storedId);

    const fetchAllMonsters = async () => {
      const res = await fetch(
        "https://chat-backend-2qm3.onrender.com/api/monsters/all"
      );
      const data = await res.json();
      setAllMonsters(data);
    };

    const fetchMyMonsters = async () => {
      const res = await fetch(
        `https://chat-backend-2qm3.onrender.com/api/monsters/my?id=${storedId}`
      );
      const data = await res.json();
      setMyMonsters(data);
    };

    fetchAllMonsters();
    fetchMyMonsters();
  }, []);

  useEffect(() => {
    if (selectedEnemyMid && selectedMyMid) {
      router.push(
        `/noble/monsterbattle?enemy=${selectedEnemyMid}&my=${selectedMyMid}`
      );
    }
  }, [selectedEnemyMid, selectedMyMid, router]);

  return (
    <div style={{ display: "flex", gap: "2rem", padding: "2rem" }}>
      {/* 전체 몬스터 목록 */}
      <div
        style={{
          flex: 1,
          background: "white",
          padding: "1rem",
          borderRadius: "8px",
        }}
      >
        <h2>전체 몬스터 목록</h2>
        {allMonsters.map((mon) => (
          <div key={mon.mid} style={{ marginBottom: "0.5rem" }}>
            [{mon.mid}] {mon.name}
            <button
              style={{ marginLeft: "1rem" }}
              onClick={() => setSelectedEnemyMid(mon.mid)}
            >
              상대 선택
            </button>
          </div>
        ))}
      </div>

      {/* 내 몬스터 목록 */}
      <div
        style={{
          flex: 1,
          background: "white",
          padding: "1rem",
          borderRadius: "8px",
        }}
      >
        <h2>내 몬스터 목록</h2>

        {/* ✅ "몬스터 추가하기" 버튼 */}
        <button
          onClick={() => router.push("/noble/monstermkr")}
          style={{
            marginBottom: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          몬스터 추가하기
        </button>

        {myMonsters.map((mon) => (
          <div key={mon.mid} style={{ marginBottom: "0.5rem" }}>
            [{mon.mid}] {mon.name}
            <button
              style={{ marginLeft: "1rem" }}
              onClick={() => setSelectedMyMid(mon.mid)}
            >
              내 몬스터 선택
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
