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
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [messages, setMessages] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [userList, setUserList] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [hostNickname, setHostNickname] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [correctMsg, setCorrectMsg] = useState(null);
  const [activeQuizList, setActiveQuizList] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [darkMode, setDarkMode] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      const savedNick = localStorage.getItem("nickname") || "익명";
      const savedColor = localStorage.getItem("color") || "#000000";
      setNickname(savedNick);
      setColor(savedColor);
      socket.emit("set nickname", { nickname: savedNick, color: savedColor });
    });

    socket.on("chat message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("user count", (count) => {
      setUserCount(count);
    });

    socket.on("user list", ({ users, hostNickname }) => {
      setUserList(users);
      setHostNickname(hostNickname);
    });

    socket.on("host status", ({ isHost }) => {
      setIsHost(isHost);
    });

    socket.on("quiz correct", ({ nickname, color, answer, questionId }) => {
      setCorrectMsg(
        `${nickname}님이 문제${questionId}의 정답 "${answer}" 를 맞췄습니다!`
      );
      setTimeout(() => setCorrectMsg(null), 5000);
    });

    socket.on("quiz leaderboard", (ranks) => {
      setLeaderboard(ranks);
    });

    socket.on("active quizzes", (list) => {
      setActiveQuizList(list);
    });

    socket.on("kick", () => {
      alert("방장에 의해 퇴장당했습니다.");
      window.location.reload();
    });

    socket.on("banned", (msg) => {
      alert(msg);
      window.location.reload();
    });

    return () => {
      socket.off("connect");
      socket.off("chat message");
      socket.off("user count");
      socket.off("user list");
      socket.off("host status");
      socket.off("quiz correct");
      socket.off("quiz leaderboard");
      socket.off("active quizzes");
      socket.off("kick");
      socket.off("banned");
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNicknameChange = (e) => {
    const newNick = e.target.value;
    setNickname(newNick);
    localStorage.setItem("nickname", newNick);
    socket?.emit("set nickname", { nickname: newNick, color });
  };

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    localStorage.setItem("color", newColor);
    socket?.emit("set nickname", { nickname, color: newColor });
  };

  const sendMessage = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    if (trimmed === "/방장") {
      socket.emit("force host");
      setMessage("");
      return;
    }
    socket?.emit("chat message", trimmed);
    setMessage("");
  };

  const sendQuiz = () => {
    if (!question.trim() || !answer.trim()) return;
    socket?.emit("quiz new", { question, answer });
    setQuestion("");
    setAnswer("");
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div
      style={{
        padding: 20,
        backgroundColor: darkMode ? "#222" : "#fff",
        color: darkMode ? "#fff" : "#000",
      }}
    >
      <button onClick={toggleDarkMode} style={{ float: "right" }}>
        {darkMode ? "☀️ 라이트 모드" : "🌙 다크 모드"}
      </button>
      <h1>🧠 퀴즈 채팅</h1>

      <div style={{ marginBottom: 10 }}>
        <strong>👥 현재 접속자 수: {userCount}명</strong>
        <ul>
          {userList.map((user, i) => (
            <li key={i} style={{ color: user.color }}>
              {user.nickname}
              {user.nickname === nickname && " (나)"}
              {user.nickname === hostNickname && " 👑"}
              {isHost && user.nickname !== nickname && (
                <>
                  <button
                    onClick={() => socket.emit("kick user", user.nickname)}
                    style={{
                      marginLeft: 10,
                      color: "white",
                      backgroundColor: "red",
                      border: "none",
                      borderRadius: 4,
                    }}
                  >
                    강퇴
                  </button>
                  <button
                    onClick={() => socket.emit("delegate host", user.nickname)}
                    style={{
                      marginLeft: 5,
                      color: "white",
                      backgroundColor: "blue",
                      border: "none",
                      borderRadius: 4,
                    }}
                  >
                    방장 위임
                  </button>
                </>
              )}
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

      {isHost && (
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
      )}

      {correctMsg && (
        <div style={{ color: "green", marginBottom: 10 }}>{correctMsg}</div>
      )}

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
        {messages.map((msg, i) => (
          <div key={i}>
            <strong style={{ color: msg.color }}>{msg.nickname}</strong>:{" "}
            {msg.message}
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

      <hr />
      <h2>📋 진행 중 문제</h2>
      <ul>
        {activeQuizList.map((quiz) => {
          const timeLeft = Math.max(0, Math.floor((quiz.timeout - now) / 1000));
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
        {leaderboard.map((entry, i) => (
          <li key={i}>
            {entry?.rank === 1
              ? "🥇"
              : entry?.rank === 2
              ? "🥈"
              : entry?.rank === 3
              ? "🥉"
              : ""}{" "}
            {entry.name} - {entry.score}점
          </li>
        ))}
      </ol>
    </div>
  );
}
