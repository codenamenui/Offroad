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
        console.log(error);
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

    return { user: data.user, session: data.session };
}

export async function signUpWithEmail(email: string, password: string) {
    const supabase = await createClient();
    const origin = (await headers()).get("origin");

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/api/auth/callback`,
        },
    });

    if (error) {
        console.log("Error signing up:", error.message);
        return { error: error.message };
    }

    // Check if email confirmation is required
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
