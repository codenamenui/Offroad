"use client";

import React, { useState } from "react";
import SignInButton from "./SignInButton";
import Link from "next/link";
import { signInWithEmail } from "@/utils/user";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
            } else {
                // Success - redirect to dashboard
                router.push("/dashboard");
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Image src={null} alt={"no image"}></Image>
            <div>log in to your account!</div>
            <div>welcome to offroad!</div>

            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email</label>
                <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                />
                <label htmlFor="password">Password</label>
                <Input
                    type="password"
                    name="password"
                    placeholder="********"
                    required
                    disabled={loading}
                />
                <Input
                    type="submit"
                    value={loading ? "Signing In..." : "Sign In"}
                    disabled={loading}
                />
            </form>

            {error && (
                <div style={{ color: "red", marginBottom: "1rem" }}>
                    Error: {error}
                </div>
            )}

            <SignInButton />
            <div>
                Don&apos;t have an account?
                <Link href={"/register"}>Register</Link>
            </div>
        </div>
    );
};

export default LoginPage;
