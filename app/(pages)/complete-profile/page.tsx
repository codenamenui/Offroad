"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const CompleteProfileForm = () => {
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("user");
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const supabase = createClient();

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

            let imageUrl = null;
            if (role === "mechanic" && profileImage) {
                const fileExt = profileImage.name.split(".").pop();
                const fileName = `${user.id}-${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from("mechanic-profiles")
                    .upload(fileName, profileImage);

                if (uploadError) {
                    setError("Failed to upload profile image");
                    setLoading(false);
                    return;
                }

                const { data: publicUrlData } = supabase.storage
                    .from("mechanic-profiles")
                    .getPublicUrl(fileName);

                imageUrl = publicUrlData.publicUrl;
            }

            const updates = {
                contact_number: phone.trim(),
            };

            const { error: updateError } = await supabase
                .from("users")
                .update(updates)
                .eq("user_id", user.id);

            if (updateError) {
                setError("Failed to update phone number");
                setLoading(false);
                return;
            }

            // Insert to user_profiles
            const { error: profileError } = await supabase
                .from("user_profiles")
                .update({
                    role: role,
                })
                .eq("id", user.id);

            if (profileError) {
                setError("Failed to create user profile");
                setLoading(false);
                return;
            }

            // If mechanic, insert to mechanics table
            if (role === "mechanic") {
                const { error: mechanicError } = await supabase
                    .from("mechanics")
                    .update({
                        url: imageUrl,
                    })
                    .eq("profile_id", user.id);

                if (mechanicError) {
                    setError("Failed to create mechanic profile");
                    setLoading(false);
                    return;
                }

                router.push("/mechanic/dashboard");
            } else {
                router.push("/editor");
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError("Unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full space-y-8">
                <h2 className="text-center text-3xl font-bold text-gray-900">
                    Complete Your Profile
                </h2>
                {error && <div className="text-red-500">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Phone Number
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="mt-1 w-full border px-3 py-2 rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Role
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="mt-1 w-full border px-3 py-2 rounded"
                        >
                            <option value="user">User</option>
                            <option value="mechanic">Mechanic</option>
                        </select>
                    </div>
                    {role === "mechanic" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Profile Picture
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="mt-1 w-full"
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        {loading ? "Saving..." : "Continue"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfileForm;
