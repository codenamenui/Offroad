// app/admin/parts/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Tables } from "@/data/database.types";
import Link from "next/link";
import Image from "next/image";

type Part = Tables<"parts">;
type Vehicle = Tables<"vehicles">;
type Type = Tables<"types">;

interface PartWithRelations extends Part {
    vehicles?: Vehicle;
    types?: Type;
}

export default function PartsPage() {
    const [parts, setParts] = useState<PartWithRelations[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [types, setTypes] = useState<Type[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewImageUrl, setViewImageUrl] = useState("");
    const [editingPart, setEditingPart] = useState<Part | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        url: "",
        vehicle_id: "",
        type_id: "",
        stock: "",
        price: "",
        description: "",
    });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const supabase = createClient();

    const fetchData = useCallback(async () => {
        const [partsData, vehiclesData, typesData] = await Promise.all([
            supabase
                .from("parts")
                .select(
                    `
              *,
              vehicles (id, name, make, model, year),
              types (id, name)
            `
                )
                .order("id", { ascending: false }),
            supabase.from("vehicles").select("*").order("name"),
            supabase.from("types").select("*").order("name"),
        ]);

        setParts(partsData.data || []);
        setVehicles(vehiclesData.data || []);
        setTypes(typesData.data || []);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);

        let imageUrl = formData.url;

        if (selectedFile) {
            const fileExt = selectedFile.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random()
                .toString(36)
                .substring(2)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("parts-images")
                .upload(fileName, selectedFile);

            if (uploadError) {
                alert("Error uploading image: " + uploadError.message);
                setUploading(false);
                return;
            }

            const {
                data: { publicUrl },
            } = supabase.storage.from("parts-images").getPublicUrl(fileName);

            imageUrl = publicUrl;
        }

        const submitData = {
            ...formData,
            url: imageUrl,
            vehicle_id: formData.vehicle_id
                ? parseInt(formData.vehicle_id)
                : null,
            type_id: formData.type_id ? parseInt(formData.type_id) : null,
            stock: formData.stock ? parseInt(formData.stock) : null,
            price: formData.price ? parseFloat(formData.price) : null,
        };

        if (editingPart) {
            await supabase
                .from("parts")
                .update(submitData)
                .eq("id", editingPart.id);
        } else {
            await supabase.from("parts").insert([submitData]);
        }

        fetchData();
        resetForm();
        setUploading(false);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this part?")) {
            await supabase.from("parts").delete().eq("id", id);
            fetchData();
        }
    };

    const handleEdit = (part: Part) => {
        setEditingPart(part);
        setFormData({
            name: part.name || "",
            url: part.url || "",
            vehicle_id: part.vehicle_id?.toString() || "",
            type_id: part.type_id?.toString() || "",
            stock: part.stock?.toString() || "",
            price: part.price?.toString() || "",
            description: part.description || "",
        });
        setIsModalOpen(true);
    };

    const handleViewImage = (imageUrl: string) => {
        setViewImageUrl(imageUrl);
        setIsViewModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            url: "",
            vehicle_id: "",
            type_id: "",
            stock: "",
            price: "",
            description: "",
        });
        setEditingPart(null);
        setIsModalOpen(false);
        setSelectedFile(null);
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
                        Parts Management
                    </h2>
                    <p className="text-sm text-gray-600">
                        Manage your parts inventory and pricing
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-7xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                            Add Part
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Image
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Part Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vehicle
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {parts.map((part) => (
                                    <tr key={part.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {part.url ? (
                                                <div className="flex items-center space-x-2">
                                                    <div className="h-16 w-16 relative">
                                                        <Image
                                                            src={part.url}
                                                            alt={
                                                                part.name ||
                                                                "Part"
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
                                                                part.url!
                                                            )
                                                        }
                                                        className="text-amber-600 hover:text-amber-500 text-sm"
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <span className="text-gray-400 text-xs">
                                                        No Image
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {part.name}
                                            </div>
                                            {part.description && (
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {part.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {part.vehicles
                                                ? `${part.vehicles.name} (${part.vehicles.make} ${part.vehicles.model})`
                                                : "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {part.types?.name || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    (part.stock || 0) > 10
                                                        ? "bg-green-100 text-green-800"
                                                        : (part.stock || 0) > 5
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {part.stock || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {part.price
                                                ? `₱${parseFloat(
                                                      part.price.toString()
                                                  ).toFixed(2)}`
                                                : "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(part)}
                                                className="text-amber-600 hover:text-amber-500 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(part.id)
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

                        {parts.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No parts found. Add your first part to get
                                started!
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                        <h2 className="text-lg font-bold mb-4 text-gray-900">
                            {editingPart ? "Edit Part" : "Add New Part"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Part Image
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setSelectedFile(
                                            e.target.files?.[0] || null
                                        )
                                    }
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                />
                                {formData.url && (
                                    <div className="mt-2">
                                        <div className="h-20 w-20 relative">
                                            <Image
                                                src={formData.url}
                                                alt="Current"
                                                fill
                                                className="object-cover rounded"
                                                sizes="80px"
                                                unoptimized={true}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Current image
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Part Name
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
                                        placeholder="Enter part name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Vehicle
                                    </label>
                                    <select
                                        value={formData.vehicle_id}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                vehicle_id: e.target.value,
                                            })
                                        }
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                    >
                                        <option value="">Select Vehicle</option>
                                        {vehicles.map((vehicle) => (
                                            <option
                                                key={vehicle.id}
                                                value={vehicle.id}
                                            >
                                                {vehicle.name} ({vehicle.make}{" "}
                                                {vehicle.model} {vehicle.year})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type
                                    </label>
                                    <select
                                        value={formData.type_id}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                type_id: e.target.value,
                                            })
                                        }
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                    >
                                        <option value="">Select Type</option>
                                        {types.map((type) => (
                                            <option
                                                key={type.id}
                                                value={type.id}
                                            >
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Stock Quantity
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                stock: e.target.value,
                                            })
                                        }
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                        placeholder="Enter stock quantity"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Price (₱)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                price: e.target.value,
                                            })
                                        }
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                        placeholder="Enter price"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                    placeholder="Enter part description"
                                    rows={3}
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
                                    disabled={uploading}
                                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                                >
                                    {uploading
                                        ? "Uploading..."
                                        : editingPart
                                        ? "Update"
                                        : "Add"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isViewModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900">
                                Part Image
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
                                alt="Part"
                                fill
                                className="object-contain rounded-lg"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                unoptimized={true}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
