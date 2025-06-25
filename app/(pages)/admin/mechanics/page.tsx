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
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-inter">
            <div className="sm:mx-auto sm:w-full sm:max-w-7xl">
                <div className="text-center mb-8">
                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center text-amber-600 hover:text-amber-500 mb-4"
                    >
                        <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back to Dashboard
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
                        Mechanics Management
                    </h2>
                    <p className="text-sm text-gray-600">
                        Manage mechanic accounts and their information
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-7xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="flex justify-end mb-6">
                        <Link
                            href="/admin/mechanics/create"
                            className="w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                            Add Mechanic
                        </Link>
                    </div>

                    <MechanicsTable initialMechanics={mechanics || []} />
                </div>
            </div>
        </div>
    );
}
