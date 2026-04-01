"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

export default function CreatorsPage() {
  const [creators, setCreators] = useState<any[]>([]);

  useEffect(() => {
    const fetchCreators = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));

      const creatorsList: any[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        if (data.role === "creator") {
          creatorsList.push({
            id: doc.id,
            ...data,
          });
        }
      });

      setCreators(creatorsList);
    };

    fetchCreators();
  }, []);

  // 🔥 SEND REQUEST FUNCTION
  const sendRequest = async (creatorId: string) => {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Please login first");
        return;
      }

      await addDoc(collection(db, "requests"), {
        creatorId: creatorId,
        promoterId: user.uid,
        status: "pending",
      });

      alert("Request Sent ✅");

    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Creators List 🎨</h1>

      {creators.length === 0 ? (
        <p>No creators found</p>
      ) : (
        creators.map((creator) => (
          <div
            key={creator.id}
            style={{
              border: "1px solid black",
              padding: "10px",
              marginTop: "10px"
            }}
          >
            <p><strong>Email:</strong> {creator.email}</p>
            <p><strong>Name:</strong> {creator.name || "N/A"}</p>
            <p><strong>Niche:</strong> {creator.niche || "N/A"}</p>
            <p><strong>Followers:</strong> {creator.followers || "N/A"}</p>

            {/* 🔥 BUTTON */}
            <button
              onClick={() => sendRequest(creator.id)}
              style={{
                marginTop: "10px",
                padding: "5px",
                background: "green",
                color: "white"
              }}
            >
              Send Request
            </button>
          </div>
        ))
      )}
    </div>
  );
}