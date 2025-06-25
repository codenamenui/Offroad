// app/admin/mechanics/actions.ts
"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteMechanic(mechanicId: string, profileId: string) {
    const supabase = await createAdminClient();

    // Verify admin access
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: "Unauthorized" };
    }

    const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        return { success: false, message: "Unauthorized access" };
    }

    try {
        // First, get the mechanic's profile picture URL to delete it from storage
        const { data: mechanic } = await supabase
            .from("mechanics")
            .select("profile_picture_url")
            .eq("id", mechanicId)
            .single();

        // Delete from mechanics table first
        const { error: mechanicDeleteError } = await supabase
            .from("mechanics")
            .delete()
            .eq("id", mechanicId);

        if (mechanicDeleteError) {
            console.error("Error deleting mechanic:", mechanicDeleteError);
            return {
                success: false,
                message:
                    "Failed to delete mechanic record: " +
                    mechanicDeleteError.message,
            };
        }

        // Delete the user account (this will also trigger cascade deletes)
        const { error: userDeleteError } = await supabase.auth.admin.deleteUser(
            profileId
        );

        if (userDeleteError) {
            console.error("Error deleting user:", userDeleteError);
            // The mechanic record is already deleted, but we should log this
            return {
                success: false,
                message:
                    "Failed to delete user account: " + userDeleteError.message,
            };
        }

        // Delete profile picture from storage if it exists
        if (mechanic?.profile_picture_url) {
            try {
                // Extract the file path from the URL
                const url = new URL(mechanic.profile_picture_url);
                const filePath = url.pathname.split("/").slice(-2).join("/"); // Get the last two parts (bucket/filename)

                const { error: storageError } = await supabase.storage
                    .from("mechanic-profiles")
                    .remove([filePath.replace("mechanic-profiles/", "")]);

                if (storageError) {
                    console.error(
                        "Error deleting profile picture:",
                        storageError
                    );
                    // Don't fail the entire operation for storage errors
                }
            } catch (error) {
                console.error("Error parsing profile picture URL:", error);
            }
        }

        // Revalidate the page to refresh the data
        revalidatePath("/admin/mechanics");

        return {
            success: true,
            message: "Mechanic account deleted successfully",
        };
    } catch (error) {
        console.error("Unexpected error:", error);
        return {
            success: false,
            message: "An unexpected error occurred while deleting the account",
        };
    }
}
