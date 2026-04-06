"use client";

import { useState, useCallback } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 🛡️ Safe register handler with AbortController
  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!role) {
      setMsg("❌ Please select a role");
      return;
    }

    if (password.length < 6) {
      setMsg("❌ Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setMsg("");

    const controller = new AbortController();
    
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        email, 
        password
      );

      const user = userCredential.user;

      if (controller.signal.aborted) return;

      // ✅ UPDATED: New user document structure
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        role: role,
        name: "", // Add default values or let the user fill them later
        bio: "",
        niche: "",
        platform: "",
        createdAt: serverTimestamp(),
      });

      if (controller.signal.aborted) return;

      setMsg("✅ Registered Successfully! Redirecting...");
      
      // 🔄 Redirect after success
      setTimeout(() => {
        router.push("/requests");
        router.refresh();
      }, 1500);

    } catch (error: any) {
      // 🛡️ Ignore AbortError
      if (error.name !== 'AbortError') {
        console.error("Register error:", error);
        setMsg(`❌ ${error.message}`);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [email, password, role, router]);

  return (
    <div style={{ 
      padding: "40px 20px", 
      maxWidth: "400px", 
      margin: "0 auto",
      fontFamily: "system-ui"
    }}>
      <h1 style={{ textAlign: "center", color: "#333" }}>Register 📝</h1>

      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
          style={{
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            fontSize: "16px"
          }}
        />
        
        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          minLength={6}
          style={{
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            fontSize: "16px"
          }}
        />
        
        <select 
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={loading}
          required
          style={{
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            fontSize: "16px"
          }}
        >
          <option value="">Select Role</option>
          <option value="creator">🎬 Creator</option>
          <option value="promoter">📢 Promoter</option>
        </select>

        <button
          type="submit"
          disabled={loading || !role || password.length < 6}
          style={{
            padding: "14px",
            backgroundColor: loading ? "#ccc" : "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s"
          }}
        >
          {loading ? "⏳ Registering..." : "🚀 Register"}
        </button>
      </form>

      {msg && (
        <p style={{
          marginTop: "20px",
          padding: "12px",
          borderRadius: "8px",
          textAlign: "center",
          fontWeight: "500",
          backgroundColor: msg.includes("✅") ? "#dcfce7" : "#fee2e2",
          color: msg.includes("✅") ? "#166534" : "#dc2626"
        }}>
          {msg}
        </p>
      )}
    </div>
  );
}