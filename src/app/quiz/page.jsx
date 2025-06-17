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

  // 퀴즈 관련
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizAnswer, setQuizAnswer] = useState("");

  const messagesEndRef = useRef(null);

  // 소켓 이벤트 설정
  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("set nickname", { nickname, color });
    });

    socket.on("chat message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("quiz correct", ({ nickname, color }) => {
      setMessages((prev) => [
        ...prev,
        {
          nickname: "✅ 정답",
          color,
          message: `${nickname}님이 정답을 맞췄습니다!`,
        },
      ]);
    });

    socket.on("user count", (count) => {
      setUserCount(count);
    });

    socket.on("user list", (list) => {
      setUserList(list);
    });

    return () => {
      socket.off("connect");
      socket.off("chat message");
      socket.off("quiz correct");
      socket.off("user count");
      socket.off("user list");
    };
  }, []);

  // 스크롤 자동 이동
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  // 문제 출제
  const submitQuiz = () => {
    if (!quizQuestion.trim() || !quizAnswer.trim()) return;
    socket.emit("quiz new", {
      question: quizQuestion,
      answer: quizAnswer,
    });
    setQuizQuestion("");
    setQuizAnswer("");
  };

  // 메시지 전송
  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("chat message", message);
    setMessage("");
  };

  // 닉네임/색상 변경 처리
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

  return (
    <div style={{ padding: 20 }}>
      <h1>🧠 퀴즈 채팅</h1>

      {/* 문제 출제 영역 */}
      <div style={{ marginBottom: 20 }}>
        <h3>문제 출제</h3>
        <input
          placeholder="문제 입력"
          value={quizQuestion}
          onChange={(e) => setQuizQuestion(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <input
          placeholder="정답 입력"
          value={quizAnswer}
          onChange={(e) => setQuizAnswer(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <button onClick={submitQuiz}>문제내기</button>
      </div>

      {/* 접속자 수 및 유저 리스트 */}
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

      {/* 닉네임 및 색상 */}
      <div style={{ marginBottom: 10 }}>
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
            style={{ marginLeft: 5 }}
          />
        </label>
      </div>

      {/* 채팅 메시지 영역 */}
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

      {/* 채팅 입력 */}
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
