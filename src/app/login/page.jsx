"use client";
import { useState } from "react";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("로그인 성공!");
        localStorage.setItem("user", id); // ✅ 로컬스토리지 저장
      } else {
        setMessage(`오류: ${data.error}`);
      }
    } catch (err) {
      setMessage("서버 통신 오류: " + err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>로그인</h1>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: 300,
          gap: 10,
        }}
      >
        <input
          placeholder="아이디"
          value={id}
          onChange={(e) => setId(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">로그인</button>
        {message && <div style={{ marginTop: 10 }}>{message}</div>}
      </form>
    </div>
  );
}
