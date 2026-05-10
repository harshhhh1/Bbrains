"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoutButton } from "@/components/shell/logout-button";

export default function ProtectedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/auth/login");
    } else {
      setAuthenticated(true);
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return null;
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="flex h-svh w-full items-center justify-center gap-2">
      <p>Hello, you are authenticated!</p>
      <LogoutButton />
    </div>
  );
}
