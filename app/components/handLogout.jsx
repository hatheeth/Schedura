"use client";

import { useRouter } from "next/navigation";

export const useHandleLogout = () => {
  const router = useRouter();

  const handleLogout = async () => {
    const session = JSON.parse(localStorage.getItem("supabaseSession") || "{}");
    const accessToken = session?.access_token;

    await fetch("https://schedura-su4v.onrender.com/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken }),
    });

    localStorage.removeItem("supabaseSession");
    router.push("/");
  };

  return handleLogout;
};
