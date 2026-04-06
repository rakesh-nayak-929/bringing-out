"use client";

import { useEffect, useRef, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useSearchParams } from "next/navigation";

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<any>(null);

  const params = useSearchParams();
  const promoterId = params.get("promoter");
  const creatorId = params.get("creator");

  // 🔥 SAME CHAT ID ALWAYS
  const chatId =
    promoterId! < creatorId!
      ? `${promoterId}_${creatorId}`
      : `${creatorId}_${promoterId}`;

  // 🔥 FETCH MESSAGES
  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data: any[] = [];
      snap.forEach((doc) => data.push(doc.data()));
      setMessages(data);

      // auto scroll
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsub();
  }, [chatId]);

  // 🔥 SEND MESSAGE
  const sendMessage = async () => {
    if (!text.trim()) return;

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text,
      senderId: auth.currentUser?.uid,
      createdAt: serverTimestamp(),
    });

    setText("");
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#ece5dd"
    }}>

      {/* 🔝 HEADER */}
      <div style={{
        padding: "15px",
        background: "#075e54",
        color: "white",
        fontWeight: "bold"
      }}>
        💬 Chat
      </div>

      {/* 💬 MESSAGES */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "10px"
      }}>
        {messages.map((msg, i) => {
          const isMe = msg.senderId === auth.currentUser?.uid;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                marginBottom: "10px"
              }}
            >
              <div
                style={{
                  background: isMe ? "#dcf8c6" : "white",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  maxWidth: "60%",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                }}
              >
                <p style={{ margin: 0 }}>{msg.text}</p>

                <p style={{
                  fontSize: "10px",
                  textAlign: "right",
                  marginTop: "5px",
                  color: "#555"
                }}>
                  {msg.createdAt?.toDate?.().toLocaleTimeString?.([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* ✍ INPUT */}
      <div style={{
        display: "flex",
        padding: "10px",
        background: "#f0f0f0"
      }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "20px",
            border: "1px solid #ccc",
            outline: "none"
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />

        <button
          onClick={sendMessage}
          style={{
            marginLeft: "10px",
            padding: "10px 16px",
            borderRadius: "50%",
            border: "none",
            background: "#075e54",
            color: "white",
            cursor: "pointer"
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}