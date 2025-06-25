// app/admin/types/page.tsx
"use client";

import { useState, useEffect } from "react";
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

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        const { data } = await supabase
            .from("types")
            .select("*")
            .order("id", { ascending: false });
        setTypes(data || []);
        setLoading(false);
    };

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
            <div className="flex justify-center items-center min-h-screen">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <Link
                            href="/admin/dashboard"
                            className="text-blue-600 hover:underline mb-2 inline-block"
                        >
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Types Management
                        </h1>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                        Add Type
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
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
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
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
                            No types found. Add your first type to get started!
                        </div>
                    )}
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <h2 className="text-lg font-bold mb-4">
                                {editingType ? "Edit Type" : "Add New Type"}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Name
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
                                        required
                                        placeholder="Enter type name (e.g., Engine Parts, Brake Components)"
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        {editingType ? "Update" : "Add"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
