"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  // CSS Variables and Global Styles for Hover & Transitions
  const globalStyles = `
    :root {
      --bg-primary: #ffffff;
      --bg-secondary: #f9fafb;
      --text-main: #1f2937;
      --text-muted: #6b7280;
      --card-bg: #ffffff;
      --accent: #4f46e5;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg-primary: #0f172a;
        --bg-secondary: #1e293b;
        --text-main: #f8fafc;
        --text-muted: #94a3b8;
        --card-bg: #1e293b;
      }
    }

    .hover-scale {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .hover-scale:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    }

    .btn-hover {
      transition: all 0.2s ease;
    }

    .btn-hover:hover {
      opacity: 0.9;
      transform: scale(1.05);
    }

    .btn-hover:active {
      transform: scale(0.95);
    }
  `;

  const glassCard = {
    backdropFilter: "blur(12px)",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "16px",
    padding: "20px",
    color: "white",
    fontSize: "15px",
    fontWeight: "500",
  };

  const featureCardStyle = {
    padding: "30px",
    borderRadius: "20px",
    background: "var(--card-bg)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    cursor: "pointer",
    width: "260px",
    textAlign: "left" as const,
    border: "1px solid rgba(124, 58, 237, 0.1)",
  };

  return (
    <div style={{ 
      fontFamily: "'Inter', sans-serif", 
      backgroundColor: "var(--bg-primary)", 
      color: "var(--text-main)",
      transition: "background-color 0.5s ease" 
    }}>
      <style>{globalStyles}</style>

      {/* 🔥 HERO SECTION */}
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        textAlign: "center",
        padding: "40px 20px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Animated Background Blob */}
        <div style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "50%",
          top: "-100px",
          right: "-100px",
          filter: "blur(80px)"
        }} />

        <h1 style={{ fontSize: "clamp(40px, 8vw, 72px)", fontWeight: "800", marginBottom: "20px", letterSpacing: "-1px" }}>
          🚀 Bringing Out
        </h1>

        <p style={{ fontSize: "clamp(18px, 4vw, 22px)", maxWidth: "700px", opacity: 0.9, lineHeight: "1.6" }}>
          The ultimate bridge where creators meet promoters. <br />
          Collaborate, grow your brand, and scale to the moon.
        </p>

        <div style={{ marginTop: "40px", display: "flex", gap: "15px" }}>
          <button
            className="btn-hover"
            onClick={() => router.push("/creators")}
            style={{
              padding: "16px 32px",
              borderRadius: "12px",
              border: "none",
              background: "white",
              color: "#4f46e5",
              fontWeight: "700",
              fontSize: "16px",
              cursor: "pointer",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
            }}
          >
            Explore Marketplace
          </button>

          <button
            className="btn-hover"
            onClick={() => router.push("/register")}
            style={{
              padding: "16px 32px",
              borderRadius: "12px",
              border: "2px solid rgba(255,255,255,0.4)",
              background: "rgba(255,255,255,0.1)",
              color: "white",
              fontWeight: "700",
              fontSize: "16px",
              cursor: "pointer",
              backdropFilter: "blur(5px)"
            }}
          >
            Get Started
          </button>
        </div>

        {/* Glass stats */}
        <div style={{
          display: "flex",
          gap: "20px",
          marginTop: "60px",
          flexWrap: "wrap",
          justifyContent: "center"
        }}>
          <div style={glassCard} className="hover-scale">🔥 100+ Top Creators</div>
          <div style={glassCard} className="hover-scale">📩 Real-time Requests</div>
          <div style={glassCard} className="hover-scale">💬 Secure Live Chat</div>
        </div>
      </div>

      {/* ✨ FEATURES SECTION */}
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <h2 style={{ fontSize: "36px", marginBottom: "10px" }}>✨ Powerful Features</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "50px" }}>Everything you need to grow your influence.</p>

        <div style={{
          display: "flex",
          gap: "25px",
          flexWrap: "wrap",
          justifyContent: "center"
        }}>
          {[
            { title: "🔐 Auth", desc: "Secure login & role-based access", icon: "🛡️" },
            { title: "📩 Smart Requests", desc: "Send, accept & manage deals", icon: "⚡" },
            { title: "💬 Messaging", desc: "Encrypted real-time chat", icon: "🗨️" },
            { title: "📊 Dashboard", desc: "Analytics at your fingertips", icon: "📈" },
          ].map((feat, i) => (
            <div key={i} style={featureCardStyle} className="hover-scale">
              <div style={{ fontSize: "32px", marginBottom: "15px" }}>{feat.icon}</div>
              <h3 style={{ marginBottom: "10px" }}>{feat.title}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.5" }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ⚙️ HOW IT WORKS */}
      <div style={{
        padding: "100px 20px",
        background: "var(--bg-secondary)",
        textAlign: "center",
        transition: "0.5s"
      }}>
        <h2 style={{ fontSize: "32px" }}>⚙️ How It Works</h2>
        <div style={{
          display: "flex",
          gap: "30px",
          marginTop: "50px",
          flexWrap: "wrap",
          justifyContent: "center"
        }}>
          {["Join", "Discover", "Collaborate"].map((step, i) => (
            <div key={i} style={{ ...featureCardStyle, textAlign: "center" }} className="hover-scale">
              <div style={{ 
                width: "40px", 
                height: "40px", 
                background: "#4f46e5", 
                color: "white", 
                borderRadius: "50%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                margin: "0 auto 20px auto",
                fontWeight: "bold"
              }}>{i + 1}</div>
              <h3>{step}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                {i === 0 && "Create your profile in seconds."}
                {i === 1 && "Find your perfect match."}
                {i === 2 && "Chat and scale together."}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 🚀 FINAL CTA */}
      <div style={{
        padding: "100px 20px",
        textAlign: "center",
        background: "linear-gradient(rgba(79, 70, 229, 0.95), rgba(79, 70, 229, 0.95)), url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1000&q=80')",
        backgroundSize: "cover",
        color: "white"
      }}>
        <h2 style={{ fontSize: "40px", marginBottom: "20px" }}>Ready to build your network? 🚀</h2>
        <button
          className="btn-hover"
          onClick={() => router.push("/register")}
          style={{
            padding: "18px 40px",
            borderRadius: "50px",
            border: "none",
            background: "white",
            color: "#4f46e5",
            fontWeight: "800",
            fontSize: "18px",
            cursor: "pointer",
            boxShadow: "0 15px 30px rgba(0,0,0,0.2)"
          }}
        >
          Join 10,000+ Users
        </button>
      </div>

      {/* FOOTER */}
      <div style={{
        padding: "40px",
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: "14px",
        borderTop: "1px solid rgba(0,0,0,0.05)"
      }}>
        © 2026 Bringing Out • Built  for Creators and Promoters
      </div>
    </div>
  );
}