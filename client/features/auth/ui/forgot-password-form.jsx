"use client";

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
import Link from "next/link";
import { validate, commonRules, hasErrors } from "@/lib/validation";

export function ForgotPasswordForm({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const validationErrors = validate({ email }, { email: commonRules.email });
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await fetch(`${getBaseUrl()}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to send reset link");
      setSuccess(true);
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 -rotate-1", className)} {...props}>
      <HandCard decoration="tack">
        <HandCardHeader>
          <HandCardTitle className="text-4xl">
            {success ? "Check Link" : "Reset Access"}
          </HandCardTitle>
          <HandCardDescription>
            {success
              ? "Instructions dispatched to your inbox."
              : "Provision your email to retrieve access credentials."}
          </HandCardDescription>
        </HandCardHeader>
        <HandCardContent>
          {success ? (
            <div className="space-y-6">
              <p className="font-patrick text-xl text-hand-pencil/80 leading-relaxed">
                If the provided email is associated with a verified agent
                account, you will receive a cryptographic reset link shortly.
              </p>
              <HandButton asChild className="w-full rotate-1">
                <Link href="/auth/login">Back to Login</Link>
              </HandButton>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <HandLabel htmlFor="email">Recovery Email</HandLabel>
                  <HandInput
                    id="email"
                    type="email"
                    placeholder="agent@bbrains.edu"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className={errors.email ? "border-hand-red" : ""}
                  />

                  {errors.email && (
                    <p className="text-sm text-hand-red font-patrick">
                      {errors.email}
                    </p>
                  )}
                </div>

                {errors.form && (
                  <p className="text-lg font-patrick text-hand-red bg-hand-red/10 border-2 border-hand-red border-dashed p-3 rounded-wobbly">
                    {errors.form}
                  </p>
                )}

                <HandButton
                  type="submit"
                  className="w-full rotate-1"
                  disabled={isLoading}
                >
                  {isLoading ? "Dispatching..." : "Send Reset Link"}
                </HandButton>
              </div>
              <div className="mt-8 text-center text-lg font-patrick text-hand-pencil/80">
                Found your credentials?{" "}
                <Link
                  href="/auth/login"
                  className="text-hand-pencil underline underline-offset-4 decoration-2 decoration-wavy hover:text-hand-blue"
                >
                  Login Here
                </Link>
              </div>
            </form>
          )}
        </HandCardContent>
      </HandCard>
    </div>
  );
}
