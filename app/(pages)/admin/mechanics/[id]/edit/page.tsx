// app/admin/mechanics/[id]/edit/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import UpdateMechanicForm from "./update-mechanic-form";
import Link from "next/link";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditMechanicPage({ params }: PageProps) {
    const { id } = await params;
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

    // Fetch mechanic data
    const { data: mechanic } = await supabase
        .from("mechanics")
        .select("*")
        .eq("id", id)
        .single();

    if (!mechanic) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-inter">
            <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="text-center mb-8">
                    <Link
                        href="/admin/mechanics"
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
                        Back to Mechanics
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
                        Edit Mechanic Account
                    </h2>
                    <p className="text-sm text-gray-600">
                        Update the mechanic&apos;s account information and
                        profile details
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <UpdateMechanicForm mechanic={mechanic} />
                </div>
            </div>
        </div>
    );
}
