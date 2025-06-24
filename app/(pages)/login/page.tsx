"use client";

import React, { useState } from "react";
import SignInButton from "./SignInButton";
import Link from "next/link";
import { signInWithEmail } from "@/utils/user";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

const LoginPage = () => {
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!email || !password) {
            setError("Email and password are required");
            setLoading(false);
            return;
        }

        try {
            const result = await signInWithEmail(email, password);

            if (result.error) {
                setError(result.error);
            } else if (result.role) {
                // Role-based redirection
                switch (result.role) {
                    case "admin":
                        router.push("/admin/dashboard");
                        break;
                    case "mechanic":
                        router.push("/mechanic/dashboard");
                        break;
                    case "user":
                    default:
                        router.push("/user/editor");
                        break;
                }
            } else {
                router.push("/user/editor");
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Log in to your account
                    </h2>
                    <p className="mt-2 text-gray-600">Welcome to OffRoad!</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            required
                            disabled={loading}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <Input
                            type="password"
                            name="password"
                            placeholder="********"
                            required
                            disabled={loading}
                            className="mt-1"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            Error: {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing In..." : "Sign In"}
                        </button>
                    </div>
                </form>

                <div className="space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <SignInButton />

                    <div className="text-center">
                        <span className="text-gray-600">
                            Don&apos;t have an account?{" "}
                        </span>
                        <Link
                            href="/register"
                            className="text-blue-600 hover:text-blue-500 font-medium"
                        >
                            Register
                        </Link>
                    </div>

                    <div className="text-center space-y-2">
                        <div className="text-sm text-gray-500">
                            Different account types:
                        </div>
                        <div className="flex justify-center space-x-4 text-xs text-gray-400">
                            <span>• Customer</span>
                            <span>• Mechanic</span>
                            <span>• Admin</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
