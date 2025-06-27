"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
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
      const res = await fetch(
        "https://chat-backend-2qm3.onrender.com/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, password }),
        }
      );

      if (res.ok) {
        setMessage("✅ 회원가입 성공1!");
        router.push("/");
      } else {
        const errorData = await res.json();
        setMessage(`❌ 오류: ${errorData.error}`);
      }
    } catch (err) {
      setMessage("❌ 서버 통신 오류: " + err.message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f4fc 0%, #f9fafb 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          padding: "2.5rem 2.5rem 2rem 2.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.2rem",
          minWidth: 340,
          maxWidth: "100vw",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "0.5rem",
            fontSize: "1.7rem",
            letterSpacing: "-1px",
          }}
        >
          회원가입
        </h1>

        <input
          placeholder="아이디"
          value={id}
          onChange={(e) => setId(e.target.value)}
          required
          style={{
            padding: "0.75rem 1rem",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            fontSize: "1rem",
            background: "#f9fafb",
            transition: "border 0.2s",
            outline: "none",
          }}
          onFocus={(e) => (e.target.style.border = "1.5px solid #6366f1")}
          onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: "0.75rem 1rem",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            fontSize: "1rem",
            background: "#f9fafb",
            transition: "border 0.2s",
            outline: "none",
          }}
          onFocus={(e) => (e.target.style.border = "1.5px solid #6366f1")}
          onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
        />

        <input
          type="password"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{
            padding: "0.75rem 1rem",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            fontSize: "1rem",
            background: "#f9fafb",
            transition: "border 0.2s",
            outline: "none",
          }}
          onFocus={(e) => (e.target.style.border = "1.5px solid #6366f1")}
          onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
        />

        <button
          type="submit"
          style={{
            padding: "0.85rem",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(90deg, #6366f1 60%, #4f46e5 100%)",
            color: "#fff",
            fontSize: "1.08rem",
            fontWeight: 600,
            cursor: "pointer",
            marginTop: "0.3rem",
            transition: "background 0.18s, transform 0.12s",
            boxShadow: "0 2px 6px rgba(79,70,229,0.06)",
          }}
          onMouseOver={(e) => (e.target.style.background = "#4338ca")}
          onMouseOut={(e) =>
            (e.target.style.background =
              "linear-gradient(90deg, #6366f1 60%, #4f46e5 100%)")
          }
        >
          회원가입
        </button>

        {message && (
          <div
            style={{
              marginTop: "0.5rem",
              color: message.startsWith("✅") ? "#22c55e" : "#ef4444",
              background: "#f1f5f9",
              borderRadius: 7,
              padding: "0.7rem 0.5rem 0.6rem 0.5rem",
              fontSize: "1.02rem",
              textAlign: "center",
              border: message.startsWith("✅")
                ? "1.2px solid #22c55e55"
                : "1.2px solid #ef444444",
              minHeight: "1.4em",
            }}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
