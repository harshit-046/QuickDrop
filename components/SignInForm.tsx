"use client";
import { useForm } from "react-hook-form"
import { signInSchema } from "@/schema/signInSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useSignIn } from "@clerk/nextjs";
import React, { useState } from "react"
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import Link from "next/link";
import {
    Mail,
    Lock,
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff,
} from "lucide-react";


const SignInForm = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authError, setAuthError] = useState<string | null>();
    const [showPassword, setShowPassword] = useState(false);

    const { signIn, isLoaded, setActive } = useSignIn();
    const { register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: "",
            password: ""
        }
    })


    async function onSubmit(data: z.infer<typeof signInSchema>) {
        if (!isLoaded) return;
        setIsSubmitting(true);
        setAuthError(null);
        try {
           const result = await signIn.create({
            identifier: data.identifier,
            password: data.password
           })
           if(result.status==='complete'){
                await setActive({session: result.createdSessionId})
                router.push('/dashboard')
           }
           else{
            setAuthError("Sign in failed")
           }

        } catch (error: any) {
            console.error(error);
            setAuthError(error.errors?.[0].message || "Signin failed. Please try again.");
        }
        finally {
            setIsSubmitting(false);
        }
    }

 




    return (
        <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
            <CardHeader className="flex flex-col gap-1 items-center pb-2">
                <h1 className="text-2xl font-bold text-default-900">
                    Sign In
                </h1>
                <p className="text-default-500 text-center">
                    Sign in to start managing your images securely
                </p>
            </CardHeader>

            <Divider />

            <CardBody className="py-6">
                {authError && (
                    <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p>{authError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label
                            htmlFor="identifier"
                            className="text-sm font-medium text-default-900"
                        >
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            startContent={<Mail className="h-4 w-4 text-default-500" />}
                            isInvalid={!!errors.identifier}
                            errorMessage={errors.identifier?.message}
                            {...register("identifier")}
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-default-900"
                        >
                            Password
                        </label>
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            startContent={<Lock className="h-4 w-4 text-default-500" />}
                            endContent={
                                <Button
                                    isIconOnly
                                    variant="light"
                                    size="sm"
                                    onClick={() => setShowPassword(!showPassword)}
                                    type="button"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-default-500" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-default-500" />
                                    )}
                                </Button>
                            }
                            isInvalid={!!errors.password}
                            errorMessage={errors.password?.message}
                            {...register("password")}
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                            <p className="text-sm text-default-600">
                                By signing in, you agree to our Terms of Service and Privacy
                                Policy
                            </p>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        color="primary"
                        className="w-full"
                        isLoading={isSubmitting}
                    >
                        {isSubmitting ? "Sign in..." : "Sign In"}
                    </Button>
                </form>
            </CardBody>

            <Divider />

            <CardFooter className="flex justify-center py-4">
                <p className="text-sm text-default-600">
                    Don't have an account?{" "}
                    <Link
                        href="/sign-up"
                        className="text-primary hover:underline font-medium"
                    >
                        Sign Up
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}

export default SignInForm