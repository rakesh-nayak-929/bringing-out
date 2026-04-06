"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/app/components/ProtectedRoute";

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDoc,
} from "firebase/firestore";

export default function RequestsPage() {
  const [text, setText] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const ref = doc(db, "users", currentUser.uid);
        const snap = await getDoc(ref);
        setRole(snap.exists() ? snap.data().role || "" : "");
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user || !role) return;
    const q = role === "promoter"
        ? query(collection(db, "requests"), where("promoterId", "==", user.uid), orderBy("createdAt", "desc"))
        : query(collection(db, "requests"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, [user, role]);

  // ✅ RESTORED DELETE FUNCTION
  const deleteRequest = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this deal?")) return;
    setLoadingId(id);
    try {
      await deleteDoc(doc(db, "requests", id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete request.");
    } finally {
      setLoadingId(null);
    }
  };

  const addRequest = async () => {
    if (!text.trim() || adding || !user) return;
    setAdding(true);
    try {
      await addDoc(collection(db, "requests"), {
        title: text.trim().substring(0, 25) + (text.length > 25 ? "..." : ""),
        description: text.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
        promoterId: user.uid,
        promoterEmail: user.email,
        creatorId: null,
        creatorEmail: null,
        type: "collaboration",
        completed: false,
        rating: 0,
        review: ""
      });
      setText("");
    } finally { setAdding(false); }
  };

  const updateStatus = async (id: string) => {
    setLoadingId(id);
    try {
      await updateDoc(doc(db, "requests", id), {
        status: "accepted",
        creatorId: user.uid,
        creatorEmail: user.email
      });
    } finally { setLoadingId(null); }
  };

  const markCompleted = async (id: string) => {
    try {
      await updateDoc(doc(db, "requests", id), { completed: true });
    } catch (err) { console.error(err); }
  };

  const getPartnerId = (req: any) => {
    return role === "creator" ? req.promoterId : req.creatorId;
  };

  if (!user) return <div style={styles.loadingContainer}>Loading...</div>;

  const pending = requests.filter(r => r.status === "pending");
  const active = requests.filter(r => r.status === "accepted" && !r.completed && (r.promoterId === user.uid || r.creatorId === user.uid));

  return (
    <ProtectedRoute>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>{role === "creator" ? "Creator Feed" : "Promoter Dashboard"}</h1>
            <span style={styles.roleBadge}>{role}</span>
          </div>
          <button onClick={() => signOut(auth)} style={styles.logoutBtn}>Logout</button>
        </header>

        {role === "promoter" && (
          <div style={styles.inputSection}>
            <div style={styles.inputContainer}>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a deal description..." style={styles.textInput} />
              <button onClick={addRequest} disabled={adding} style={styles.primaryBtn}>{adding ? "..." : "➕ Post Deal"}</button>
            </div>
          </div>
        )}

        <div style={styles.content}>
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>⏳ Available Requests ({pending.length})</h2>
            <div style={styles.compactGrid}>
              {pending.map(req => (
                <div key={req.id} style={styles.compactCard}>
                  <div style={styles.infoBox}>
                    <p style={{ margin: 0 }}><strong>📌 {req.title || "No title"}</strong></p>
                    <p style={{ marginTop: "5px", fontSize: "12px" }}>🧑 From: {req.promoterEmail}</p>
                    <p style={{ marginTop: "5px", color: "#555", fontSize: "13px" }}>
                      📄 {req.description || "No description provided."}
                    </p>
                  </div>

                  <div style={styles.compactActions}>
                    {role === "creator" && (
                      <button onClick={() => updateStatus(req.id)} style={styles.miniCompleteBtn}>Accept Deal</button>
                    )}
                    {req.promoterId === user.uid && (
                      <button 
                        onClick={() => deleteRequest(req.id)} 
                        disabled={loadingId === req.id}
                        style={{...styles.miniChatBtn, color: 'red'}}
                      >
                        {loadingId === req.id ? "..." : "Remove"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>🔄 In Progress ({active.length})</h2>
            <div style={styles.compactGrid}>
              {active.map(req => (
                <div key={req.id} style={{...styles.compactCard, borderLeft: '4px solid #4ade80'}}>
                   <div style={styles.infoBox}>
                    <p><strong>📌 {req.title}</strong></p>
                    <p style={{fontSize: "12px"}}>🤝 {role === "creator" ? req.promoterEmail : req.creatorEmail}</p>
                  </div>
                  <div style={styles.compactActions}>
                    <button onClick={() => router.push(`/chat?user=${getPartnerId(req)}`)} style={styles.miniChatBtn}>💬 Chat</button>
                    {role === "promoter" && <button onClick={() => markCompleted(req.id)} style={styles.miniCompleteBtn}>Complete</button>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f8fafc", paddingBottom: "40px" },
  loadingContainer: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  header: { background: "white", padding: "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  title: { fontSize: "18px", fontWeight: "800", color: "#1e293b" },
  roleBadge: { fontSize: "10px", background: "#f1f5f9", padding: "2px 8px", borderRadius: "10px", color: "#64748b" },
  logoutBtn: { background: "#ef4444", color: "white", border: "none", padding: "8px 15px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" },
  inputSection: { maxWidth: "1000px", margin: "30px auto", padding: "0 20px" },
  inputContainer: { display: "flex", gap: "10px", background: "white", padding: "12px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" },
  textInput: { flex: 1, border: "1px solid #e2e8f0", padding: "10px", borderRadius: "8px", outline: "none" },
  primaryBtn: { background: "#4f46e5", color: "white", border: "none", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  content: { maxWidth: "1000px", margin: "0 auto", padding: "0 20px" },
  section: { marginBottom: "40px" },
  sectionTitle: { color: "#1e293b", fontSize: "16px", marginBottom: "15px", fontWeight: "700" },
  compactGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" },
  compactCard: { background: "white", padding: "16px", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" as const, gap: "12px" },
  infoBox: { background: "#f9fafb", padding: "12px", borderRadius: "10px", border: "1px solid #f1f5f9" },
  compactActions: { display: "flex", gap: "10px" },
  miniChatBtn: { flex: 1, padding: "8px", fontSize: "12px", background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  miniCompleteBtn: { flex: 1, padding: "8px", fontSize: "12px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }
};