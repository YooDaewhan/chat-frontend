"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MonsterMakerPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    kind: "",
    info: "",
    skil1name: "",
    skil1: "",
    skil2name: "",
    skil2: "",
    skil3name: "",
    skil3: "",
    skil4name: "",
    skil4: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value.length <= 250) {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("user");
    if (!userId) {
      setMessage("로그인 정보 없음");
      return;
    }

    try {
      const res = await fetch(
        "https://chat-backend-2qm3.onrender.com/api/monsters/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, uid: userId }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("몬스터 생성 성공!");
        router.push("/novle");
      } else {
        setMessage(`오류: ${data.error}`);
      }
    } catch (err) {
      setMessage("서버 오류: " + err.message);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto" }}>
      <h2>몬스터 생성</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        {[
          "name",
          "kind",
          "info",
          "skil1name",
          "skil1",
          "skil2name",
          "skil2",
          "skil3name",
          "skil3",
          "skil4name",
          "skil4",
        ].map((field) => (
          <input
            key={field}
            name={field}
            placeholder={field}
            value={form[field]}
            onChange={handleChange}
            required
          />
        ))}
        <button
          type="submit"
          style={{
            marginTop: "1rem",
            padding: "0.5rem",
            backgroundColor: "#4f46e5",
            color: "white",
          }}
        >
          저장
        </button>
        {message && (
          <div style={{ marginTop: "0.5rem", color: "red" }}>{message}</div>
        )}
      </form>
    </div>
  );
}
