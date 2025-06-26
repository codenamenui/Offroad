import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import SignOutButton from "./sign-out-button";

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
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-inter">
            <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
                <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden">
                        <Image
                            src="/icon.png"
                            alt="Putik Offroaders Logo"
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    Admin Dashboard
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Welcome to Putik Offroaders Admin Panel
                </p>
                <p className="text-center text-sm text-gray-600">
                    Manage your inventory and accounts
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <Link href="/admin/vehicles" className="block">
                            <div className="border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-amber-500 focus-within:border-amber-500 hover:border-amber-500 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-amber-600">
                                            <svg
                                                className="w-8 h-8"
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
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Vehicles
                                            </label>
                                            <p className="text-sm text-gray-600">
                                                Manage vehicle inventory
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-amber-600">
                                        {vehiclesCount.count || 0}
                                    </span>
                                </div>
                            </div>
                        </Link>

                        <Link href="/admin/types" className="block">
                            <div className="border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-amber-500 focus-within:border-amber-500 hover:border-amber-500 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-amber-600">
                                            <svg
                                                className="w-8 h-8"
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
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Types
                                            </label>
                                            <p className="text-sm text-gray-600">
                                                Manage part categories
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-amber-600">
                                        {typesCount.count || 0}
                                    </span>
                                </div>
                            </div>
                        </Link>

                        <Link href="/admin/parts" className="block">
                            <div className="border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-amber-500 focus-within:border-amber-500 hover:border-amber-500 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-amber-600">
                                            <svg
                                                className="w-8 h-8"
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
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Parts
                                            </label>
                                            <p className="text-sm text-gray-600">
                                                Manage parts inventory
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-amber-600">
                                        {partsCount.count || 0}
                                    </span>
                                </div>
                            </div>
                        </Link>

                        <Link href="/admin/mechanics" className="block">
                            <div className="border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-amber-500 focus-within:border-amber-500 hover:border-amber-500 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-amber-600">
                                            <svg
                                                className="w-8 h-8"
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
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Mechanics
                                            </label>
                                            <p className="text-sm text-gray-600">
                                                Manage mechanic accounts
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-amber-600">
                                        {mechanicsCount.count || 0}
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* New Bookings Button */}
                        <Link href="/admin/bookings" className="block">
                            <div className="border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-amber-500 focus-within:border-amber-500 hover:border-amber-500 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-amber-600">
                                            <svg
                                                className="w-8 h-8"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Bookings
                                            </label>
                                            <p className="text-sm text-gray-600">
                                                Manage booking requests
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-amber-600">
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
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Account Management
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <SignOutButton />
                    </div>
                </div>
            </div>
        </div>
    );
}
