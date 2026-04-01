"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [edit, setEdit] = useState(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("");

  // 🔥 Fetch user profile
  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;

      const ref = doc(db, "users", auth.currentUser.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);

        setName(data.name || "");
        setBio(data.bio || "");
        setNiche(data.niche || "");
        setPlatform(data.platform || "");
      }
    };

    fetchData();
  }, []);

  // 🔧 Update Profile
  const handleUpdate = async () => {
    if (!auth.currentUser) return;

    const ref = doc(db, "users", auth.currentUser.uid);

    await updateDoc(ref, {
      name,
      bio,
      niche,
      platform,
    });

    setEdit(false);
    alert("Profile Updated ✅");
  };

  if (!userData) return <p>Loading...</p>;

  return (
    <ProtectedRoute>
      <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
        <h1>👤 Profile</h1>

        {!edit ? (
          <>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Role:</strong> {userData.role}</p>
            <p><strong>Name:</strong> {userData.name || "Not set"}</p>
            <p><strong>Bio:</strong> {userData.bio || "Not set"}</p>
            <p><strong>Niche:</strong> {userData.niche || "Not set"}</p>
            <p><strong>Platform:</strong> {userData.platform || "Not set"}</p>

            <button onClick={() => setEdit(true)}>Edit Profile</button>
          </>
        ) : (
          <>
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} /><br /><br />
            <input placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} /><br /><br />
            <input placeholder="Niche" value={niche} onChange={(e) => setNiche(e.target.value)} /><br /><br />
            <input placeholder="Platform" value={platform} onChange={(e) => setPlatform(e.target.value)} /><br /><br />

            <button onClick={handleUpdate}>Save</button>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}