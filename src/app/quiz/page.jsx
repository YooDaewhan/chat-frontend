"use client";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

let socket;
if (typeof window !== "undefined") {
  socket = io("https://chat-backend-2qm3.onrender.com", {
    transports: ["websocket"],
  });
}

export default function QuizPage() {
  const [nickname, setNickname] = useState("");
  const [color, setColor] = useState("#000000");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState({});
  const [myId, setMyId] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [activeQuizList, setActiveQuizList] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("connect", () => {
      const savedNick = localStorage.getItem("nickname") || "익명";
      const savedColor = localStorage.getItem("color") || "#000000";
      setNickname(savedNick);
      setColor(savedColor);
      socket.emit("set nickname", { nickname: savedNick, color: savedColor });
    });
    socket.on("userId", (id) => setMyId(id));
    socket.on("user list", (users) => setUsers(users));
    socket.on("chat message", (data) => setMessages((prev) => [...prev, data]));
    socket.on("quiz leaderboard", (list) => setLeaderboard(list));
    socket.on("active quizzes", (list) => setActiveQuizList(list));
    socket.on("user count", (count) => setUserCount(count));

    return () => {
      socket.off("connect");
      socket.off("userId");
      socket.off("user list");
      socket.off("chat message");
      socket.off("quiz leaderboard");
      socket.off("active quizzes");
      socket.off("user count");
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const handleNicknameChange = (e) => {
    const newNick = e.target.value;
    setNickname(newNick);
    localStorage.setItem("nickname", newNick);
    socket.emit("set nickname", { nickname: newNick, color });
  };
  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    localStorage.setItem("color", newColor);
    socket.emit("set nickname", { nickname, color: newColor });
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("chat message", message);
    setMessage("");
  };

  const sendQuiz = () => {
    if (!question.trim() || !answer.trim()) return;
    socket.emit("quiz new", { question, answer });
    setQuestion("");
    setAnswer("");
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <div
      style={{
        padding: 20,
        backgroundColor: darkMode ? "#222" : "#fff",
        color: darkMode ? "#fff" : "#000",
        minHeight: "100vh",
      }}
    >
      <button onClick={toggleDarkMode} style={{ float: "right" }}>
        {darkMode ? "☀️ 라이트 모드" : "🌙 다크 모드"}
      </button>
      <h1>🧠 퀴즈 채팅</h1>

      <div style={{ marginBottom: 10 }}>
        <strong>👥 현재 접속자 수: {userCount}명</strong>
        <ul>
          {Object.entries(users).map(([sid, user]) => (
            <li key={sid} style={{ color: user.color }}>
              {user.nickname}
              {sid === myId && " (나)"}
              {/* 방장 기능, 강퇴 등도 sid로 구현 가능 */}
            </li>
          ))}
        </ul>
      </div>

      <input
        placeholder="닉네임"
        value={nickname}
        onChange={handleNicknameChange}
        maxLength={8}
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

      {/* 문제 출제 (방장일 때만) */}
      {/* 방장 여부는 users[myId] === hostId 등으로 구분해서 제어 */}
      <div style={{ marginTop: 10, marginBottom: 10 }}>
        <input
          placeholder="문제 입력"
          maxLength={250}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ marginRight: 5 }}
        />
        <input
          placeholder="정답 입력"
          maxLength={50}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          style={{ marginRight: 5 }}
        />
        <button onClick={sendQuiz}>문제 내기</button>
      </div>

      <div
        ref={messagesEndRef}
        style={{
          border: "1px solid gray",
          padding: 10,
          height: 300,
          overflowY: "scroll",
          marginBottom: 10,
          backgroundColor: darkMode ? "#333" : "#f9f9f9",
        }}
      >
        {messages.map((msg, i) => {
          const user = users[msg.senderId] || {};
          const isMine = msg.senderId === myId;

          let content = msg.message;
          if (msg.senderId === "system") {
            // [정답] -> 초록
            content = content.replace(
              /\[정답\]/g,
              '<span style="color:#28a745;font-weight:bold;">[정답]</span>'
            );
            // [문제숫자] -> 빨강
            content = content.replace(
              /\[문제\d+\]/g,
              '<span style="color:#d9534f;font-weight:bold;">$&</span>'
            );
            // [숫자/정답] => 예시: [2222]
            content = content.replace(
              /\[\d+\]/g,
              '<span style="color:#28a745;font-weight:bold;">$&</span>'
            );
          }

          return (
            <div key={i}>
              <strong
                style={{
                  color:
                    msg.senderId === "system"
                      ? "#888"
                      : isMine
                      ? "#ffc107"
                      : user.color || "#000",
                  fontWeight: isMine ? "bold" : "normal",
                }}
              >
                {msg.senderId === "system"
                  ? "[시스템]"
                  : user.nickname || "알수없음"}
              </strong>
              :{" "}
              {msg.senderId === "system" ? (
                <span dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                msg.message
              )}
            </div>
          );
        })}
      </div>

      <input
        placeholder="메시지 입력"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        style={{ marginRight: 10 }}
      />
      <button onClick={sendMessage}>전송</button>

      <hr />
      <h2>📋 진행 중 문제</h2>
      <ul>
        {activeQuizList.map((quiz) => {
          const timeLeft = Math.max(
            0,
            Math.floor((quiz.timeout - Date.now()) / 1000)
          );
          return (
            <li key={quiz.id}>
              <strong>[문제{quiz.id}]</strong>: {quiz.question}{" "}
              <span style={{ color: "gray" }}>({timeLeft}초 남음)</span>
            </li>
          );
        })}
      </ul>

      <hr />
      <h2>🏆 정답자 순위</h2>
      <ol>
        {leaderboard.map(({ sid, score }, i) => (
          <li key={sid}>
            {users[sid]?.nickname || "알수없음"} - {score}점
          </li>
        ))}
      </ol>
    </div>
  );
}
