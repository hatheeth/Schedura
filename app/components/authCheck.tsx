"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("supabaseSession") || "{}");

    if (!session?.access_token) {
        
      router.push("/");
    } else {
      
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Checking authentication…</p>
      </div>
    );
  }

  return <>{children}</>;
}
