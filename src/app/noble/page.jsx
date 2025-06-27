"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NoblePage() {
  const router = useRouter();

  const [allMonsters, setAllMonsters] = useState([]);
  const [myMonsters, setMyMonsters] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedEnemy, setSelectedEnemy] = useState(null);
  const [selectedMyMonster, setSelectedMyMonster] = useState(null);

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
      // 내 몬스터 제외
      const filtered = data.filter(
        (mon) => String(mon.uid) !== String(storedId)
      );
      setAllMonsters(filtered);
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

  const handleBattle = () => {
    if (selectedMyMonster && selectedEnemy) {
      const url = `/noble/monsterbattle?myMid=${encodeURIComponent(
        selectedMyMonster.mid
      )}&enemyMid=${encodeURIComponent(selectedEnemy.mid)}`;
      router.push(url);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "2rem",
        backgroundColor: "#f3f4f6",
        minHeight: "100vh",
      }}
    >
      {/* 위쪽 두 박스 (45% 높이) */}
      <div style={{ display: "flex", gap: "1rem", height: "45%" }}>
        {/* 전체 몬스터 목록 박스 */}
        <div
          style={{
            flex: 1,
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "1rem",
            overflowY: "auto",
          }}
        >
          <h2>전체 몬스터 목록</h2>
          {allMonsters.length > 0 ? (
            <ul>
              {allMonsters.map((mon) => (
                <li key={mon.uid} style={{ marginBottom: "0.5rem" }}>
                  [{mon.uid}] {mon.name}
                  <button
                    onClick={() => setSelectedEnemy(mon)}
                    style={{
                      marginLeft: "1rem",
                      padding: "0.25rem 0.5rem",
                      backgroundColor: "#f59e0b",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    상대 선택
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>로딩 중...</p>
          )}
        </div>

        {/* 내 몬스터 목록 박스 */}
        <div
          style={{
            flex: 1,
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "1rem",
            overflowY: "auto",
          }}
        >
          <h2>내 몬스터 목록</h2>
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
          <ul>
            {myMonsters.map((mon) => (
              <li key={mon.uid} style={{ marginBottom: "0.5rem" }}>
                [{mon.uid}] {mon.name}
                <button
                  onClick={() => setSelectedMyMonster(mon)}
                  style={{
                    marginLeft: "1rem",
                    padding: "0.25rem 0.5rem",
                    backgroundColor: "#4f46e5",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  내 몬스터 선택
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 아래쪽 선택 결과 박스 */}
      <div
        style={{
          flex: 1,
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderRadius: "10px",
          padding: "1rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          gap: "2rem",
        }}
      >
        {/* 왼쪽 - 상대 몬스터 */}
        {selectedEnemy && (
          <div>
            <h3>상대 몬스터</h3>
            <p>UID: {selectedEnemy.uid}</p>
            <p>Name: {selectedEnemy.name}</p>
            <p>mid: {selectedEnemy.mid}</p>
            <p>종족: {selectedEnemy.kind}</p>
            <p>소개: {selectedEnemy.info}</p>
            <p>스킬1: {selectedEnemy.skil1}선택</p>
            <p>스킬2: {selectedEnemy.skil2}선택</p>
            <p>스킬3: {selectedEnemy.skil3}선택</p>
            <p>스킬4: {selectedEnemy.skil4}선택</p>
          </div>
        )}
        {/* VS 표시는 둘 다 있을 때만 */}
        {selectedMyMonster && selectedEnemy && (
          <h1 style={{ fontSize: "2rem" }}>VS</h1>
        )}
        {/* 오른쪽 - 내 몬스터 */}
        {selectedMyMonster && (
          <div>
            <h3>내 몬스터</h3>
            <p>UID: {selectedMyMonster.uid}</p>
            <p>Name: {selectedMyMonster.name}</p>
            <p>mid: {selectedMyMonster.mid}</p>
            <p>종족: {selectedMyMonster.kind}</p>
            <p>소개: {selectedMyMonster.info}</p>
            <p>스킬1: {selectedMyMonster.skil1}선택</p>
            <p>스킬2: {selectedMyMonster.skil2}선택</p>
            <p>스킬3: {selectedMyMonster.skil3}선택</p>
            <p>스킬4: {selectedMyMonster.skil4}선택</p>
          </div>
        )}

        {/* 아무것도 없으면 안내 */}
        {!selectedMyMonster && !selectedEnemy && <p>몬스터를 선택하세요.</p>}
      </div>

      {/* 🟢 배틀 버튼: 두 몬스터 모두 선택했을 때만 표시 */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        {selectedMyMonster && selectedEnemy && (
          <button
            onClick={handleBattle}
            style={{
              marginTop: "1rem",
              padding: "0.75rem 2rem",
              backgroundColor: "#e11d48",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1.1rem",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            배틀 시작
          </button>
        )}
      </div>
    </div>
  );
}
