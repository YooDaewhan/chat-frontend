"use client";

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

// ✅ 소켓 서버 주소
const socket = io("https://chat-backend-2qm3.onrender.com", {
  transports: ["websocket"],
});

export default function ChatPage() {
  const [nickname, setNickname] = useState("익명");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [userList, setUserList] = useState([]);

  const messagesEndRef = useRef(null);

  // ✅ 메시지 및 유저 수, 유저 리스트 수신
  useEffect(() => {
    socket.on("chat message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("user count", (count) => {
      setUserCount(count);
    });

    socket.on("user list", (list) => {
      setUserList(list);
    });

    return () => {
      socket.off("chat message");
      socket.off("user count");
      socket.off("user list");
    };
  }, []);

  // ✅ 닉네임 변경 시 서버에 전송
  useEffect(() => {
    socket.emit("set nickname", nickname);
  }, [nickname]);

  // ✅ 스크롤 아래로 자동 이동
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  // ✅ 메시지 전송
  const sendMessage = () => {
    if (!message.trim()) return;
    const fullMessage = `${nickname}: ${message}`;
    socket.emit("chat message", fullMessage);
    setMessage("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🗨️ 실시간 채팅</h1>

      <div style={{ marginBottom: 10 }}>
        <strong>👥 현재 접속자 수: {userCount}명</strong>
        <ul>
          {userList.map((nick, i) => (
            <li
              key={i}
              style={{ fontWeight: nick === nickname ? "bold" : "normal" }}
            >
              {nick}
            </li>
          ))}
        </ul>
      </div>

      <input
        placeholder="닉네임"
        value={nickname}
        onChange={(e) => {
          setNickname(e.target.value);
          socket.emit("set nickname", e.target.value);
        }}
        style={{ marginBottom: 10 }}
      />

      <div
        ref={messagesEndRef}
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
