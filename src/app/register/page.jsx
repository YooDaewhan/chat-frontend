"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id || !password || !confirmPassword) {
      setMessage("모든 항목을 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, password }),
      });

      if (res.ok) {
        setMessage("회원가입 성공!");
      } else {
        const errorData = await res.json();
        setMessage(`오류: ${errorData.error}`);
      }
    } catch (err) {
      setMessage("서버 통신 오류: " + err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>회원가입</h1>
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
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
        />
        <button type="submit">회원가입</button>
        {message && <div style={{ marginTop: 10 }}>{message}</div>}
      </form>
    </div>
  );
}
