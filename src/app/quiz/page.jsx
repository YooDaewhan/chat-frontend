// ✅ ChatPage.jsx (프론트 전체 코드)
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
  const [isHost, setIsHost] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizAnswer, setQuizAnswer] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
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

    socket.on("host status", ({ isHost }) => {
      setIsHost(isHost);
    });

    socket.on("quiz correct", ({ nickname, color, question }) => {
      setMessages((prev) => [
        ...prev,
        {
          nickname: "🎉 정답자",
          color,
          message: `${nickname}님이 정답을 맞췄습니다! (${question})`,
        },
      ]);
    });

    socket.on("quiz leaderboard", (ranks) => {
      setLeaderboard(ranks);
    });

    socket.on("kick", () => {
      alert("🚫 방장에 의해 강퇴당했습니다.");
      socket.disconnect();
    });

    socket.on("banned", (msg) => {
      alert("🚫 차단됨: " + msg);
    });

    return () => {
      socket.off("chat message");
      socket.off("user count");
      socket.off("user list");
      socket.off("host status");
      socket.off("quiz correct");
      socket.off("quiz leaderboard");
      socket.off("kick");
      socket.off("banned");
    };
  }, []);

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

  const submitQuiz = () => {
    if (!quizQuestion.trim() || !quizAnswer.trim()) return;
    socket.emit("quiz new", {
      question: quizQuestion,
      answer: quizAnswer,
    });
    setQuizQuestion("");
    setQuizAnswer("");
  };

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
      <h1>🧠 퀴즈 채팅방</h1>

      <div style={{ marginBottom: 10 }}>
        <strong>👥 현재 접속자 수: {userCount}명</strong>
        <ul>
          {userList.map((user, i) => {
            const isMyself = user.nickname === nickname;
            const isCurrentHost = isHost && isMyself;
            const isTargetHost =
              socket.id === hostId && user.nickname !== nickname;

            const isHostUser =
              user.nickname ===
              Object.values(users).find((u, idx) => idx === 0)?.nickname;

            return (
              <li key={i} style={{ color: user.color }}>
                {user.nickname}
                {user.nickname === users[hostId]?.nickname && " 👑"}
                {isMyself && " (나)"}
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
                      킥
                    </button>
                    <button
                      onClick={() =>
                        socket.emit("delegate host", user.nickname)
                      }
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
            );
          })}
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

      {isHost ? (
        <div style={{ margin: "10px 0" }}>
          <h3>문제 출제</h3>
          <input
            placeholder="문제"
            value={quizQuestion}
            onChange={(e) => setQuizQuestion(e.target.value)}
            style={{ marginRight: 10 }}
          />
          <input
            placeholder="정답"
            value={quizAnswer}
            onChange={(e) => setQuizAnswer(e.target.value)}
            style={{ marginRight: 10 }}
          />
          <button onClick={submitQuiz}>문제내기</button>
        </div>
      ) : (
        <p style={{ color: "#888" }}>🛑 방장만 문제 출제가 가능합니다.</p>
      )}

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

      <div style={{ marginTop: 20 }}>
        <h3>🏆 정답자 순위표</h3>
        <ol>
          {leaderboard.map((entry, i) => (
            <li
              key={i}
              style={{
                fontWeight: entry.name === nickname ? "bold" : "normal",
              }}
            >
              {entry.rank === 1
                ? "🥇"
                : entry.rank === 2
                ? "🥈"
                : entry.rank === 3
                ? "🥉"
                : ""}{" "}
              {entry.name} ({entry.score}점)
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
