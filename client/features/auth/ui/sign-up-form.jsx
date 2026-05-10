"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

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
import { validate, hasErrors } from "@/lib/validation";

export function SignUpForm({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== repeatPassword) {
      setErrors({ repeatPassword: "Passwords do not match" });
      return;
    }

    const validationErrors = validate(
      { email, password },
      {
        email: { required: true, email: true },
        password: { required: true, minLength: 6 },
      },
    );

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await fetch(`${getBaseUrl()}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          username: email.split("@")[0],
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed");
      }

      toast.success("Account created! Access granted.");
      router.push("/auth/login");
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ form: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = useCallback((field, value) => {
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    if (field === "repeatPassword") setRepeatPassword(value);
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));
  }, []);

  return (
    <div className={cn("flex flex-col gap-6 rotate-1", className)} {...props}>
      <HandCard decoration="tack">
        <HandCardHeader>
          <HandCardTitle className="text-4xl">Join Protocol</HandCardTitle>
          <HandCardDescription>
            Initialize a new verified agent account.
          </HandCardDescription>
        </HandCardHeader>
        <HandCardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <HandLabel htmlFor="email">Uplink Email</HandLabel>
                <HandInput
                  id="email"
                  type="email"
                  placeholder="agent@bbrains.edu"
                  required
                  value={email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={isLoading}
                  className={errors.email ? "border-hand-red" : ""}
                />

                {errors.email && (
                  <p className="text-sm text-hand-red font-patrick">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <HandLabel htmlFor="password">Secure Password</HandLabel>
                <div className="relative">
                  <HandInput
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    disabled={isLoading}
                    className={
                      errors.password ? "border-hand-red pr-10" : "pr-10"
                    }
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-hand-pencil/60 hover:text-hand-pencil transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-hand-red font-patrick">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <HandLabel htmlFor="repeat-password">
                  Confirm Credentials
                </HandLabel>
                <div className="relative">
                  <HandInput
                    id="repeat-password"
                    type={showRepeatPassword ? "text" : "password"}
                    required
                    value={repeatPassword}
                    onChange={(e) =>
                      handleInputChange("repeatPassword", e.target.value)
                    }
                    disabled={isLoading}
                    className={
                      errors.repeatPassword ? "border-hand-red pr-10" : "pr-10"
                    }
                  />

                  <button
                    type="button"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-hand-pencil/60 hover:text-hand-pencil transition-colors"
                  >
                    {showRepeatPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.repeatPassword && (
                  <p className="text-sm text-hand-red font-patrick">
                    {errors.repeatPassword}
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
                className="w-full mt-2 rotate-1"
                disabled={isLoading}
              >
                {isLoading ? "Synchronizing..." : "Initialize Account"}
              </HandButton>
            </div>

            <div className="mt-8 text-center text-lg font-patrick text-hand-pencil/80">
              Already in the system?{" "}
              <Link
                href="/auth/login"
                className="text-hand-pencil underline underline-offset-4 decoration-2 decoration-wavy hover:text-hand-blue"
              >
                Login Here
              </Link>
            </div>
          </form>
        </HandCardContent>
      </HandCard>
    </div>
  );
}
