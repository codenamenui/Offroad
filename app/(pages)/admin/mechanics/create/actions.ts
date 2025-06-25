// app/admin/mechanics/create/actions.ts
"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function createMechanicAccount(formData: FormData) {
    const supabase = await createAdminClient();

    // Verify admin access
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        return { success: false, message: "Unauthorized access" };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const contact_number = formData.get("contact_number") as string;
    const profile_picture = formData.get("profile_picture") as File;

    if (!name || !email || !password || !contact_number) {
        return {
            success: false,
            message: "Name, email, password, and contact number are required",
        };
    }

    if (password.length < 6) {
        return {
            success: false,
            message: "Password must be at least 6 characters",
        };
    }

    try {
        // Create the user account using Supabase Admin API
        const { data: newUser, error: createError } =
            await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true, // Auto-confirm email
                user_metadata: {
                    role: "mechanic",
                    name: name,
                    display_name: name,
                    full_name: name,
                },
            });

        if (createError) {
            console.error("Error creating user:", createError);
            return {
                success: false,
                message: createError.message || "Failed to create user account",
            };
        }

        if (!newUser.user) {
            return { success: false, message: "Failed to create user account" };
        }

        // Handle profile picture upload if provided
        let picture_url = null;
        if (profile_picture && profile_picture.size > 0) {
            const fileExt = profile_picture.name.split(".").pop();
            const fileName = `${newUser.user.id}-${Date.now()}.${fileExt}`;
            const filePath = `mechanic-profiles/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("mechanic-profiles")
                .upload(filePath, profile_picture, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (uploadError) {
                console.error("Error uploading profile picture:", uploadError);
                // Don't fail the entire operation, just log the error
            } else {
                // Get the public URL
                const {
                    data: { publicUrl },
                } = supabase.storage
                    .from("mechanic-profiles")
                    .getPublicUrl(filePath);
                picture_url = publicUrl;
            }
        }

        // First, let's make sure the user_profiles record exists and has correct role
        const { error: profileError } = await supabase
            .from("user_profiles")
            .upsert({
                id: newUser.user.id,
                role: "mechanic",
            });

        if (profileError) {
            console.error("Error creating user profile:", profileError);
            // Don't fail here, the trigger might have handled it
        }

        // Insert into mechanics table (or mechanic-profiles if that's your table name)
        const { error: mechanicError } = await supabase
            .from("mechanics") // Change to "mechanic-profiles" if that's your table name
            .insert({
                profile_id: newUser.user.id,
                name: name,
                email: email,
                contact_number: contact_number,
                url: picture_url, // Use the uploaded URL
            });

        if (mechanicError) {
            console.error("Error creating mechanic record:", mechanicError);

            // If mechanic creation fails, clean up the user account and uploaded file
            await supabase.auth.admin.deleteUser(newUser.user.id);

            // Clean up uploaded file if it exists
            if (picture_url) {
                const filePath = picture_url.split("/").pop();
                await supabase.storage
                    .from("mechanic-profiles")
                    .remove([`mechanic-profiles/${filePath}`]);
            }

            return {
                success: false,
                message:
                    "Failed to create mechanic profile: " +
                    mechanicError.message,
            };
        }

        return {
            success: true,
            message: `Mechanic account created successfully for ${name} (${email})`,
        };
    } catch (error) {
        console.error("Unexpected error:", error);
        return {
            success: false,
            message: "An unexpected error occurred while creating the account",
        };
    }
}
