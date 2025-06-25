// app/admin/mechanics/MechanicsTable.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteMechanic } from "./actions";

interface Mechanic {
    id: string;
    profile_id: string;
    name: string;
    email: string;
    contact_number: string;
    url?: string;
    created_at: string;
}

interface MechanicsTableProps {
    initialMechanics: Mechanic[];
}

export default function MechanicsTable({
    initialMechanics,
}: MechanicsTableProps) {
    const [mechanics, setMechanics] = useState(initialMechanics);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (mechanicId: string, profileId: string) => {
        setIsDeleting(true);
        try {
            const result = await deleteMechanic(mechanicId, profileId);
            if (result.success) {
                // Remove the mechanic from the local state
                setMechanics(mechanics.filter((m) => m.id !== mechanicId));
                setDeleteConfirm(null);
            } else {
                alert(`Error: ${result.message}`);
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            alert("Failed to delete mechanic. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!mechanics || mechanics.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow">
                <div className="p-8 text-center">
                    <div className="text-gray-400 mb-4">
                        <svg
                            className="w-16 h-16 mx-auto"
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No mechanics found
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Get started by creating your first mechanic account.
                    </p>
                    <Link
                        href="/admin/mechanics/create"
                        className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
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
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
                        Create Mechanic
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-6 font-medium text-gray-900">
                                    Name
                                </th>
                                <th className="text-left py-3 px-6 font-medium text-gray-900">
                                    Email
                                </th>
                                <th className="text-left py-3 px-6 font-medium text-gray-900">
                                    Contact
                                </th>
                                <th className="text-left py-3 px-6 font-medium text-gray-900">
                                    Profile Picture
                                </th>
                                <th className="text-left py-3 px-6 font-medium text-gray-900">
                                    Created
                                </th>
                                <th className="text-left py-3 px-6 font-medium text-gray-900">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {mechanics.map((mechanic) => (
                                <tr
                                    key={mechanic.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="py-4 px-6">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                                <svg
                                                    className="w-6 h-6 text-orange-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {mechanic.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {mechanic.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-gray-900">
                                        {mechanic.email}
                                    </td>
                                    <td className="py-4 px-6 text-gray-900">
                                        {mechanic.contact_number}
                                    </td>
                                    <td className="py-4 px-6">
                                        {mechanic.url ? (
                                            <img
                                                src={mechanic.url}
                                                alt={`${mechanic.name}'s profile`}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                <svg
                                                    className="w-6 h-6 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-gray-600">
                                        {new Date(
                                            mechanic.created_at
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/admin/mechanics/${mechanic.id}/edit`}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Edit
                                            </Link>
                                            <span className="text-gray-300">
                                                |
                                            </span>
                                            <button
                                                onClick={() =>
                                                    setDeleteConfirm(
                                                        mechanic.id
                                                    )
                                                }
                                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                disabled={isDeleting}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Confirm Delete
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this mechanic
                            account? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const mechanic = mechanics.find(
                                        (m) => m.id === deleteConfirm
                                    );
                                    if (mechanic) {
                                        handleDelete(
                                            mechanic.id,
                                            mechanic.profile_id
                                        );
                                    }
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
