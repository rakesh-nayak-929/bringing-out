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
  setDoc,
  getDoc,
} from "firebase/firestore";

// 🎨 Styles
const styles = {
  container: { padding: "20px", maxWidth: "800px", margin: "auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  inputBox: { display: "flex", gap: "10px", marginBottom: "20px" },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
  primaryBtn: { backgroundColor: "#4f46e5", color: "white" },
  dangerBtn: { backgroundColor: "#ef4444", color: "white" },
  card: {
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
  },
  acceptedCard: { borderLeft: "5px solid green" },
  pendingCard: { borderLeft: "5px solid orange" },
};

export default function RequestsPage() {
  const [text, setText] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState("");
  const router = useRouter();

  // ✅ STEP 1: Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Current User:", currentUser); // Debug log
      setUser(currentUser);

      if (currentUser) {
        try {
          const ref = doc(db, "users", currentUser.uid);
          const snap = await getDoc(ref);

          if (snap.exists()) {
            setRole(snap.data().role || "");
          } else {
            console.log("No profile found for UID:", currentUser.uid);
            setRole("");
          }
        } catch (err) {
          console.error("Error fetching role:", err);
          setRole("");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 🔥 STEP: Firestore listener depends on role
  useEffect(() => {
    if (!user || !role) return;

    let q;

    if (role === "promoter") {
      q = query(
        collection(db, "requests"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(
        collection(db, "requests"),
        orderBy("createdAt", "desc")
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: any[] = [];
        snapshot.forEach((docItem) => {
          data.push({ id: docItem.id, ...docItem.data() });
        });
        setRequests(data);
      },
      (error) => {
        console.log("Snapshot error:", error.message);
      }
    );

    return () => unsubscribe();
  }, [user, role]);

  // 🔧 Add Request
  const addRequest = async () => {
    if (!text.trim() || adding) return;

    if (!user) {
      router.push("/login");
      return;
    }

    setAdding(true);
    try {
      await addDoc(collection(db, "requests"), {
        message: text.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
        userId: user.uid,
        role: role,
      });
      setText("");
    } catch (error) {
      console.log("Add Error:", error);
    } finally {
      setAdding(false);
    }
  };

  // 🔧 Delete Request
  const deleteRequest = async (id: string) => {
    try {
      setLoadingId(id);
      await deleteDoc(doc(db, "requests", id));
    } catch (error) {
      console.log("Delete Error:", error);
    } finally {
      setLoadingId(null);
    }
  };

  // 🔧 Update Status
  const updateStatus = async (id: string) => {
    try {
      setLoadingId(id);
      await updateDoc(doc(db, "requests", id), { status: "accepted" });
    } catch (error) {
      console.log("Update Error:", error);
    } finally {
      setLoadingId(null);
    }
  };

  // ✅ Logout
  const handleLogout = async () => {
    try {
      await setDoc(doc(db, "users", user.uid), {
  uid: user.uid,
  email: user.email,
  role: role,
  createdAt: serverTimestamp(),
});


  // 🔓 Filtering
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const acceptedRequests = requests.filter((r) => r.status === "accepted");

  // ✅ SAFE FIX: Avoid infinite loading
  if (user === null) {
  return <p>Loading...</p>; // waiting for auth
}

if (user && !role) {
  return <p>No profile found ⚠️ Please re-register</p>;
}


  if (!role) {
    return (
      <div style={styles.container}>
        <p>No profile found ⚠️ Please re-register</p>
      </div>
    );
  }
  return (
    <ProtectedRoute>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1>
            {role === "creator" ? "📥 Incoming Requests" : "📤 My Promotions"}
          </h1>
          <button
            onClick={handleLogout}
            style={{ ...styles.button, ...styles.dangerBtn }}
          >
            Logout
          </button>
        </div>

        {/* Show Role */}
        <h3>Role: {role || "Not assigned"}</h3>

        {/* Input (only for promoters) */}
        {role === "promoter" && (
          <div style={styles.inputBox}>
            <input
              type="text"
              placeholder="Enter request..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !adding) addRequest();
              }}
              style={styles.input}
            />
            <button
              onClick={addRequest}
              style={{ ...styles.button, ...styles.primaryBtn }}
              disabled={adding}
            >
              {adding ? "Adding..." : "Add"}
            </button>
          </div>
        )}

        {/* Pending */}
        <h2>🟡 Pending ({pendingRequests.length})</h2>
        {pendingRequests.length === 0 ? (
          <p style={{ opacity: 0.6 }}>No pending requests</p>
        ) : (
          pendingRequests.map((req) => (
            <div key={req.id} style={{ ...styles.card, ...styles.pendingCard }}>
              <p>
                <strong>{req.message}</strong>
              </p>
              <p>Status: {req.status}</p>
              <p style={{ fontSize: "12px", opacity: 0.6 }}>
                ID: {req.id.slice(0, 6)}
              </p>
              <p style={{ fontSize: "12px", opacity: 0.6 }}>
                {req.createdAt?.toDate?.().toLocaleString?.() || "Just now"}
              </p>

              {role === "creator" && (
                <button
                  onClick={() => updateStatus(req.id)}
                  style={{ ...styles.button, ...styles.primaryBtn }}
                  disabled={loadingId !== null}
                >
                  {loadingId === req.id ? "Processing..." : "Accept"}
                </button>
              )}

              <button
                onClick={() => deleteRequest(req.id)}
                style={{
                  ...styles.button,
                  ...styles.dangerBtn,
                  marginLeft: "10px",
                }}
                disabled={loadingId !== null}
              >
                {loadingId === req.id ? "Processing..." : "Delete"}
              </button>
            </div>
          ))
        )}

        {/* Accepted */}
        <h2>🟢 Accepted ({acceptedRequests.length})</h2>
        {acceptedRequests.length === 0 ? (
          <p style={{ opacity: 0.6 }}>No accepted requests</p>
        ) : (
          acceptedRequests.map((req) => (
            <div key={req.id} style={{ ...styles.card, ...styles.acceptedCard }}>
              <p>
                <strong>{req.message}</strong>
              </p>
              <p>Status: {req.status}</p>
              <p style={{ fontSize: "12px", opacity: 0.6 }}>
                ID: {req.id.slice(0, 6)}
              </p>
              <p style={{ fontSize: "12px", opacity: 0.6 }}>
                {req.createdAt?.toDate?.().toLocaleString?.() || "Just now"}
              </p>

              <button
                onClick={() => deleteRequest(req.id)}
                style={{ ...styles.button, ...styles.dangerBtn }}
                disabled={loadingId !== null}
              >
                {loadingId === req.id ? "Processing..." : "Delete"}
              </button>
            </div>
          ))
        )}
      </div> {/* ✅ closes styles.container */}
    </ProtectedRoute>
  );
} // ✅ closes RequestsPage component
