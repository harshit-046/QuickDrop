"use client";
import { useState } from "react";

import { useSignIn } from "@clerk/nextjs";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";
import { z } from "zod";

import AuthInput from "@/components/AuthInput";
import { getClerkErrorMessage } from "@/lib/clerk-error";
import { signInSchema } from "@/schema/signInSchema";

const SignInForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, isLoaded, setActive } = useSignIn();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof signInSchema>) {
    if (!isLoaded) {
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const result = await signIn.create({
        identifier: data.identifier,
        password: data.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
        return;
      }

      setAuthError("Sign in could not be completed. Please try again.");
    } catch (error) {
      setAuthError(getClerkErrorMessage(error, "Sign in failed. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="glass-panel w-full max-w-md rounded-[2rem] border-none shadow-none">
      <CardHeader className="flex flex-col items-start gap-2 px-8 pb-4 pt-8">
        <p className="section-title">Welcome back</p>
        <h1 className="text-3xl font-semibold">Sign in to QuickDrop</h1>
        <p className="text-sm leading-6 text-muted">Access your folders, starred files, and cloud uploads from one dashboard.</p>
      </CardHeader>

      <Divider />

      <CardBody className="space-y-6 px-8 py-7">
        {authError ? (
          <div className="flex items-start gap-3 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <p>{authError}</p>
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <AuthInput
            id="identifier"
            type="email"
            label="Email"
            placeholder="you@example.com"
            startContent={<Mail className="h-4 w-4" />}
            errorMessage={errors.identifier?.message}
            {...register("identifier")}
          />

          <AuthInput
            id="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="Enter your password"
            startContent={<Lock className="h-4 w-4" />}
            endContent={
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full text-default-500 transition hover:bg-white/70 hover:text-default-800"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            errorMessage={errors.password?.message}
            {...register("password")}
          />

          <Button
            type="submit"
            className="h-12 w-full rounded-full bg-[var(--foreground)] text-sm font-medium text-white"
            isLoading={isSubmitting}
          >
            {isSubmitting ? "Signing in" : "Sign in"}
          </Button>
        </form>
      </CardBody>

      <Divider />

      <CardFooter className="justify-center px-8 py-5 text-sm text-muted">
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-semibold text-[var(--accent)] transition hover:opacity-80">
            Create one
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignInForm
