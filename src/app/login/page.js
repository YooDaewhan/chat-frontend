"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch(
        "http://ec2-3-38-180-108.ap-northeast-2.compute.amazonaws.com:3000/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setResult("✅ 로그인 성공");
      } else {
        setResult("❌ 로그인 실패: " + data.message);
      }
    } catch (err) {
      setResult("❌ 오류 발생");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>🔐 로그인</h1>
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />
      <button onClick={handleLogin}>로그인</button>
      <p>{result}</p>
    </div>
  );
}
