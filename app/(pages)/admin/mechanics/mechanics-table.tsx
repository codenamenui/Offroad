// app/admin/mechanics/MechanicsTable.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewImageUrl, setViewImageUrl] = useState("");

    const handleDelete = async (mechanicId: string, profileId: string) => {
        setIsDeleting(true);
        try {
            const result = await deleteMechanic(mechanicId, profileId);
            if (result.success) {
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

    const handleViewImage = (imageUrl: string) => {
        setViewImageUrl(imageUrl);
        setIsViewModalOpen(true);
    };

    return (
        <>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Profile Picture
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Mechanic Details
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {mechanics.map((mechanic) => (
                            <tr key={mechanic.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {mechanic.url ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="h-16 w-16 relative">
                                                <Image
                                                    src={mechanic.url}
                                                    alt={
                                                        mechanic.name ||
                                                        "Mechanic"
                                                    }
                                                    fill
                                                    className="object-cover rounded-lg"
                                                    sizes="64px"
                                                    unoptimized={true}
                                                />
                                            </div>
                                            <button
                                                onClick={() =>
                                                    handleViewImage(
                                                        mechanic.url!
                                                    )
                                                }
                                                className="text-amber-600 hover:text-amber-500 text-sm"
                                            >
                                                View
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <svg
                                                className="w-8 h-8 text-gray-400"
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
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {mechanic.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        ID: {mechanic.id}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {mechanic.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {mechanic.contact_number}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(
                                        mechanic.created_at
                                    ).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <Link
                                        href={`/admin/mechanics/${mechanic.id}/edit`}
                                        className="text-amber-600 hover:text-amber-500 mr-4"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() =>
                                            setDeleteConfirm(mechanic.id)
                                        }
                                        className="text-red-600 hover:text-red-900"
                                        disabled={isDeleting}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {mechanics.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No mechanics found. Add your first mechanic to get
                        started!
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                        <h2 className="text-lg font-bold mb-4 text-gray-900">
                            Confirm Delete
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this mechanic
                            account? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
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
                                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image View Modal */}
            {isViewModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900">
                                Profile Picture
                            </h2>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
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
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div className="relative w-full h-96">
                            <Image
                                src={viewImageUrl}
                                alt="Profile"
                                fill
                                className="object-contain rounded-lg"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                unoptimized={true}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
