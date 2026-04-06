"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDocs 
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function ProfilePage() {
  const router = useRouter();
  
  // --- STATES ---
  const [profile, setProfile] = useState<any>({
    name: "",
    niche: "",
    platform: "",
    followers: "",
    bio: ""
  });
  const [stats, setStats] = useState({ total: 0, accepted: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true); // 🛡️ Access Guard State

  // --- STRICT ROLE PROTECTION ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // 1. Not logged in? Go to login
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        // 2. Fetch role from Firestore
        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const snapshot = await getDocs(q);
        
        let userRole = "";
        snapshot.forEach((doc) => {
          userRole = doc.data().role;
        });

        // 3. 🚫 BLOCK PROMOTERS (Redirect to Dashboard)
        if (userRole === "promoter") {
          router.push("/requests");
          return;
        }

        // 4. ✅ If Creator, let them in
        setChecking(false);
      } catch (error) {
        console.error("Role check error:", error);
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // --- DATA FETCHING (Only for Creators) ---
  useEffect(() => {
    if (checking) return;

    const user = auth.currentUser;
    if (!user) return;

    // Real-time Profile Listener
    const qUser = query(collection(db, "users"), where("uid", "==", user.uid));
    const unsubUser = onSnapshot(qUser, (snapshot) => {
      snapshot.forEach((doc) => {
        setProfile({ ...doc.data(), id: doc.id });
      });
    });

    // Stats Listener
    const qStats = query(collection(db, "requests"), where("creatorId", "==", user.uid));
    const unsubStats = onSnapshot(qStats, (snapshot) => {
      let total = 0;
      let accepted = 0;
      snapshot.forEach((doc) => {
        total++;
        if (doc.data().status === "accepted") accepted++;
      });
      setStats({ total, accepted });
    });

    return () => { unsubUser(); unsubStats(); };
  }, [checking]);

  // --- SAVE LOGIC ---
  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setLoading(true);

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        ...profile,
        uid: user.uid,
        email: user.email,
        updatedAt: new Date()
      }, { merge: true });
      
      setIsEditing(false);
      alert("Profile updated! ✨");
    } catch (error) {
      console.error(error);
      alert("Error saving profile.");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---
  
  // Show nothing or a loader while checking the role
  if (checking) {
    return (
      <div style={styles.loaderContainer}>
        <p>Checking access permissions...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={{ margin: 0 }}>{isEditing ? "Edit Profile" : "Creator Profile"}</h2>
            <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              style={styles.actionBtn}
            >
              {loading ? "..." : isEditing ? "Save" : "Edit"}
            </button>
          </div>

          <hr style={styles.divider} />

          {isEditing ? (
            <div style={styles.form}>
              <label style={styles.label}>Full Name</label>
              <input 
                style={styles.input}
                value={profile.name || ""} 
                onChange={(e) => setProfile({...profile, name: e.target.value})} 
              />

              <label style={styles.label}>Niche</label>
              <input 
                style={styles.input}
                value={profile.niche || ""} 
                onChange={(e) => setProfile({...profile, niche: e.target.value})} 
              />

              <label style={styles.label}>Bio</label>
              <textarea 
                style={styles.textarea}
                rows={3}
                value={profile.bio || ""} 
                onChange={(e) => setProfile({...profile, bio: e.target.value})} 
              />
              
              <button onClick={() => setIsEditing(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          ) : (
            <div style={styles.viewMode}>
               <div style={styles.infoGroup}>
                  <p><strong>👤 Name:</strong> {profile.name || "Not set"}</p>
                  <p><strong>📧 Email:</strong> {profile.email}</p>
                  <p><strong>🎯 Niche:</strong> {profile.niche || "Not set"}</p>
                  <p><strong>📱 Platform:</strong> {profile.platform || "Not set"}</p>
                  <p><strong>📝 Bio:</strong> {profile.bio || "No bio added yet."}</p>
               </div>

              <div style={styles.statsBox}>
                <h4 style={{ margin: "0 0 10px 0" }}>📊 Performance Stats</h4>
                <div style={{ display: "flex", justifyContent: "space-around" }}>
                  <div>
                    <div style={styles.statNum}>{stats.total}</div>
                    <div style={styles.statLabel}>Deals</div>
                  </div>
                  <div>
                    <div style={{...styles.statNum, color: "#10b981"}}>{stats.accepted}</div>
                    <div style={styles.statLabel}>Accepted</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

// --- STYLES ---
const styles = {
  loaderContainer: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", color: "#64748b" },
  container: { padding: "40px 20px", minHeight: "100vh", backgroundColor: "#f8fafc" },
  card: { maxWidth: "500px", margin: "auto", padding: "30px", borderRadius: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", background: "white", color: "#1e293b" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  divider: { margin: "20px 0", opacity: 0.1 },
  label: { fontSize: "13px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "5px" },
  input: { width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "8px", border: "1px solid #e2e8f0", outline: "none" },
  textarea: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", outline: "none", resize: "none" as const },
  actionBtn: { padding: "8px 20px", borderRadius: "8px", border: "none", background: "#4f46e5", color: "white", fontWeight: "700", cursor: "pointer" },
  cancelBtn: { background: "none", border: "none", color: "#ef4444", cursor: "pointer", marginTop: "15px", fontSize: "13px" },
  viewMode: { lineHeight: "1.8" },
  infoGroup: { display: "flex", flexDirection: "column" as const, gap: "8px" },
  statsBox: { marginTop: "30px", padding: "20px", borderRadius: "12px", background: "#f1f5f9", textAlign: "center" as const },
  statNum: { fontSize: "22px", fontWeight: "800" },
  statLabel: { fontSize: "11px", opacity: 0.6, textTransform: "uppercase" as const }
};