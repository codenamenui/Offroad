// app/admin/mechanics/[id]/edit/actions.ts
"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function updateMechanicAccount(
    mechanicId: string,
    formData: FormData
) {
    const supabase = await createAdminClient();

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

    if (!name || !email || !contact_number) {
        return {
            success: false,
            message: "Name, email, and contact number are required",
        };
    }

    if (password && password.length < 6) {
        return {
            success: false,
            message: "Password must be at least 6 characters",
        };
    }

    try {
        const { data: mechanic } = await supabase
            .from("mechanics")
            .select("profile_id, url")
            .eq("id", mechanicId)
            .single();

        if (!mechanic) {
            return { success: false, message: "Mechanic not found" };
        }

        let picture_url = mechanic.url;
        if (profile_picture && profile_picture.size > 0) {
            if (mechanic.url) {
                const oldFilePath = mechanic.url.split("/").pop();
                await supabase.storage
                    .from("mechanic-profiles")
                    .remove([`mechanic-profiles/${oldFilePath}`]);
            }

            const fileExt = profile_picture.name.split(".").pop();
            const fileName = `${mechanic.profile_id}-${Date.now()}.${fileExt}`;
            const filePath = `mechanic-profiles/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("mechanic-profiles")
                .upload(filePath, profile_picture, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (uploadError) {
                console.error("Error uploading profile picture:", uploadError);
            } else {
                const {
                    data: { publicUrl },
                } = supabase.storage
                    .from("mechanic-profiles")
                    .getPublicUrl(filePath);
                picture_url = publicUrl;
            }
        }

        if (password) {
            const { error: updateError } =
                await supabase.auth.admin.updateUserById(mechanic.profile_id, {
                    email,
                    password,
                    user_metadata: {
                        role: "mechanic",
                        name: name,
                        display_name: name,
                        full_name: name,
                    },
                });

            if (updateError) {
                console.error("Error updating user:", updateError);
                return {
                    success: false,
                    message:
                        updateError.message || "Failed to update user account",
                };
            }
        } else {
            const { error: updateError } =
                await supabase.auth.admin.updateUserById(mechanic.profile_id, {
                    email,
                    user_metadata: {
                        role: "mechanic",
                        name: name,
                        display_name: name,
                        full_name: name,
                    },
                });

            if (updateError) {
                console.error("Error updating user:", updateError);
                return {
                    success: false,
                    message:
                        updateError.message || "Failed to update user account",
                };
            }
        }

        const { error: mechanicError } = await supabase
            .from("mechanics")
            .update({
                name: name,
                email: email,
                contact_number: contact_number,
                url: picture_url,
            })
            .eq("id", mechanicId);

        if (mechanicError) {
            console.error("Error updating mechanic record:", mechanicError);
            return {
                success: false,
                message:
                    "Failed to update mechanic profile: " +
                    mechanicError.message,
            };
        }

        return {
            success: true,
            message: `Mechanic account updated successfully for ${name} (${email})`,
        };
    } catch (error) {
        console.error("Unexpected error:", error);
        return {
            success: false,
            message: "An unexpected error occurred while updating the account",
        };
    }
}

export async function getMechanic(mechanicId: string) {
    const supabase = await createAdminClient();

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
        return null;
    }

    const { data: mechanic } = await supabase
        .from("mechanics")
        .select("*")
        .eq("id", mechanicId)
        .single();

    return mechanic;
}
