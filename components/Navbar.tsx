"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signOut
} from "firebase/auth";

export default function Navbar() {
  const [notificationCount, setNotificationCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState("");

  // Get Logged-in User
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Get User Role
  useEffect(() => {
    if (!user) {
      setRole("");
      return;
    }

    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setRole(snapshot.docs[0].data().role || "");
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Real-time Notification Count (Creators only: count accepted but pending deals)
  useEffect(() => {
    if (!user || role !== "creator") {
      setNotificationCount(0);
      return;
    }

    const q = query(
      collection(db, "requests"),
      where("creatorId", "==", user.uid),
      where("status", "==", "accepted"),
      where("completed", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotificationCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [user, role]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.leftGroup}>
        <Link href="/" style={styles.link}>Home</Link>
        
        {/* Requests Link with Badge */}
        <div style={{ position: "relative" }}>
          <Link href="/requests" style={styles.link}>Requests</Link>
          {notificationCount > 0 && (
            <span style={styles.badge}>{notificationCount}</span>
          )}
        </div>

        <Link href="/creators" style={styles.link}>Creators</Link>
        
        {/* Hide Profile from Promoters */}
        {user && role === "creator" && (
          <Link href="/profile" style={styles.link}>Profile</Link>
        )}
      </div>

      <div style={styles.rightGroup}>
        {user ? (
          <>
            <span style={styles.userEmail}>{user.email}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" style={styles.link}>Login</Link>
            <Link href="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 40px",
    background: "#000",
    color: "#fff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
  },
  leftGroup: {
    display: "flex",
    gap: "25px",
    alignItems: "center"
  },
  rightGroup: {
    display: "flex",
    gap: "20px",
    alignItems: "center"
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500"
  },
  badge: {
    position: "absolute" as const,
    top: "-10px",
    right: "-15px",
    background: "#ff4d4d",
    color: "white",
    borderRadius: "50%",
    padding: "2px 6px",
    fontSize: "10px",
    fontWeight: "800",
    minWidth: "18px",
    textAlign: "center" as const,
    border: "2px solid #000"
  },
  userEmail: {
    fontSize: "12px",
    color: "#aaa",
    marginRight: "10px"
  },
  logoutBtn: {
    background: "#fff",
    color: "#000",
    border: "none",
    padding: "6px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700"
  }
};