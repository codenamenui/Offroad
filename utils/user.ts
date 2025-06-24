"use server";

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getUser() {
    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) {
        console.log("Error fetching user:", error.message);
        return null;
    }

    return user;
}

export async function getUserProfile() {
    const supabase = await createClient();
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        console.log("Error fetching user:", userError?.message);
        return null;
    }

    const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (profileError) {
        console.log("Error fetching user profile:", profileError.message);
        return null;
    }

    return { user, profile };
}

export async function signInUserOAuth() {
    const supabase = await createClient();
    const origin = (await headers()).get("origin");
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${origin}/api/auth/callback`,
        },
    });

    if (error) {
        console.log("Error signing in with OAuth:", error.message);
    } else {
        return redirect(data.url);
    }
}

export async function signInWithEmail(email: string, password: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.log("Error signing in:", error.message);
        return { error: error.message };
    }

    // Get user profile to determine role
    const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

    if (profileError) {
        console.log("Error fetching user profile:", profileError.message);
        return { error: "Failed to fetch user profile" };
    }

    return {
        user: data.user,
        session: data.session,
        role: profile.role,
    };
}

export async function signUpWithEmail(
    email: string,
    password: string,
    displayName?: string,
    phone?: string,
    role: "user" | "mechanic" | "admin" = "user"
) {
    const supabase = await createClient();
    const origin = (await headers()).get("origin");

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/api/auth/callback`,
            data: {
                display_name: displayName,
                phone: phone,
                full_name: displayName,
                phone_number: phone,
                contact_number: phone,
                role: role, // This will be used by the trigger
            },
        },
    });

    if (error) {
        console.log("Error signing up:", error.message);
        return { error: error.message };
    }

    if (data.user && !data.session) {
        return {
            user: data.user,
            message: "Check your email for confirmation link",
        };
    }

    return { user: data.user, session: data.session };
}

export async function signUpMechanic(
    email: string,
    password: string,
    displayName: string,
    phone?: string,
    profileImage?: File
) {
    const supabase = await createClient();
    const origin = (await headers()).get("origin");

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/api/auth/callback`,
            data: {
                display_name: displayName,
                phone: phone,
                full_name: displayName,
                phone_number: phone,
                contact_number: phone,
                role: "mechanic",
            },
        },
    });

    if (error) {
        console.log("Error signing up mechanic:", error.message);
        return { error: error.message };
    }

    if (data.user) {
        let imageUrl = null;

        if (profileImage && profileImage.size > 0) {
            try {
                const fileExt = profileImage.name.split(".").pop();
                const fileName = `${data.user.id}-${Date.now()}.${fileExt}`;

                const { data: uploadData, error: uploadError } =
                    await supabase.storage
                        .from("mechanic-profiles")
                        .upload(fileName, profileImage);

                if (uploadError) {
                    console.log(
                        "Error uploading profile image:",
                        uploadError.message
                    );
                } else {
                    const { data: publicUrlData } = supabase.storage
                        .from("mechanic-profiles")
                        .getPublicUrl(fileName);
                    imageUrl = publicUrlData.publicUrl;
                }
            } catch (uploadErr) {
                console.log("Error processing profile image:", uploadErr);
            }
        }

        const { error: mechanicError } = await supabase
            .from("mechanics")
            .insert({
                profile_id: data.user.id,
                name: displayName,
                email: email,
                url: imageUrl,
            });

        if (mechanicError) {
            console.log(
                "Error creating mechanic record:",
                mechanicError.message
            );
            return { error: "Failed to create mechanic profile" };
        }
    }

    if (data.user && !data.session) {
        return {
            user: data.user,
            message: "Check your email for confirmation link",
        };
    }

    return { user: data.user, session: data.session };
}

export async function signUpMechanicWithOAuth() {
    const supabase = await createClient();
    const origin = (await headers()).get("origin");

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${origin}/api/auth/callback`,
            queryParams: {
                access_type: "offline",
                prompt: "consent",
            },
            // Add mechanic-specific metadata if needed
        },
    });

    if (error) {
        console.log("Error signing up mechanic with OAuth:", error.message);
        throw error;
    }

    return redirect(data.url);
}

export async function signUpWithEmailAndUpdatePhone(
    email: string,
    password: string,
    displayName?: string,
    phone?: string,
    role: "user" | "mechanic" | "admin" = "user"
) {
    const supabase = await createClient();
    const origin = (await headers()).get("origin");

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/api/auth/callback`,
            data: {
                display_name: displayName,
                phone: phone,
                full_name: displayName,
                phone_number: phone,
                contact_number: phone,
                role: role,
            },
        },
    });

    if (error) {
        console.log("Error signing up:", error.message);
        return { error: error.message };
    }

    if (data.session && phone) {
        try {
            const { error: updateError } = await supabase.auth.updateUser({
                phone: phone,
            });

            if (updateError) {
                console.log("Error updating phone:", updateError.message);
            }
        } catch (updateErr) {
            console.log("Error updating phone:", updateErr);
        }
    }

    if (data.user && !data.session) {
        return {
            user: data.user,
            message: "Check your email for confirmation link",
        };
    }

    return { user: data.user, session: data.session };
}

export async function signUpWithEmailAndMetadata(
    email: string,
    password: string,
    displayName: string,
    phone: string,
    role: "user" | "mechanic" | "admin" = "user"
) {
    const supabase = await createClient();
    const origin = (await headers()).get("origin");

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/api/auth/callback`,
            data: {
                display_name: displayName,
                phone: phone,
                full_name: displayName,
                role: role,
            },
        },
    });

    if (error) {
        console.log("Error signing up:", error.message);
        return { error: error.message };
    }

    if (data.user && !data.session) {
        return {
            user: data.user,
            message: "Check your email for confirmation link",
        };
    }

    return { user: data.user, session: data.session };
}

export async function resetPassword(email: string) {
    const supabase = await createClient();
    const origin = (await headers()).get("origin");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset-password`,
    });

    if (error) {
        console.log("Error sending reset email:", error.message);
        return { error: error.message };
    }

    return { message: "Password reset email sent" };
}

export async function updatePassword(newPassword: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
    });

    if (error) {
        console.log("Error updating password:", error.message);
        return { error: error.message };
    }

    return { user: data.user };
}

export async function signOutUser() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.log("Error signing out:", error.message);
        return { error: error.message };
    }

    return { message: "Signed out successfully" };
}

export async function updateUserMetadata(displayName?: string, phone?: string) {
    const supabase = await createClient();

    const updateData: { [key: string]: string | number } = {};

    if (displayName !== undefined) {
        updateData.display_name = displayName;
    }

    if (phone !== undefined) {
        updateData.phone = phone;
    }

    const { data, error } = await supabase.auth.updateUser({
        data: updateData,
    });

    if (error) {
        console.log("Error updating user metadata:", error.message);
        return { error: error.message };
    }

    return { user: data.user };
}

// Helper function to check if user is admin
export async function isAdmin() {
    const userProfile = await getUserProfile();
    return userProfile?.profile?.role === "admin";
}

// Helper function to check if user is mechanic
export async function isMechanic() {
    const userProfile = await getUserProfile();
    return userProfile?.profile?.role === "mechanic";
}

// Helper function to check if user is regular user
export async function isUser() {
    const userProfile = await getUserProfile();
    return userProfile?.profile?.role === "user";
}
