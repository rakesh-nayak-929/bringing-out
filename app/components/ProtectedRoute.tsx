"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }: any) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login"); // ❌ Not logged in
      } else {
        setLoading(false); // ✅ Logged in
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return <p>Checking authentication...</p>;

  return children;
}