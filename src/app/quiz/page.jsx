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
  const [hostId, setHostId] = useState(""); // 방장 socketId
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
    socket.on("user list", (usersObj) => setUsers(usersObj));
    socket.on("host status", ({ hostId }) => setHostId(hostId));
    socket.on("chat message", (data) => setMessages((prev) => [...prev, data]));
    socket.on("quiz leaderboard", (list) => setLeaderboard(list));
    socket.on("active quizzes", (list) => setActiveQuizList(list));
    socket.on("user count", (count) => setUserCount(count));
    socket.on("kick", () => {
      alert("방장에 의해 퇴장당했습니다.");
      window.location.reload();
    });

    return () => {
      socket.off("connect");
      socket.off("userId");
      socket.off("user list");
      socket.off("host status");
      socket.off("chat message");
      socket.off("quiz leaderboard");
      socket.off("active quizzes");
      socket.off("user count");
      socket.off("kick");
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
    if (message.trim() === "/방장") {
      socket.emit("force host");
      setMessage("");
      return;
    }
    socket.emit("chat message", message);
    setMessage("");
  };

  const sendQuiz = () => {
    if (!question.trim() || !answer.trim()) return;
    socket.emit("quiz new", { question, answer });
    setQuestion("");
    setAnswer("");
  };

  const handleKick = (targetSid) => {
    if (window.confirm("정말 강퇴하시겠습니까?")) {
      socket.emit("kick user", targetSid);
    }
  };

  const handleDelegate = (targetSid) => {
    if (window.confirm("해당 유저에게 방장을 위임하시겠습니까?")) {
      socket.emit("delegate host", targetSid);
    }
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // 시스템 메시지 강조
  function highlightSystemMessage(msg) {
    let elements = [];
    let str = msg;
    // [정답]
    const answerIdx = str.indexOf("[정답]");
    if (answerIdx !== -1) {
      elements.push(
        <span key="정답" style={{ color: "#28a745", fontWeight: "bold" }}>
          [정답]
        </span>
      );
      str = str.slice(answerIdx + 4);
    }
    // [문제숫자]
    const quizIdx = str.indexOf("[문제");
    if (quizIdx !== -1) {
      elements.push(str.slice(0, quizIdx));
      const quizEnd = str.indexOf("]", quizIdx);
      elements.push(
        <span key="문제" style={{ color: "#d9534f", fontWeight: "bold" }}>
          {str.slice(quizIdx, quizEnd + 1)}
        </span>
      );
      str = str.slice(quizEnd + 1);
    }
    // [숫자] 정답 강조
    const answerNumIdx = str.indexOf("[");
    if (answerNumIdx !== -1) {
      elements.push(str.slice(0, answerNumIdx));
      const answerNumEnd = str.indexOf("]", answerNumIdx);
      elements.push(
        <span key="정답숫자" style={{ color: "#28a745", fontWeight: "bold" }}>
          {str.slice(answerNumIdx, answerNumEnd + 1)}
        </span>
      );
      elements.push(str.slice(answerNumEnd + 1));
    } else {
      elements.push(str);
    }
    return elements;
  }

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
            <li key={sid} style={{ color: user.color, marginBottom: 2 }}>
              {user.nickname}
              {sid === myId && " (나)"}
              {sid === hostId && " 👑"}
              {myId === hostId && sid !== myId && (
                <>
                  <button
                    onClick={() => handleKick(sid)}
                    style={{
                      marginLeft: 10,
                      color: "white",
                      backgroundColor: "red",
                      border: "none",
                      borderRadius: 4,
                      padding: "2px 8px",
                      fontSize: 13,
                    }}
                  >
                    강퇴
                  </button>
                  <button
                    onClick={() => handleDelegate(sid)}
                    style={{
                      marginLeft: 5,
                      color: "white",
                      backgroundColor: "blue",
                      border: "none",
                      borderRadius: 4,
                      padding: "2px 8px",
                      fontSize: 13,
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

      {myId === hostId && (
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

          if (msg.senderId === "system") {
            return (
              <div key={i}>
                <strong style={{ color: "#888" }}>[시스템]</strong> :{" "}
                {highlightSystemMessage(msg.message)}
              </div>
            );
          }

          return (
            <div key={i}>
              <strong
                style={{
                  color: isMine ? color : user.color || "#000",
                  fontWeight: isMine ? "bold" : "normal",
                }}
              >
                {user.nickname || "알수없음"}
              </strong>
              : {msg.message}
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
            {users[sid]?.nickname || "알수없음"}
            {sid === hostId && " 👑"} - {score}점
          </li>
        ))}
      </ol>
    </div>
  );
}
