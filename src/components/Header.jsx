// components/Header.jsx
"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header
      style={{
        width: "100%",
        background: "#4f46e5",
        color: "white",
        padding: "1rem 0",
        textAlign: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        marginBottom: "2rem",
      }}
    >
      <nav style={{ display: "flex", justifyContent: "center", gap: "2rem" }}>
        <Link
          href="/"
          style={{ color: "white", fontWeight: "bold", textDecoration: "none" }}
        >
          홈
        </Link>
        <Link
          href="/novle"
          style={{ color: "white", fontWeight: "bold", textDecoration: "none" }}
        >
          배틀
        </Link>
        <Link
          href="/quiz"
          style={{ color: "white", fontWeight: "bold", textDecoration: "none" }}
        >
          채팅
        </Link>
      </nav>
    </header>
  );
}
