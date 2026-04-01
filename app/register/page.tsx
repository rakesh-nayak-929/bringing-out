"use client"

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [msg, setMsg] = useState("");

  const handleRegister = async (e: any) => {
    e.preventDefault();

    if (!role) {
      alert("Select role");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ FIX: Use setDoc with UID as document ID
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        role: role,
        createdAt: serverTimestamp(),
      });

      setMsg("Registered Successfully ✅");
    } catch (error: any) {
      setMsg(error.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Register 📝</h1>

      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />

        <select onChange={(e) => setRole(e.target.value)}>
          <option value="">Select Role</option>
          <option value="creator">Creator</option>
          <option value="promoter">Promoter</option>
        </select>
        <br /><br />

        <button>Register</button>
      </form>

      <p>{msg}</p>
    </div>
  );
}
