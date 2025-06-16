"use client";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("https://chat-backend-2qm3.onrender.com"); // 백엔드 서버 주소

export default function ChatPage() {
  const [nickname, setNickname] = useState("익명");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const chatBoxRef = useRef(null); // ✅ 채팅박스 ref

  useEffect(() => {
    socket.on("chat message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("chat message");
  }, []);

  // ✅ 새 메시지 생기면 자동 스크롤 아래로
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;
    const fullMessage = `${nickname}: ${message}`;
    socket.emit("chat message", fullMessage);
    setMessage("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🗨️ 실시간 채팅</h1>
      <input
        placeholder="닉네임"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <div
        ref={chatBoxRef} // ✅ 여기 연결됨
        style={{
          border: "1px solid gray",
          padding: 10,
          height: 300,
          overflowY: "scroll",
          marginBottom: 10,
        }}
      >
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
      <input
        placeholder="메시지 입력"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
      <button onClick={sendMessage}>전송</button>
    </div>
  );
}
