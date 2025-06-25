import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const error = requestUrl.searchParams.get("error");
    const error_description = requestUrl.searchParams.get("error_description");
    const signup_type = requestUrl.searchParams.get("signup_type"); // Get signup type
    const origin = requestUrl.origin;

    if (error) {
        const errorParam = encodeURIComponent(error_description || error);
        return NextResponse.redirect(`${origin}/login?error=${errorParam}`);
    }

    if (code) {
        try {
            const supabase = await createClient();
            const { data, error: exchangeError } =
                await supabase.auth.exchangeCodeForSession(code);

            if (exchangeError) {
                return NextResponse.redirect(
                    `${origin}/login?error=auth_callback_error`
                );
            }

            if (!data.session || !data.user) {
                return NextResponse.redirect(
                    `${origin}/login?error=no_session`
                );
            }

            const userId = data.user.id;
            const userEmail = data.user.email;
            const userMeta = data.user.user_metadata || {};

            // Determine role - prioritize signup_type parameter, then user metadata
            const role =
                signup_type === "mechanic"
                    ? "mechanic"
                    : userMeta.role || "user";

            const name =
                userMeta.display_name ||
                userMeta.full_name ||
                userMeta.name ||
                "Unnamed";
            const profileImage = userMeta.avatar_url || null;

            // Check if user profile exists
            const { data: existingProfile } = await supabase
                .from("user_profiles")
                .select("id, role")
                .eq("id", userId)
                .single();

            if (existingProfile) {
                if (existingProfile.role === "admin")
                    return NextResponse.redirect(`${origin}/admin/dashboard`);
            }
            if (!existingProfile) {
                // Create new profile with determined role
                const { error: insertProfileError } = await supabase
                    .from("user_profiles")
                    .insert({
                        id: userId,
                        role: role,
                    });

                if (insertProfileError) {
                    return NextResponse.redirect(
                        `${origin}/login?error=profile_creation_failed`
                    );
                }
            } else if (
                !existingProfile.role ||
                existingProfile.role === "user"
            ) {
                // Update role if it was a mechanic signup
                if (signup_type === "mechanic") {
                    await supabase
                        .from("user_profiles")
                        .update({ role: "mechanic" })
                        .eq("id", userId);
                }
            }

            // Handle mechanic-specific logic
            if (role === "mechanic" || signup_type === "mechanic") {
                const { data: existingMechanic } = await supabase
                    .from("mechanics")
                    .select("id")
                    .eq("profile_id", userId)
                    .maybeSingle();

                if (!existingMechanic) {
                    const { error: insertMechanicError } = await supabase
                        .from("mechanics")
                        .insert({
                            profile_id: userId,
                            name: name,
                            email: userEmail,
                            url: profileImage,
                        });

                    if (insertMechanicError) {
                        return NextResponse.redirect(
                            `${origin}/login?error=mechanic_creation_failed`
                        );
                    }
                }
            }
            // Check if OAuth user needs to complete profile
            const isOAuthUser = data.user.app_metadata?.provider !== "email";
            // let dict = {
            //     user_id: userId,
            //     name: name,
            //     email: userEmail,
            // };
            // if (!isOAuthUser) {
            //     dict = {
            //         ...dict,
            //         contact_number: userMeta.phone || userMeta.phone_number || userMeta.contact_number || null,
            //     };
            // }
            // const { data: user, error: upsertUserError } = await supabase
            //     .from("users")
            //     .update(dict)
            //     .eq("user_id", userId)
            //     .select("contact_number")
            //     .single();

            // if (upsertUserError) {
            //     console.error("Error upserting user:", upsertUserError.message);
            // }

            const { data: user } = await supabase
                .from("users")
                .select("contact_number")
                .eq("user_id", userId)
                .single();

            if (isOAuthUser && user.contact_number == null) {
                return NextResponse.redirect(`${origin}/complete-profile`);
            }

            // Redirect based on role
            if (role === "mechanic" || signup_type === "mechanic") {
                return NextResponse.redirect(`${origin}/mechanic/bookings`);
            }

            const isNewUser =
                data.user.created_at === data.user.last_sign_in_at;
            if (isNewUser && !isOAuthUser) {
                return NextResponse.redirect(`${origin}/onboarding`);
            }

            return NextResponse.redirect(`${origin}/user/editor`);
        } catch (err) {
            console.error("Callback error:", err);
            return NextResponse.redirect(
                `${origin}/login?error=unexpected_error`
            );
        }
    }

    return NextResponse.redirect(`${origin}/login?error=no_code`);
}
