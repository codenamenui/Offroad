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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Complete Your Profile
                    </h2>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Phone Number *
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter your phone number"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                            </div>
                        ) : (
                            "Complete Profile"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfileForm;
