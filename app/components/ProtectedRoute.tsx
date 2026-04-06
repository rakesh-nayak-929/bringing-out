"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login"); // 🔴 Not logged in
      } else {
        setLoading(false); // ✅ Logged in → stop loading
      }
    });

    return () => unsubscribe();
  }, []);

  // ⏳ While checking auth
  if (loading) return <p>Checking authentication...</p>;

  // ✅ If logged in → show page
  return children;
}