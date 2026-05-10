"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { getBaseUrl } from "@/services/api/client";
import { HandButton } from "@/components/hand-drawn/button";
import {
  HandCard,
  HandCardContent,
  HandCardDescription,
  HandCardHeader,
  HandCardTitle,
} from "@/components/hand-drawn/card";
import { HandInput } from "@/components/hand-drawn/input";
import { HandLabel } from "@/components/hand-drawn/label";
import { toast } from "sonner";

export function UpdatePasswordForm({ className, ...props }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${getBaseUrl()}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password }),
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update password");
      toast.success("Credentials updated successfully");
      router.push("/auth/login");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 rotate-1", className)} {...props}>
      <HandCard decoration="tape">
        <HandCardHeader>
          <HandCardTitle className="text-4xl">Reset Access</HandCardTitle>
          <HandCardDescription>
            Provision your new secure password below.
          </HandCardDescription>
        </HandCardHeader>
        <HandCardContent>
          <form onSubmit={handleUpdatePassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <HandLabel htmlFor="password">New Password</HandLabel>
                <HandInput
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className={error ? "border-hand-red" : ""}
                />
              </div>

              {error && (
                <p className="text-lg font-patrick text-hand-red bg-hand-red/10 border-2 border-hand-red border-dashed p-3 rounded-wobbly">
                  {error}
                </p>
              )}

              <HandButton
                type="submit"
                className="w-full mt-2 rotate-1"
                disabled={isLoading}
              >
                {isLoading ? "Saving State..." : "Commit New Password"}
              </HandButton>
            </div>
          </form>
        </HandCardContent>
      </HandCard>
    </div>
  );
}
