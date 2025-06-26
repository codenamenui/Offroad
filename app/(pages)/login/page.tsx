"use client";

import React, { useState, useEffect, useRef } from "react";
import SignInButton from "./SignInButton";
import Link from "next/link";
import { signInWithEmail } from "@/utils/user";
import { useRouter } from "next/navigation";
import FormInput from "./form-input";
import SubmitButton from "../../../components/submit-button";
import { createClient } from "@/utils/supabase/client";

const LoginPage = () => {
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
    const [videoError, setVideoError] = useState<boolean>(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const router = useRouter();

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            const handleUserInteraction = () => {
                video
                    .play()
                    .catch((e) => console.log("Play attempt failed:", e));
                document.removeEventListener("click", handleUserInteraction);
                document.removeEventListener(
                    "touchstart",
                    handleUserInteraction
                );
            };

            document.addEventListener("click", handleUserInteraction);
            document.addEventListener("touchstart", handleUserInteraction);

            const handleLoadedData = () => {
                setVideoLoaded(true);
                setVideoError(false);
                // Try to play after load
                video.play().catch((e) => console.log("Autoplay failed:", e));
            };

            const handleError = () => {
                setVideoError(true);
            };

            video.addEventListener("loadeddata", handleLoadedData);
            video.addEventListener("error", handleError);

            return () => {
                document.removeEventListener("click", handleUserInteraction);
                document.removeEventListener(
                    "touchstart",
                    handleUserInteraction
                );
                video.removeEventListener("loadeddata", handleLoadedData);
                video.removeEventListener("error", handleError);
            };
        }
    }, []);

    const handleSubmit = async (e) => {
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
            const supabase = await createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();
            console.log(user);
            if (user == null) {
                setError(result.error);
                return;
            }
            const { data } = await supabase
                .from("user_profiles")
                .select("role")
                .eq("id", user?.id)
                .single();
            if (result.error) {
                setError(result.error);
            } else if (data.role == "user") {
                router.push("/user/editor");
            } else if (data.role == "admin") {
                router.push("/admin/dashboard");
            } else {
                router.push("/mechanic/bookings");
            }
        } catch (err) {
            setError("Login error:" + err);
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative h-screen overflow-hidden flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-inter">
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

            <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl">
                        <img
                            src="/icon.png"
                            alt="Putik Offroaders Logo"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white drop-shadow-lg">
                    Log in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-white/90 drop-shadow">
                    Welcome to Putik Offroaders!
                </p>
                <p className="text-center text-sm text-white/90 drop-shadow">
                    Please enter your details.
                </p>
            </div>

            <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/95 backdrop-blur-sm py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10 border border-white/20">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <FormInput
                            id={"email"}
                            name={"email"}
                            type={"email"}
                            placeholder={"Enter your email"}
                            disabled={loading}
                            label={"Email"}
                        />

                        <FormInput
                            id={"password"}
                            name={"password"}
                            type={"password"}
                            placeholder={"••••••••"}
                            disabled={loading}
                            label={"Password"}
                        />

                        {error && (
                            <div className="rounded-md bg-red-50/95 backdrop-blur-sm p-4 border border-red-200/50">
                                <div className="text-sm text-red-700">
                                    Error: {error}
                                </div>
                            </div>
                        )}

                        <SubmitButton
                            id={"button"}
                            type={"submit"}
                            name={"button"}
                            disabled={loading}
                            content={"Sign in"}
                            loading={"Signing in..."}
                        />

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white/95 text-gray-500">
                                        Or continue with
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <SignInButton />
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="text-center text-sm">
                            <span className="text-gray-600">
                                Don&apos;t have an account?{" "}
                            </span>
                            <Link
                                href="/register"
                                className="font-medium text-amber-600 hover:text-amber-500 transition-colors"
                            >
                                Register
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
