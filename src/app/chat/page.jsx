"use client";

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("https://chat-backend-2qm3.onrender.com", {
  transports: ["websocket"],
});

export default function ChatPage() {
  const [nickname, setNickname] = useState("익명");
  const [color, setColor] = useState("#000000");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [userList, setUserList] = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    // ✅ 소켓 연결된 직후 닉네임/색상 보내기
    socket.on("connect", () => {
      socket.emit("set nickname", { nickname, color });
    });

    socket.on("chat message", (data) => {
      setMessages((prev) => [...prev, data]);
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
      socket.off("connect");
    };
  }, []);

  // ✅ 닉네임 바꿀 때도 서버에 보내기
  const handleNicknameChange = (e) => {
    const newNick = e.target.value;
    setNickname(newNick);
    socket.emit("set nickname", { nickname: newNick, color });
  };

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    socket.emit("set nickname", { nickname, color: newColor });
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("chat message", message);
    setMessage("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🗨️ 실시간 채팅</h1>

      <div style={{ marginBottom: 10 }}>
        <strong>👥 현재 접속자 수: {userCount}명</strong>
        <ul>
          {userList.map((user, i) => (
            <li key={i} style={{ color: user.color }}>
              {user.nickname}
            </li>
          ))}
        </ul>
      </div>

      <input
        placeholder="닉네임"
        value={nickname}
        onChange={handleNicknameChange}
        style={{ marginRight: 10 }}
      />
      <label>
        🎨 색상:
        <input
          type="color"
          value={color}
          onChange={handleColorChange}
          style={{ marginLeft: 5, marginRight: 10 }}
        />
      </label>

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
          <div key={i}>
            <strong style={{ color: msg.color }}>{msg.nickname}</strong>:{" "}
            <span>{msg.message}</span>
          </div>
        ))}
      </div>

      <input
        placeholder="메시지 입력"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        style={{ marginRight: 10 }}
      />
      <button onClick={sendMessage}>전송</button>
    </div>
  );
}
