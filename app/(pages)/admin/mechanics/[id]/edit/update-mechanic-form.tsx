// app/admin/mechanics/[id]/edit/UpdateMechanicForm.tsx
"use client";

import { useState } from "react";
import { updateMechanicAccount } from "./actions";

interface Mechanic {
    id: string;
    name: string;
    email: string;
    contact_number: string;
    url: string | null;
}

interface UpdateMechanicFormProps {
    mechanic: Mechanic;
}

export default function UpdateMechanicForm({
    mechanic,
}: UpdateMechanicFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setMessage(null);

        try {
            const result = await updateMechanicAccount(mechanic.id, formData);

            if (result.success) {
                setMessage({ type: "success", text: result.message });
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
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Full Name *
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    defaultValue={mechanic.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter mechanic's full name"
                />
            </div>

            <div>
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Email Address *
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    defaultValue={mechanic.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email address"
                />
            </div>

            <div>
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Password (Leave blank to keep current)
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter new password (min. 6 characters)"
                />
            </div>

            <div>
                <label
                    htmlFor="contact_number"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Contact Number *
                </label>
                <input
                    type="tel"
                    id="contact_number"
                    name="contact_number"
                    required
                    defaultValue={mechanic.contact_number}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter contact number"
                />
            </div>

            <div>
                <label
                    htmlFor="profile_picture"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Profile Picture
                </label>
                {mechanic.url && (
                    <div className="mb-2">
                        <img
                            src={mechanic.url}
                            alt="Current profile"
                            className="w-20 h-20 object-cover rounded-full border"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Current profile picture
                        </p>
                    </div>
                )}
                <input
                    type="file"
                    id="profile_picture"
                    name="profile_picture"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                    Upload a new image to replace the current profile picture
                </p>
            </div>

            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading
                        ? "Updating Account..."
                        : "Update Mechanic Account"}
                </button>

                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Cancel
                </button>
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Update Notes:</h4>
                <ul className="list-disc list-inside space-y-1">
                    <li>
                        Leave password field blank to keep the current password
                    </li>
                    <li>
                        Email changes will require the mechanic to verify their
                        new email
                    </li>
                    <li>
                        Profile picture will be replaced if a new one is
                        uploaded
                    </li>
                    <li>All other changes take effect immediately</li>
                </ul>
            </div>
        </form>
    );
}
