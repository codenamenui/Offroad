"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const CompleteProfileForm = () => {
    const [phone, setPhone] = useState("");
    const [currentRole, setCurrentRole] = useState<string | null>(null);
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();
    const [supabase] = useState(() => createClient());

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
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

            // Get user's current role from user_profiles
            const { data: profileData, error: profileError } = await supabase
                .from("user_profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profileError) {
                console.log("Profile fetch error:", profileError);
                // If no profile exists, default to user role
                setCurrentRole("user");
            } else {
                setCurrentRole(profileData.role);
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
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProfileImage(e.target.files[0]);
        }
    };

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

            // Handle mechanic profile image upload and mechanic record creation/update
            if (currentRole === "mechanic") {
                let imageUrl = null;

                // Upload profile image if provided
                if (profileImage && profileImage.size > 0) {
                    try {
                        const fileExt = profileImage.name.split(".").pop();
                        const fileName = `${user.id}-${Date.now()}.${fileExt}`;

                        const { error: uploadError } = await supabase.storage
                            .from("mechanic-profiles")
                            .upload(fileName, profileImage);

                        if (uploadError) {
                            console.log(
                                "Error uploading profile image:",
                                uploadError.message
                            );
                            setError("Failed to upload profile image");
                            setLoading(false);
                            return;
                        }

                        const { data: publicUrlData } = supabase.storage
                            .from("mechanic-profiles")
                            .getPublicUrl(fileName);

                        imageUrl = publicUrlData.publicUrl;
                    } catch (uploadErr) {
                        console.log(
                            "Error processing profile image:",
                            uploadErr
                        );
                        setError("Error processing profile image");
                        setLoading(false);
                        return;
                    }
                }

                // Check if mechanic record already exists
                const { data: existingMechanic, error: checkError } =
                    await supabase
                        .from("mechanics")
                        .select("profile_id")
                        .eq("profile_id", user.id)
                        .single();

                if (checkError && checkError.code !== "PGRST116") {
                    // PGRST116 is "not found" error, which is expected if no record exists
                    setError("Error checking existing mechanic profile");
                    setLoading(false);
                    return;
                }

                if (existingMechanic) {
                    // Update existing mechanic record
                    const updateData: { url?: string } = {};
                    if (imageUrl) {
                        updateData.url = imageUrl;
                    }

                    if (Object.keys(updateData).length > 0) {
                        const { error: mechanicUpdateError } = await supabase
                            .from("mechanics")
                            .update(updateData)
                            .eq("profile_id", user.id);

                        if (mechanicUpdateError) {
                            setError("Failed to update mechanic profile");
                            setLoading(false);
                            return;
                        }
                    }
                } else {
                    // Create new mechanic record
                    const insertData = {
                        profile_id: user.id,
                        name:
                            user.user_metadata?.full_name ||
                            user.email?.split("@")[0] ||
                            "Unknown",
                        email: user.email || "",
                        url: imageUrl,
                    };

                    const { error: mechanicError } = await supabase
                        .from("mechanics")
                        .insert(insertData);

                    if (mechanicError) {
                        console.log(
                            "Error creating mechanic record:",
                            mechanicError.message
                        );
                        setError("Failed to create mechanic profile");
                        setLoading(false);
                        return;
                    }
                }

                router.push("/mechanic/bookings");
            } else {
                router.push("/user/editor");
            }
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
                    {currentRole && (
                        <p className="mt-2 text-sm text-gray-600">
                            Role:{" "}
                            <span className="font-medium capitalize">
                                {currentRole}
                            </span>
                        </p>
                    )}
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

                    {currentRole === "mechanic" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Profile Picture
                            </label>
                            <p className="text-xs text-gray-500 mb-2">
                                Upload a professional photo (optional)
                            </p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                        </div>
                    )}

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
