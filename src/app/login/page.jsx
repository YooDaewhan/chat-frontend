"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserId(storedUser);
    }
  }, []);

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
        setMessage("✅ 로그인 성공!");
        localStorage.setItem("user", id);
        setUserId(id);
        router.push("/");
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      setMessage("❌ 서버 통신 오류: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUserId(null);
    setMessage("✅ 로그아웃 되었습니다.");
    setId("");
    setPassword("");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f4f8",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#ffffff",
          padding: "2rem",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          width: "300px",
          gap: "1rem",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>로그인</h2>

        <input
          placeholder="아이디"
          value={id}
          onChange={(e) => setId(e.target.value)}
          required
          style={{
            padding: "0.75rem",
            borderRadius: "5px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: "0.75rem",
            borderRadius: "5px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "0.75rem",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#4f46e5",
            color: "white",
            fontSize: "1rem",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#4338ca")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#4f46e5")}
        >
          로그인
        </button>

        {userId && (
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: "0.75rem",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#ef4444",
              color: "white",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#dc2626")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#ef4444")}
          >
            로그아웃 ({userId})
          </button>
        )}

        {message && (
          <div
            style={{
              marginTop: "0.5rem",
              color: message.includes("성공") ? "green" : "red",
              textAlign: "center",
            }}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
