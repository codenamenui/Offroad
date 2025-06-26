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
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const router = useRouter();

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let playAttempts = 0;
        const maxAttempts = 5;
        let userInteractionCleanup: (() => void) | null = null;

        const attemptPlay = async () => {
            try {
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    await playPromise;
                    setIsPlaying(true);
                    console.log('Video autoplay successful');
                }
            } catch (error) {
                console.log(`Play attempt ${playAttempts + 1} failed:`, error);
                playAttempts++;
                
                if (playAttempts < maxAttempts) {
                    // Retry with exponential backoff
                    setTimeout(attemptPlay, 100 * Math.pow(2, playAttempts - 1));
                } else {
                    console.log('Max play attempts reached, setting up user interaction listeners');
                    userInteractionCleanup = setupUserInteractionListeners();
                }
            }
        };

        const setupUserInteractionListeners = () => {
            const handleUserInteraction = async (event: Event) => {
                console.log('User interaction detected:', event.type);
                try {
                    await video.play();
                    setIsPlaying(true);
                    removeListeners();
                } catch (e) {
                    console.log("User interaction play failed:", e);
                }
            };

            const events = ['click', 'touchstart', 'keydown', 'scroll', 'mousemove'];
            const options = { once: true, passive: true };
            
            events.forEach(event => {
                document.addEventListener(event, handleUserInteraction, options);
            });

            const removeListeners = () => {
                events.forEach(event => {
                    document.removeEventListener(event, handleUserInteraction);
                });
            };

            return removeListeners;
        };

        const handleLoadedData = () => {
            console.log('Video data loaded');
            setVideoLoaded(true);
            setVideoError(false);
            // Reset play attempts for new load
            playAttempts = 0;
            attemptPlay();
        };

        const handleCanPlay = () => {
            console.log('Video can play');
            if (!isPlaying && playAttempts === 0) {
                attemptPlay();
            }
        };

        const handleLoadedMetadata = () => {
            console.log('Video metadata loaded');
            // Additional play attempt
            if (!isPlaying) {
                attemptPlay();
            }
        };

        const handleError = (e) => {
            console.error('Video error:', e);
            setVideoError(true);
        };

        const handlePlay = () => {
            setIsPlaying(true);
        };

        const handlePause = () => {
            setIsPlaying(false);
        };

        // Set up event listeners
        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('canplaythrough', handleCanPlay);
        video.addEventListener('error', handleError);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        // Check if video is already ready
        if (video.readyState >= 2) { // HAVE_CURRENT_DATA or higher
            handleLoadedData();
        }

        // Cleanup function
        return () => {
            if (userInteractionCleanup) {
                userInteractionCleanup();
            }
            video.removeEventListener('loadeddata', handleLoadedData);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('canplaythrough', handleCanPlay);
            video.removeEventListener('error', handleError);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
        };
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
        <div className="relative h-screen overflow-hidden flex flex-col items-center justify-center px-4 py-2 font-inter">
            <div className="absolute inset-0 z-0">
                <video
                    ref={videoRef}
                    muted
                    playsInline
                    loop
                    preload="metadata"
                    className="w-full h-full object-cover"
                    style={{ 
                        // Ensure video is visible to help with autoplay
                        opacity: videoLoaded && !videoError ? 1 : 0,
                        transition: 'opacity 1s ease-in-out'
                    }}
                >
                    <source src="/video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                {/* Fallback background with loading indicator */}
                <div
                    className={`absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 transition-opacity duration-1000 ${
                        videoLoaded && !videoError && isPlaying ? "opacity-0" : "opacity-100"
                    }`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-transparent to-amber-900/20 animate-pulse"></div>
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400 rounded-full animate-ping animation-delay-1000"></div>
                        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-amber-300 rounded-full animate-ping animation-delay-2000"></div>
                        <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping animation-delay-3000"></div>
                    </div>
                    
                    {/* Loading indicator */}
                    {!videoLoaded && !videoError && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-white/70 text-sm">Loading...</div>
                        </div>
                    )}
                </div>

                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30"></div>
            </div>

            {/* Header Section - Fixed at top */}
            <div className="relative z-10 flex-shrink-0 text-center mb-3">
                <div className="flex justify-center mb-2">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl">
                        <Image
                            src="/icon.png"
                            alt="Putik Offroaders"
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
                <h2 className="text-xl font-bold text-white drop-shadow-lg">
                    Create an account
                </h2>
                <p className="mt-1 text-xs text-white/90 drop-shadow">
                    Start your journey with Putik Offroaders.
                </p>
            </div>

            {/* Form Section - Compact layout */}
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white/95 backdrop-blur-sm py-4 px-4 shadow-2xl rounded-lg border border-white/20">
                    {error && (
                        <div className="bg-red-50/95 backdrop-blur-sm border border-red-200/50 text-red-700 px-3 py-2 rounded-md text-xs mb-2 flex-shrink-0">
                            Error: {error}
                        </div>
                    )}

                    {message && (
                        <div className="bg-green-50/95 backdrop-blur-sm border border-green-200/50 text-green-700 px-3 py-2 rounded-md text-xs mb-2 flex-shrink-0">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col h-full">
                        <div className="space-y-3">
                            {formFields.map((field) => (
                                <FormInput
                                    key={field.id}
                                    {...field}
                                    disabled={loading}
                                />
                            ))}
                        </div>

                        <div className="mt-4">
                            <SubmitButton
                                id={"button"}
                                type={"submit"}
                                name={"button"}
                                disabled={loading}
                                content={"Get started"}
                                loading={"Creating account..."}
                            />
                        </div>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-2 bg-white/95 text-gray-500">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <SignUpButton />
                        </div>

                        <div className="text-center">
                            <span className="text-xs text-gray-600">
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