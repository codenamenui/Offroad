// app/admin/mechanics/create/CreateMechanicForm.tsx
"use client";

import { useState } from "react";
import { createMechanicAccount } from "./actions";

export default function CreateMechanicForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setMessage(null);

        try {
            const result = await createMechanicAccount(formData);

            if (result.success) {
                setMessage({ type: "success", text: result.message });
                // Reset form
                (
                    document.getElementById("mechanic-form") as HTMLFormElement
                )?.reset();
            } else {
                setMessage({ type: "error", text: result.message });
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setMessage({ type: "error", text: "An unexpected error occurred" });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form id="mechanic-form" action={handleSubmit} className="space-y-6">
            {message && (
                <div
                    className={`p-4 rounded-md ${
                        message.type === "success"
                            ? "bg-green-50 text-green-800 border border-green-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                >
                    {message.text}
                </div>
            )}

            <div>
                <label
                    htmlFor="profile_picture"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Profile Picture (Optional)
                </label>
                <input
                    type="file"
                    id="profile_picture"
                    name="profile_picture"
                    accept="image/*"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        placeholder="Enter mechanic's full name"
                    />
                </div>

                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        placeholder="Enter email address"
                    />
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        minLength={6}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        placeholder="Enter password (min. 6 characters)"
                    />
                </div>

                <div>
                    <label
                        htmlFor="contact_number"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Contact Number
                    </label>
                    <input
                        type="tel"
                        id="contact_number"
                        name="contact_number"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        placeholder="Enter contact number"
                    />
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-amber-800 mb-2">
                    Account Creation Notes:
                </h4>
                <ul className="text-xs text-amber-700 space-y-1">
                    <li>• The mechanic will be created with role &apos;mechanic&apos;</li>
                    <li>
                        • They will receive a confirmation email to verify their
                        account
                    </li>
                    <li>
                        • The mechanic can log in immediately after creation
                    </li>
                    <li>
                        • Profile picture will be uploaded to Supabase storage
                    </li>
                </ul>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                >
                    {isLoading ? "Creating..." : "Create Mechanic"}
                </button>
            </div>
        </form>
    );
}
