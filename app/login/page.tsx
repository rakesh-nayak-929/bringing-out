"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const router = useRouter();

  const handleLogin = async (e: any) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMsg("Login Successful ✅");

      // 🔥 REDIRECT
      router.push("/requests");

    } catch (error: any) {
      setMsg(error.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Login 🔐</h1>

      <form onSubmit={handleLogin}>
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

        <button>Login</button>
      </form>

      <p>{msg}</p>
    </div>
  );
}