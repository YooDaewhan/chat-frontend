"use client";
import { useEffect, useState } from "react";

export default function NoblePage() {
  const [allMonsters, setAllMonsters] = useState([]);
  const [myMonsters, setMyMonsters] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedId = localStorage.getItem("user");
    if (!storedId) {
      alert("로그인이 필요합니다.");
      return;
    }
    setUserId(storedId);

    // 전체 몬스터 목록 가져오기 (Render API 바로 호출)
    const fetchAllMonsters = async () => {
      try {
        const res = await fetch(
          "https://chat-backend-2qm3.onrender.com/api/monsters/all"
        );
        const data = await res.json();
        setAllMonsters(data);
      } catch (err) {
        console.error("전체 몬스터 불러오기 실패:", err);
      }
    };

    // 내 몬스터 목록 가져오기 (Render API 바로 호출)
    const fetchMyMonsters = async () => {
      try {
        const res = await fetch(
          `https://chat-backend-2qm3.onrender.com/api/monsters/my?id=${storedId}`
        );
        const data = await res.json();
        setMyMonsters(data);
      } catch (err) {
        console.error("내 몬스터 불러오기 실패:", err);
      }
    };

    fetchAllMonsters();
    fetchMyMonsters();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: "2rem",
        padding: "2rem",
        backgroundColor: "#f3f4f6",
        minHeight: "100vh",
      }}
    >
      {/* 전체 몬스터 목록 박스 */}
      <div
        style={{
          flex: 1,
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderRadius: "10px",
          padding: "1rem",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <h2>전체 몬스터 목록</h2>
        {allMonsters.length > 0 ? (
          <ul>
            {allMonsters.map((mon) => (
              <li key={mon.uid}>
                [{mon.uid}] {mon.name}
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
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <h2>내 몬스터 목록</h2>
        {myMonsters.length > 0 ? (
          <ul>
            {myMonsters.map((mon) => (
              <li key={mon.uid}>
                [{mon.uid}] {mon.name}
              </li>
            ))}
          </ul>
        ) : (
          <p>로딩 중...</p>
        )}
      </div>
    </div>
  );
}
