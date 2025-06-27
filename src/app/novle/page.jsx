"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function novlePage() {
  const router = useRouter();

  const [allMonsters, setAllMonsters] = useState([]);
  const [myMonsters, setMyMonsters] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedEnemy, setSelectedEnemy] = useState(null);
  const [selectedMyMonster, setSelectedMyMonster] = useState(null);

  // 내 몬스터 스킬 선택 state
  const [selectedMySkills, setSelectedMySkills] = useState([]);

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
      const filtered = Array.isArray(data)
        ? data.filter((mon) => String(mon.uid) !== String(storedId))
        : [];
      setAllMonsters(filtered);
    };

    const fetchMyMonsters = async () => {
      const res = await fetch(
        `https://chat-backend-2qm3.onrender.com/api/monsters/my?id=${storedId}`
      );
      const data = await res.json();
      setMyMonsters(Array.isArray(data) ? data : []);
    };

    fetchAllMonsters();
    fetchMyMonsters();
  }, []);

  // 내 몬스터 바뀔 때마다 스킬 선택 초기화
  useEffect(() => {
    setSelectedMySkills([]);
  }, [selectedMyMonster]);

  // 내 스킬 체크 핸들러 (최대 2개)
  const handleMySkillToggle = (skillKey) => {
    if (selectedMySkills.includes(skillKey)) {
      setSelectedMySkills(selectedMySkills.filter((s) => s !== skillKey));
    } else if (selectedMySkills.length < 2) {
      setSelectedMySkills([...selectedMySkills, skillKey]);
    }
  };

  // 배틀 버튼 핸들러 (내 스킬 key만 url로)
  const handleBattle = () => {
    if (selectedMyMonster && selectedEnemy) {
      const mySkillParams = selectedMySkills
        .map((sk, i) => `mySkill${i + 1}=${encodeURIComponent(sk)}`)
        .join("&");
      const url = `/novle/monsterbattle?myMid=${encodeURIComponent(
        selectedMyMonster.mid
      )}&enemyMid=${encodeURIComponent(selectedEnemy.mid)}${
        mySkillParams ? "&" + mySkillParams : ""
      }`;
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
      {/* 위쪽 두 박스 */}
      <div style={{ display: "flex", gap: "1rem", height: "40vh" }}>
        {/* 전체 몬스터 목록 */}
        <div
          style={{
            flex: 1,
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "1rem",
            overflowY: "auto",
            height: "100%",
            minHeight: 0,
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
        {/* 내 몬스터 목록 */}
        <div
          style={{
            flex: 1,
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "1rem",
            overflowY: "auto",
            height: "100%",
            minHeight: 0,
          }}
        >
          <h2>내 몬스터 목록</h2>
          <button
            onClick={() => router.push("/novle/monstermkr")}
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
        {/* 왼쪽 - 상대 몬스터 (스킬 선택 없음) */}
        {selectedEnemy && (
          <div
            style={{
              minWidth: 240,
              background: "#f9fafb",
              borderRadius: 12,
              padding: 16,
              border: "1px solid #f59e0b",
            }}
          >
            <h3>상대 몬스터</h3>
            <p>UID: {selectedEnemy.uid}</p>
            <p>Name: {selectedEnemy.name}</p>
            <p>mid: {selectedEnemy.mid}</p>
            <p>종족: {selectedEnemy.kind}</p>
            <p>소개: {selectedEnemy.info}</p>
            <p>
              스킬1: {selectedEnemy.skil1name} - {selectedEnemy.skil1}
            </p>
            <p>
              스킬2: {selectedEnemy.skil2name} - {selectedEnemy.skil2}
            </p>
            <p>
              스킬3: {selectedEnemy.skil3name} - {selectedEnemy.skil3}
            </p>
            <p>
              스킬4: {selectedEnemy.skil4name} - {selectedEnemy.skil4}
            </p>
          </div>
        )}
        {/* VS */}
        {selectedMyMonster && selectedEnemy && (
          <h1 style={{ fontSize: "2rem" }}>VS</h1>
        )}
        {/* 오른쪽 - 내 몬스터 (스킬 선택) */}
        {selectedMyMonster && (
          <div
            style={{
              minWidth: 240,
              background: "#f8fafc",
              borderRadius: 12,
              padding: 16,
              border: "1px solid #4f46e5",
            }}
          >
            <h3>내 몬스터</h3>
            <p>UID: {selectedMyMonster.uid}</p>
            <p>Name: {selectedMyMonster.name}</p>
            <p>mid: {selectedMyMonster.mid}</p>
            <p>종족: {selectedMyMonster.kind}</p>
            <p>소개: {selectedMyMonster.info}</p>
            <div style={{ textAlign: "left", margin: "1rem 0" }}>
              <div style={{ fontWeight: 500, marginBottom: "0.7rem" }}>
                내 스킬 선택 (최대 2개)
              </div>
              {["skil1", "skil2", "skil3", "skil4"].map((sk, i) => {
                const skillNameKey = `skil${i + 1}name`;
                const skillName = selectedMyMonster[skillNameKey];
                const skillDesc = selectedMyMonster[sk];
                return (
                  <label
                    key={sk}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 8,
                      gap: 8,
                      fontSize: "1rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMySkills.includes(sk)}
                      onChange={() => handleMySkillToggle(sk)}
                      disabled={
                        !selectedMySkills.includes(sk) &&
                        selectedMySkills.length >= 2
                      }
                      style={{ accentColor: "#4f46e5", width: 18, height: 18 }}
                    />
                    <span
                      style={{
                        background: selectedMySkills.includes(sk)
                          ? "#c7d2fe"
                          : "#fff",
                        border: "1px solid #4f46e5",
                        borderRadius: 6,
                        padding: "0.25em 0.75em",
                        fontWeight: selectedMySkills.includes(sk) ? 600 : 400,
                        color: "#3730a3",
                      }}
                    >
                      {skillName
                        ? `스킬${i + 1}이름: ${skillName}`
                        : `스킬${i + 1}`}{" "}
                      {skillDesc && `- ${skillDesc}`}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* 아무것도 없으면 안내 */}
        {!selectedMyMonster && !selectedEnemy && <p>몬스터를 선택하세요.</p>}
      </div>

      {/* 배틀 버튼 (조건: 내 몬스터, 상대 몬스터, 내 스킬 1개 이상) */}
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
              cursor: selectedMySkills.length === 0 ? "not-allowed" : "pointer",
              fontWeight: "bold",
              opacity: selectedMySkills.length === 0 ? 0.5 : 1,
            }}
            disabled={selectedMySkills.length === 0}
          >
            배틀 시작
          </button>
        )}
      </div>
    </div>
  );
}
