// app/admin/types/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Tables } from "@/data/database.types";
import Link from "next/link";

type Type = Tables<"types">;

export default function TypesPage() {
    const [types, setTypes] = useState<Type[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<Type | null>(null);
    const [formData, setFormData] = useState({
        name: "",
    });
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    const fetchTypes = useCallback(async () => {
        const { data } = await supabase
            .from("types")
            .select("*")
            .order("id", { ascending: false });
        setTypes(data || []);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchTypes();
    }, [fetchTypes]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingType) {
            await supabase
                .from("types")
                .update(formData)
                .eq("id", editingType.id);
        } else {
            await supabase.from("types").insert([formData]);
        }

        fetchTypes();
        resetForm();
    };

    const handleDelete = async (id: number) => {
        if (
            confirm(
                "Are you sure you want to delete this type? This will also delete all associated parts."
            )
        ) {
            await supabase.from("types").delete().eq("id", id);
            fetchTypes();
        }
    };

    const handleEdit = (type: Type) => {
        setEditingType(type);
        setFormData({
            name: type.name || "",
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({ name: "" });
        setEditingType(null);
        setIsModalOpen(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-inter">
                <div className="flex justify-center items-center">
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-inter">
            <div className="sm:mx-auto sm:w-full sm:max-w-6xl">
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
                        Types Management
                    </h2>
                    <p className="text-sm text-gray-600">
                        Manage your part type categories
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-6xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                            Add Type
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {types.map((type) => (
                                    <tr key={type.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {type.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {type.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(type)}
                                                className="text-amber-600 hover:text-amber-500 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(type.id)
                                                }
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {types.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No types found. Add your first type to get
                                started!
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <h2 className="text-lg font-bold mb-4 text-gray-900">
                            {editingType ? "Edit Type" : "Add New Type"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Type Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                    required
                                    placeholder="Enter type name (e.g., Engine Parts, Brake Components)"
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                                >
                                    {editingType ? "Update" : "Add"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
