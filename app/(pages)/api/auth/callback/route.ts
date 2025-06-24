import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const error = requestUrl.searchParams.get("error");
    const error_description = requestUrl.searchParams.get("error_description");
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
            const role = userMeta.role || "user";
            const name =
                userMeta.display_name ||
                userMeta.full_name ||
                userMeta.name ||
                "Unnamed";
            const profileImage = userMeta.avatar_url || null;

            const { data: existingProfile } = await supabase
                .from("user_profiles")
                .select("id")
                .eq("id", userId)
                .single();

            if (!existingProfile) {
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
            }

            if (role === "mechanic") {
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

            const { data: userRecord, error: userRecordError } = await supabase
                .from("users")
                .select("contact_number")
                .eq("user_id", userId)
                .single();

            if (userRecordError) {
                console.error(
                    "Error fetching user record:",
                    userRecordError.message
                );
            }

            const hasPhone =
                userMeta.phone ||
                userMeta.phone_number ||
                userMeta.contact_number ||
                userRecord?.contact_number;

            const isOAuthUser = data.user.app_metadata?.provider !== "email";

            if (isOAuthUser && !hasPhone) {
                return NextResponse.redirect(`${origin}/complete-profile`);
            }

            const isNewUser =
                data.user.created_at === data.user.last_sign_in_at;

            if (isNewUser && !isOAuthUser) {
                return NextResponse.redirect(`${origin}/onboarding`);
            }

            if (role === "mechanic") {
                return NextResponse.redirect(`${origin}/mechanic/dashboard`);
            }

            return NextResponse.redirect(`${origin}/editor`);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            return NextResponse.redirect(
                `${origin}/login?error=unexpected_error`
            );
        }
    }

    return NextResponse.redirect(`${origin}/login?error=no_code`);
}
