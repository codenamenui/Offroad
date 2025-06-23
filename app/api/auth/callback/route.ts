import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    console.log("DWADWADWAD");
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const error = requestUrl.searchParams.get("error");
    const error_description = requestUrl.searchParams.get("error_description");
    const origin = requestUrl.origin;

    // Handle OAuth errors
    if (error) {
        console.error("OAuth error:", error, error_description);
        const errorParam = encodeURIComponent(error_description || error);
        return NextResponse.redirect(`${origin}/login?error=${errorParam}`);
    }

    if (code) {
        try {
            const supabase = await createClient();

            // Exchange the code for a session
            const { data, error: exchangeError } =
                await supabase.auth.exchangeCodeForSession(code);

            if (exchangeError) {
                console.error(
                    "Error exchanging code for session:",
                    exchangeError.message
                );
                return NextResponse.redirect(
                    `${origin}/login?error=auth_callback_error`
                );
            }

            if (!data.session || !data.user) {
                console.error("No session or user after code exchange");
                return NextResponse.redirect(
                    `${origin}/login?error=no_session`
                );
            }

            // Log session details for debugging
            console.log("Session created successfully:", {
                userId: data.user.id,
                email: data.user.email,
                sessionExpires: data.session.expires_at,
            });

            // Create response with redirect
            const response = NextResponse.redirect(`${origin}/dashboard`);

            // Ensure cookies are set properly (this might be redundant but ensures session persistence)
            const sessionCookie = await supabase.auth.getSession();
            if (sessionCookie.data.session?.access_token) {
                // The session should already be set by exchangeCodeForSession,
                // but we're ensuring it's persisted
                response.cookies.set({
                    name: "sb-access-token",
                    value: sessionCookie.data.session.access_token,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 60 * 60 * 24 * 7, // 7 days
                });
            }

            // Check if user has phone number in metadata
            const hasPhone =
                data.user.user_metadata?.phone ||
                data.user.user_metadata?.phone_number ||
                data.user.user_metadata?.contact_number;

            // Check if this is an OAuth user without phone
            const isOAuthUser = data.user.app_metadata?.provider !== "email";

            if (isOAuthUser && !hasPhone) {
                console.log(
                    "OAuth user without phone, redirecting to phone collection"
                );
                return NextResponse.redirect(`${origin}/complete-profile`);
            }

            // Check if this is a new email user (first time signing in)
            const isNewUser =
                data.user.created_at === data.user.last_sign_in_at;

            if (isNewUser && !isOAuthUser) {
                console.log(
                    "New email user detected, redirecting to onboarding"
                );
                return NextResponse.redirect(`${origin}/onboarding`);
            }

            // Existing user with complete profile - redirect to dashboard
            return response;
        } catch (err) {
            console.error("Unexpected error in auth callback:", err);
            return NextResponse.redirect(
                `${origin}/login?error=unexpected_error`
            );
        }
    }

    // If no code is present, redirect to login
    console.log("No code parameter found in callback");
    return NextResponse.redirect(`${origin}/login?error=no_code`);
}
