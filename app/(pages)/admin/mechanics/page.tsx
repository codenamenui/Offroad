// app/admin/mechanics/page.tsx
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import MechanicsTable from "./mechanics-table";

export default async function MechanicsPage() {
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

    // Fetch all mechanics
    const { data: mechanics, error } = await supabase
        .from("mechanics")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching mechanics:", error);
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Mechanics Management
                    </h1>
                    <Link
                        href="/admin/mechanics/create"
                        className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
                        Create New Mechanic
                    </Link>
                </div>

                <MechanicsTable initialMechanics={mechanics || []} />

                {/* Back to Dashboard */}
                <div className="mt-8">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
