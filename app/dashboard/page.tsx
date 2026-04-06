"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
  });

  // 1. Listen for Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch role from Firestore
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setRole(userSnap.data().role);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Fix Query Based on Role
  useEffect(() => {
    if (!user || !role) return;

    let q;
    if (role === "promoter") {
      // 🔥 Promoter sees requests they CREATED
      q = query(
        collection(db, "requests"),
        where("promoterId", "==", user.uid)
      );
    } else {
      // 🔥 Creator sees requests ASSIGNED to them
      q = query(
        collection(db, "requests"),
        where("creatorId", "==", user.uid)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach((doc) => {
        data.push(doc.data());
      });

      // 🔥 Update Stats with Filter
      const total = data.length;
      const pending = data.filter((r) => r.status === "pending").length;
      const accepted = data.filter((r) => r.status === "accepted" && !r.completed).length;
      const completed = data.filter((r) => r.completed === true).length;

      setStats({ total, pending, accepted, completed });
    });

    return () => unsubscribe();
  }, [user, role]);

  const cardStyle = {
    flex: 1,
    padding: "20px",
    borderRadius: "16px",
    background: "white",
    color: "#1e293b",
    textAlign: "center" as const,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    border: "1px solid #e2e8f0"
  };

  const numberStyle = {
    fontSize: "28px",
    fontWeight: "800",
    margin: "10px 0 0 0",
    color: "#4f46e5"
  };

  return (
    <ProtectedRoute>
      <div style={{ padding: "40px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
        <header style={{ marginBottom: "30px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>📊 {role === "promoter" ? "Promoter" : "Creator"} Dashboard</h1>
          <p style={{ color: "#64748b" }}>Real-time overview of your collaboration stats.</p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          
          <div style={cardStyle}>
            <h3 style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>Total Requests</h3>
            <p style={numberStyle}>{stats.total}</p>
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>⏳ Pending</h3>
            <p style={{ ...numberStyle, color: "#f59e0b" }}>{stats.pending}</p>
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>🤝 Accepted</h3>
            <p style={{ ...numberStyle, color: "#10b981" }}>{stats.accepted}</p>
          </div>

          {/* ✅ Added Completed Card */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>✅ Completed</h3>
            <p style={{ ...numberStyle, color: "#8b5cf6" }}>{stats.completed}</p>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}