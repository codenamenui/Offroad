"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import SignUpButton from "./signup";
import { signUpWithEmail } from "@/utils/user";
import { useRouter } from "next/navigation";
import Link from "next/link";

const RegisterPage = () => {
    const [error, setError] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const contact = formData.get("contact") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirm") as string;

        // Validation
        if (!email || !password) {
            setError("Email and password are required");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            setLoading(false);
            return;
        }

        try {
            // Only pass values if they're not empty strings
            const displayName = name?.trim() || undefined;
            const phoneNumber = contact?.trim() || undefined;

            const result = await signUpWithEmail(
                email,
                password,
                displayName,
                phoneNumber
            );

            if (result.error) {
                setError(result.error);
            } else if (result.message) {
                setMessage(result.message);
            } else {
                // Log successful signup
                router.push("/dashboard");
            }
        } catch (err) {
            console.error("Signup error:", err);
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Image src={null} alt={"no image"}></Image>
            <div>Create an account</div>
            <div>Start your journey with Offroad</div>

            {error && (
                <div style={{ color: "red", marginBottom: "1rem" }}>
                    Error: {error}
                </div>
            )}

            {message && (
                <div style={{ color: "green", marginBottom: "1rem" }}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <label htmlFor="name">Full Name</label>
                <Input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter full name"
                    disabled={loading}
                />

                <label htmlFor="contact">Contact Number</label>
                <Input
                    type="tel"
                    id="contact"
                    name="contact"
                    placeholder="Enter contact number"
                    disabled={loading}
                />

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
                    id="password"
                    name="password"
                    placeholder="********"
                    required
                    disabled={loading}
                />

                <label htmlFor="confirm">Confirm Password</label>
                <Input
                    type="password"
                    id="confirm"
                    name="confirm"
                    placeholder="********"
                    required
                    disabled={loading}
                />

                <Input
                    type="submit"
                    value={loading ? "Creating Account..." : "Get Started"}
                    disabled={loading}
                />
            </form>

            <br />
            <div>or</div>
            <br />
            <SignUpButton />
            <br />
            <div>
                already have an account? <Link href={"/login"}>Log in</Link>
            </div>
        </div>
    );
};

export default RegisterPage;
