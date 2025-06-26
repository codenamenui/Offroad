"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import SignUpButton from "./signup";
import { signUpWithEmail } from "@/utils/user";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FormInput from "../login/form-input";
import SubmitButton from "@/components/submit-button";

const RegisterPage = () => {
    const [error, setError] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
    const [videoError, setVideoError] = useState<boolean>(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const router = useRouter();

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            const handleLoadedData = () => {
                setVideoLoaded(true);
                setVideoError(false);
            };

            const handleError = () => {
                setVideoError(true);
            };

            const handleCanPlay = async () => {
                try {
                    await video.play();
                } catch (error) {
                    console.error("Video play failed:", error);
                }
            };

            video.addEventListener("loadeddata", handleLoadedData);
            video.addEventListener("error", handleError);
            video.addEventListener("canplaythrough", handleCanPlay);

            return () => {
                video.removeEventListener("loadeddata", handleLoadedData);
                video.removeEventListener("error", handleError);
                video.removeEventListener("canplaythrough", handleCanPlay);
            };
        }
    }, []);

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
                router.push("/user/editor");
            }
        } catch (err) {
            console.error("Signup error:", err);
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const formFields = [
        {
            id: "name",
            name: "name",
            type: "text",
            placeholder: "Enter your full name",
            label: "Full Name",
        },
        {
            id: "contact",
            name: "contact",
            type: "tel",
            placeholder: "Enter your contact number",
            label: "Contact Number",
        },
        {
            id: "email",
            name: "email",
            type: "email",
            placeholder: "Enter your email",
            label: "Email",
        },
        {
            id: "password",
            name: "password",
            type: "password",
            placeholder: "••••••••",
            label: "Password",
        },
        {
            id: "confirm",
            name: "confirm",
            type: "password",
            placeholder: "••••••••",
            label: "Confirm Password",
        },
    ];

    return (
        <div className="relative min-h-screen overflow-hidden flex items-center justify-center py-4 px-4 font-inter">
            <div className="absolute inset-0 z-0">
                <video
                    ref={videoRef}
                    muted
                    playsInline
                    autoPlay
                    loop
                    preload="auto"
                    className="w-full h-full object-cover"
                >
                    <source src="/video.mp4" type="video/mp4" />
                </video>

                <div
                    className={`absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 transition-opacity duration-1000 ${
                        videoLoaded && !videoError ? "opacity-0" : "opacity-100"
                    }`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-transparent to-amber-900/20 animate-pulse"></div>
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400 rounded-full animate-ping animation-delay-1000"></div>
                        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-amber-300 rounded-full animate-ping animation-delay-2000"></div>
                        <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping animation-delay-3000"></div>
                    </div>
                </div>

                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl">
                            <Image
                                src="/icon.png"
                                alt="Putik Offroaders"
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                        Create an account
                    </h2>
                    <p className="mt-2 text-sm text-white/90 drop-shadow">
                        Start your journey with Putik Offroaders.
                    </p>
                </div>

                <div className="bg-white/95 backdrop-blur-sm py-6 px-6 shadow-2xl rounded-lg border border-white/20">
                    {error && (
                        <div className="bg-red-50/95 backdrop-blur-sm border border-red-200/50 text-red-700 px-3 py-2 rounded-md text-sm mb-4">
                            Error: {error}
                        </div>
                    )}

                    {message && (
                        <div className="bg-green-50/95 backdrop-blur-sm border border-green-200/50 text-green-700 px-3 py-2 rounded-md text-sm mb-4">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {formFields.map((field) => (
                            <FormInput
                                key={field.id}
                                {...field}
                                disabled={loading}
                            />
                        ))}

                        <SubmitButton
                            id={"button"}
                            type={"submit"}
                            name={"button"}
                            disabled={loading}
                            content={"Get started"}
                            loading={"Creating account..."}
                        />

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white/95 text-gray-500">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <SignUpButton />
                        </div>

                        <div className="text-center mt-4">
                            <span className="text-sm text-gray-600">
                                Already have an account?{" "}
                                <Link
                                    href="/login"
                                    className="font-medium text-amber-600 hover:text-amber-500 transition-colors"
                                >
                                    Log in
                                </Link>
                            </span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
