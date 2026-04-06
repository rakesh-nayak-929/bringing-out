"use client";

import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();

  const itemStyle = {
    padding: "12px",
    cursor: "pointer",
    borderRadius: "8px",
    marginBottom: "10px",
  };

  return (
    <div style={{
      width: "220px",
      height: "100vh",
      background: "#1e293b",
      color: "white",
      padding: "20px",
      position: "fixed",
      left: 0,
      top: 0
    }}>
      <h2 style={{ marginBottom: "30px" }}>🚀 App</h2>

      <div style={itemStyle} onClick={() => router.push("/dashboard")}>
        📊 Dashboard
      </div>

      <div style={itemStyle} onClick={() => router.push("/requests")}>
        📩 Requests
      </div>

      <div style={itemStyle} onClick={() => router.push("/creators")}>
        🎬 Creators
      </div>

      <div style={itemStyle} onClick={() => router.push("/chat")}>
        💬 Chat
      </div>

      <div style={itemStyle} onClick={() => router.push("/profile")}>
        👤 Profile
      </div>
    </div>
  );
}