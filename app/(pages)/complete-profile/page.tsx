"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const CompleteProfileForm = () => {
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();
    const [supabase] = useState(() => createClient());

    const fetchUserProfile = useCallback(async () => {
        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                setError("Unable to get user information");
                setInitialLoading(false);
                return;
            }

            // Get current phone number from users table
            const { data: userData, error: userDataError } = await supabase
                .from("users")
                .select("contact_number")
                .eq("user_id", user.id)
                .single();

            if (!userDataError && userData) {
                setPhone(userData.contact_number || "");
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError("Failed to load user profile");
        } finally {
            setInitialLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!phone.trim()) {
            setError("Phone number is required");
            setLoading(false);
            return;
        }

        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                setError("Unable to get user information");
                setLoading(false);
                return;
            }

            // Update phone number in users table
            const { error: updateError } = await supabase
                .from("users")
                .update({ contact_number: phone.trim() })
                .eq("user_id", user.id);

            if (updateError) {
                setError("Failed to update phone number");
                setLoading(false);
                return;
            }

            router.push("/user/editor");
        } catch (err) {
            console.error("Unexpected error:", err);
            setError("Unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4">
            <div className="max-w-sm w-full space-y-8">
                {/* Logo */}
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-8">
                        <img 
                            src="/icon.png" 
                            alt="Logo" 
                            className="w-full h-full object-contain"
                        />
                    </div>
                    
                    <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                        Complete your profile
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Add your phone number to get started.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Contact Number
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-700"
                            placeholder="Enter your contact number"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                            </div>
                        ) : (
                            "Continue"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfileForm;