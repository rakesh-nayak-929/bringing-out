"use client";

import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Topbar() {
  const router = useRouter();

  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div style={{
      height: "60px",
      background: "#fff",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      marginLeft: "220px"
    }}>
      <h3>Creator Platform</h3>
      <button onClick={logout}>Logout</button>
    </div>
  );
}