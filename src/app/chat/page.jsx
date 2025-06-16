"use client";
import { useEffect, useState, useRef } from "react"; // useRef import 추가
import { io } from "socket.io-client";

const socket = io("https://chat-backend-2qm3.onrender.com"); // 백엔드 서버 주소

export default function ChatPage() {
  const [nickname, setNickname] = useState("익명");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const messagesEndRef = useRef(null); // 메시지 div의 참조를 위한 useRef 생성

  useEffect(() => {
    socket.on("chat message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("chat message");
  }, []);

  // 메시지가 업데이트될 때마다 스크롤을 맨 아래로 내리는 useEffect
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]); // messages 배열이 변경될 때마다 실행

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
        ref={messagesEndRef} // useRef로 생성한 참조를 여기에 연결
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
