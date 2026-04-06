"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function CreatorsPage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [sending, setSending] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  // --- THEME & ANIMATION STYLES ---
  const globalStyles = `
    :root {
      --bg-primary: #ffffff;
      --bg-secondary: #f9fafb;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --card-bg: #ffffff;
      --accent: #4f46e5;
      --star: #f59e0b;
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
    .creator-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-left: 5px solid var(--accent);
    }
    .creator-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    .btn-action {
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .btn-action:hover:not(:disabled) {
      transform: scale(1.05);
      opacity: 0.9;
    }
    .rating-badge {
      background: #fef3c7;
      color: #92400e;
      padding: 4px 8px;
      border-radius: 6px;
      font-weight: bold;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
  `;

  const styles = {
    container: { padding: "40px 20px", maxWidth: "900px", margin: "0 auto", backgroundColor: "var(--bg-primary)", minHeight: "100vh" },
    header: { textAlign: "center" as const, marginBottom: "50px" },
    creatorCard: {
      padding: "25px",
      marginBottom: "20px",
      borderRadius: "16px",
      backgroundColor: "var(--card-bg)",
      boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
      color: "var(--text-main)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "20px"
    },
    sendBtn: {
      padding: "12px 24px",
      backgroundColor: "#4f46e5",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: "700" as const,
    },
    alreadySentBtn: {
      backgroundColor: "var(--text-muted)",
      cursor: "not-allowed",
    }
  };

  // Load Creators
  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "creator"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.name && data.niche) {
          list.push({ id: doc.id, uid: data.uid || doc.id, ...data });
        }
      });
      setCreators(list);
    });
    return unsubscribe;
  }, []);

  // Load Sent Requests
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const q = query(collection(db, "requests"), where("promoterId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sentIds = new Set<string>();
      snapshot.forEach((doc) => {
        sentIds.add(doc.data().creatorId);
      });
      setSentRequests(sentIds);
    });
    return unsubscribe;
  }, []);

  // ✅ UPDATED STEP 1: Send Request with Title & Description Prompts
  const sendRequest = async (creatorId: string, creatorEmail: string) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please login");
      return;
    }

    // 🔥 NEW INPUTS
    const title = prompt("Enter collaboration title (e.g. Summer Campaign):");
    if (!title) return;

    const description = prompt("Describe the work / purpose of this deal:");
    if (!description) return;

    setSending(creatorId);

    try {
      await addDoc(collection(db, "requests"), {
        title,         // ✅ NEW
        description,   // ✅ NEW
        message: `New collab request from ${user.email}`,
        status: "pending",
        createdAt: serverTimestamp(),
        
        promoterId: user.uid,
        promoterEmail: user.email,
        
        creatorId,
        creatorEmail,
        
        type: "collaboration",
        completed: false,
        rating: 0,
        review: ""
      });

      alert("✅ Request sent successfully!");
      setSentRequests(prev => new Set([...prev, creatorId]));
    } catch (error) {
      console.error("Send error:", error);
    } finally {
      setSending(null);
    }
  };

  const isSent = (id: string) => sentRequests.has(id);
  const isSending = (id: string) => sending === id;

  return (
    <ProtectedRoute>
      <div style={styles.container}>
        <style>{globalStyles}</style>
        
        <div style={styles.header}>
          <h1 style={{ color: "var(--text-main)", fontSize: "3rem", marginBottom: "10px" }}>🎬 Creators</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
            Connect with the highest-rated talent for your next campaign.
          </p>
        </div>

        {creators.length === 0 ? (
          <div style={{ textAlign: "center", padding: "100px", color: "var(--text-muted)" }}>
            <h3>No creators found</h3>
          </div>
        ) : (
          <div>
            {creators.map((creator) => (
              <div key={creator.id} className="creator-card" style={styles.creatorCard}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: "1.4rem" }}>{creator.name}</h3>
                    
                    {creator.avgRating && (
                      <div className="rating-badge">
                        ⭐ {creator.avgRating} 
                        <span style={{ fontWeight: 'normal', opacity: 0.7, fontSize: '11px' }}>
                          ({creator.ratingCount})
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "14px" }}>
                    <p><strong>🎯 Niche:</strong> {creator.niche}</p>
                    <p><strong>📱 Platform:</strong> {creator.platform || "N/A"}</p>
                    <p><strong>👥 Size:</strong> {creator.followers || "N/A"}</p>
                    <p><strong>📧 Contact:</strong> {creator.email}</p>
                  </div>

                  <p style={{ marginTop: "15px", color: "var(--text-muted)", fontStyle: "italic", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "10px" }}>
                    "{creator.bio || "Active creator ready for collaboration."}"
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                    <button
                      className="btn-action"
                      onClick={() => sendRequest(creator.id, creator.email)}
                      disabled={isSent(creator.id) || isSending(creator.id)}
                      style={{
                          ...styles.sendBtn,
                          ...(isSent(creator.id) ? styles.alreadySentBtn : {})
                      }}
                    >
                      {isSent(creator.id) ? "✅ Sent" : isSending(creator.id) ? "📤 ..." : "📤 Collaborate"}
                    </button>
                    
                    {creator.ratingCount > 5 && creator.avgRating > 4.5 && (
                        <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 'bold' }}>🔥 TOP RATED</span>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}