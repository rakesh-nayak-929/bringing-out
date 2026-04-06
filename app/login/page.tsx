"use client";

import { useState, useEffect, useCallback } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [role, setRole] = useState("");
  const router = useRouter();

  // 🛡️ Role-based redirect logic
  const handleRoleRedirect = useCallback(async (user: any) => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();

      if (userData?.role) {
        setRole(userData.role);
        
        // 🔄 Role-based redirects
        if (userData.role === "creator") {
          router.push("/profile");
        } else if (userData.role === "promoter") {
          router.push("/requests");
        } else {
          // Unknown role - log out and show error
          await signOut(auth);
          setMsg("❌ Invalid role. Please register again.");
        }
      } else {
        // No profile - redirect to register
        await signOut(auth);
        router.push("/register");
      }
    } catch (error: any) {
      console.error("Role fetch error:", error);
      setMsg("❌ Error fetching profile. Please register.");
      await signOut(auth);
    }
  }, [router]);

  // 🔥 Auto-redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await handleRoleRedirect(user);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [handleRoleRedirect]);

  // 🛡️ Safe login handler
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setMsg("❌ Please fill all fields");
      return;
    }

    setLoading(true);
    setMsg("");

    const controller = new AbortController();

    try {
      await signInWithEmailAndPassword(auth, email, password);

      if (controller.signal.aborted) return;

      setMsg("✅ Login Successful! Checking role...");
      
      // Wait a bit for auth state to propagate, then redirect will handle
      setTimeout(async () => {
        if (!controller.signal.aborted) {
          const user = auth.currentUser;
          if (user) {
            await handleRoleRedirect(user);
          }
        }
      }, 500);

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Login error:", error);
        setMsg(`❌ ${error.message}`);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [email, password, handleRoleRedirect]);

  // 🔄 Show loading while checking auth state
  if (authLoading) {
    return (
      <div style={{ 
        padding: "40px 20px", 
        maxWidth: "400px", 
        margin: "0 auto",
        textAlign: "center"
      }}>
        <p>🔄 Checking authentication...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "40px 20px", 
      maxWidth: "400px", 
      margin: "0 auto",
      fontFamily: "system-ui"
    }}>
      <h1 style={{ textAlign: "center", color: "#333", marginBottom: "30px" }}>
        Login 🔐
      </h1>

      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
          style={{
            padding: "12px",
            border: loading ? "1px solid #ccc" : "1px solid #ddd",
            borderRadius: "8px",
            fontSize: "16px",
            transition: "all 0.2s"
          }}
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          style={{
            padding: "12px",
            border: loading ? "1px solid #ccc" : "1px solid #ddd",
            borderRadius: "8px",
            fontSize: "16px",
            transition: "all 0.2s"
          }}
        />
        
        <button
          type="submit"
          disabled={loading || !email || !password}
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
          {loading ? "⏳ Signing In..." : "🚀 Login"}
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

      <div style={{ 
        marginTop: "30px", 
        textAlign: "center", 
        fontSize: "14px", 
        color: "#666" 
      }}>
        <p>Don't have an account? <a href="/register" style={{ color: "#4f46e5" }}>Register here</a></p>
      </div>
    </div>
  );
}