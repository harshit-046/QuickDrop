"use client";
import { useState } from "react";

import { useSignUp } from "@clerk/nextjs";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {AlertCircle, Eye, EyeOff, Lock, Mail,} from "lucide-react";
import { z } from "zod";

import AuthInput from "@/components/AuthInput";
import { getClerkErrorMessage } from "@/lib/clerk-error";
import { signUpSchema } from "@/schema/signUpSchema";

const SignUpForm = () => {
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signUp, isLoaded, setActive } = useSignUp();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  async function onSubmit(data: z.infer<typeof signUpSchema>) {
    if (!isLoaded) {
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setVerifying(true);
    } catch (error) {
      setAuthError(getClerkErrorMessage(error, "Sign up failed. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerificationSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isLoaded || !signUp) {
      return;
    }

    setIsSubmitting(true);
    setVerificationError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
        return;
      }

      setVerificationError("Verification is still incomplete. Please double-check the code and try again.");
    } catch (error) {
      setVerificationError(getClerkErrorMessage(error, "Verification failed. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (verifying) {
    return (
      <Card className="glass-panel w-full max-w-md rounded-[2rem] border-none shadow-none">
        <CardHeader className="flex flex-col items-start gap-2 px-8 pb-4 pt-8">
          <p className="section-title">Almost there</p>
          <h1 className="text-3xl font-semibold">Verify your email</h1>
          <p className="text-sm leading-6 text-muted">Enter the code Clerk sent to your inbox to unlock the dashboard.</p>
        </CardHeader>

        <Divider />

        <CardBody className="space-y-6 px-8 py-7">
          {verificationError ? (
            <div className="flex items-start gap-3 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <p>{verificationError}</p>
            </div>
          ) : null}

          <form onSubmit={handleVerificationSubmit} className="space-y-5">
            <AuthInput
              id="verificationCode"
              type="text"
              label="Verification code"
              placeholder="Enter the code from your email"
              value={verificationCode}
              onChange={(event) => setVerificationCode(event.target.value)}
              autoFocus
            />

            <Button
              type="submit"
              className="h-12 w-full rounded-full bg-[var(--foreground)] text-sm font-medium text-white"
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Verifying" : "Verify email"}
            </Button>
          </form>

          <button
            type="button"
            className="text-sm font-semibold text-[var(--accent)] transition hover:opacity-80"
            onClick={async () => {
              if (!signUp) {
                return;
              }

              await signUp.prepareEmailAddressVerification({
                strategy: "email_code",
              });
            }}
          >
            Resend code
          </button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="glass-panel w-full max-w-md rounded-[2rem] border-none shadow-none">
      <CardHeader className="flex flex-col items-start gap-2 px-8 pb-4 pt-8">
        <p className="section-title">Create account</p>
        <h1 className="text-3xl font-semibold">Start your QuickDrop workspace</h1>
        <p className="text-sm leading-6 text-muted">Sign up with email and password, then verify your inbox to continue.</p>
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
            id="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            startContent={<Mail className="h-4 w-4" />}
            errorMessage={errors.email?.message}
            {...register("email")}
          />

          <AuthInput
            id="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="Choose a strong password"
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

          <AuthInput
            id="passwordConfirmation"
            type={showConfirmPassword ? "text" : "password"}
            label="Confirm password"
            placeholder="Repeat your password"
            startContent={<Lock className="h-4 w-4" />}
            endContent={
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full text-default-500 transition hover:bg-white/70 hover:text-default-800"
                onClick={() => setShowConfirmPassword((value) => !value)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            errorMessage={errors.passwordConfirmation?.message}
            {...register("passwordConfirmation")}
          />

          <Button
            type="submit"
            className="h-12 w-full rounded-full bg-[var(--accent)] text-sm font-medium text-white"
            isLoading={isSubmitting}
          >
            {isSubmitting ? "Creating account" : "Create account"}
          </Button>
        </form>
      </CardBody>

      <Divider />

      <CardFooter className="justify-center px-8 py-5 text-sm text-muted">
        <p>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-[var(--accent)] transition hover:opacity-80">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignUpForm
