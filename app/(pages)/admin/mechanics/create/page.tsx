// app/admin/mechanics/create/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CreateMechanicForm from "./create-mechanic-form";

export default async function CreateMechanicPage() {
    const supabase = await createClient();

    // Check if user is admin
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
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">
                        Create New Mechanic Account
                    </h1>
                    <CreateMechanicForm />
                </div>
            </div>
        </div>
    );
}
