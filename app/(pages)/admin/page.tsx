// app/admin/page.tsx
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function AdminDashboard() {
    const supabase = await createClient();

    const [vehiclesCount, typesCount, partsCount, mechanicsCount] =
        await Promise.all([
            supabase
                .from("vehicles")
                .select("*", { count: "exact", head: true }),
            supabase.from("types").select("*", { count: "exact", head: true }),
            supabase.from("parts").select("*", { count: "exact", head: true }),
            supabase
                .from("mechanics")
                .select("*", { count: "exact", head: true }),
        ]);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Admin Dashboard
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Link href="/admin/vehicles" className="block">
                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                        Vehicles
                                    </h2>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {vehiclesCount.count || 0}
                                    </p>
                                </div>
                                <div className="text-blue-500">
                                    <svg
                                        className="w-12 h-12"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0M9 17h1m4 0h1"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-gray-600 mt-2">
                                Manage vehicle inventory
                            </p>
                        </div>
                    </Link>

                    <Link href="/admin/types" className="block">
                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                        Types
                                    </h2>
                                    <p className="text-3xl font-bold text-green-600">
                                        {typesCount.count || 0}
                                    </p>
                                </div>
                                <div className="text-green-500">
                                    <svg
                                        className="w-12 h-12"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-gray-600 mt-2">
                                Manage part categories
                            </p>
                        </div>
                    </Link>

                    <Link href="/admin/parts" className="block">
                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                        Parts
                                    </h2>
                                    <p className="text-3xl font-bold text-purple-600">
                                        {partsCount.count || 0}
                                    </p>
                                </div>
                                <div className="text-purple-500">
                                    <svg
                                        className="w-12 h-12"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-gray-600 mt-2">
                                Manage parts inventory
                            </p>
                        </div>
                    </Link>

                    <Link href="/admin/mechanics" className="block">
                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                        Mechanics
                                    </h2>
                                    <p className="text-3xl font-bold text-orange-600">
                                        {mechanicsCount.count || 0}
                                    </p>
                                </div>
                                <div className="text-orange-500">
                                    <svg
                                        className="w-12 h-12"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-gray-600 mt-2">
                                Manage mechanic accounts
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Quick Actions Section */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link
                            href="/admin/mechanics/create"
                            className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-lg p-4 hover:bg-orange-100 transition-colors"
                        >
                            <div className="text-orange-600">
                                <svg
                                    className="w-6 h-6"
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
                            </div>
                            <div className="text-orange-800 font-medium">
                                Create Mechanic
                            </div>
                        </Link>

                        <Link
                            href="/admin/vehicles/create"
                            className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
                        >
                            <div className="text-blue-600">
                                <svg
                                    className="w-6 h-6"
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
                            </div>
                            <div className="text-blue-800 font-medium">
                                Add Vehicle
                            </div>
                        </Link>

                        <Link
                            href="/admin/parts/create"
                            className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors"
                        >
                            <div className="text-purple-600">
                                <svg
                                    className="w-6 h-6"
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
                            </div>
                            <div className="text-purple-800 font-medium">
                                Add Part
                            </div>
                        </Link>

                        <Link
                            href="/admin/types/create"
                            className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors"
                        >
                            <div className="text-green-600">
                                <svg
                                    className="w-6 h-6"
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
                            </div>
                            <div className="text-green-800 font-medium">
                                Add Type
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
