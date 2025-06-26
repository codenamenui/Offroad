"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Tables } from "@/data/database.types";
import Link from "next/link";
import Image from "next/image";

type Vehicle = Tables<"vehicles">;

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewImageUrl, setViewImageUrl] = useState("");
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        make: "",
        model: "",
        year: "",
        url: "",
    });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const supabase = createClient();

    const fetchVehicles = useCallback(async () => {
        const { data } = await supabase
            .from("vehicles")
            .select("*")
            .order("id", { ascending: false });
        setVehicles(data || []);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

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
                .from("vehicle-images")
                .upload(fileName, selectedFile);

            if (uploadError) {
                alert("Error uploading image: " + uploadError.message);
                setUploading(false);
                return;
            }

            const {
                data: { publicUrl },
            } = supabase.storage.from("vehicle-images").getPublicUrl(fileName);

            imageUrl = publicUrl;
        }

        const submitData = { ...formData, url: imageUrl };

        if (editingVehicle) {
            await supabase
                .from("vehicles")
                .update(submitData)
                .eq("id", editingVehicle.id);
        } else {
            await supabase.from("vehicles").insert([submitData]);
        }

        fetchVehicles();
        resetForm();
        setUploading(false);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this vehicle?")) {
            await supabase.from("vehicles").delete().eq("id", id);
            fetchVehicles();
        }
    };

    const handleEdit = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setFormData({
            name: vehicle.name || "",
            make: vehicle.make || "",
            model: vehicle.model || "",
            year: vehicle.year || "",
            url: vehicle.url || "",
        });
        setIsModalOpen(true);
    };

    const handleViewImage = (imageUrl: string) => {
        setViewImageUrl(imageUrl);
        setIsViewModalOpen(true);
    };

    const resetForm = () => {
        setFormData({ name: "", make: "", model: "", year: "", url: "" });
        setEditingVehicle(null);
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
                        Vehicles Management
                    </h2>
                    <p className="text-sm text-gray-600">
                        Manage your vehicle inventory
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
                            Add Vehicle
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
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Make
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Model
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Year
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {vehicles.map((vehicle) => (
                                    <tr key={vehicle.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {vehicle.url ? (
                                                <div className="flex items-center space-x-2">
                                                    <div className="h-16 w-16 relative">
                                                        <Image
                                                            src={vehicle.url}
                                                            alt={
                                                                vehicle.name ||
                                                                "Vehicle"
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
                                                                vehicle.url!
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {vehicle.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {vehicle.make}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {vehicle.model}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {vehicle.year}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() =>
                                                    handleEdit(vehicle)
                                                }
                                                className="text-amber-600 hover:text-amber-500 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(vehicle.id)
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
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <h2 className="text-lg font-bold mb-4 text-gray-900">
                            {editingVehicle
                                ? "Edit Vehicle"
                                : "Add New Vehicle"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vehicle Image
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                    placeholder="Enter vehicle name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Make
                                </label>
                                <input
                                    type="text"
                                    value={formData.make}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            make: e.target.value,
                                        })
                                    }
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                    placeholder="Enter make"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Model
                                </label>
                                <input
                                    type="text"
                                    value={formData.model}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            model: e.target.value,
                                        })
                                    }
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                    placeholder="Enter model"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Year
                                </label>
                                <input
                                    type="text"
                                    value={formData.year}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            year: e.target.value,
                                        })
                                    }
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                    placeholder="Enter year"
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
                                        : editingVehicle
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
                                Vehicle Image
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
                                alt="Vehicle"
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
