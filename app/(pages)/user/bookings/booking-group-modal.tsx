"use client";

import { useState } from "react";
import { Tables } from "@/data/database.types";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type Booking = Tables<"bookings">;
type Part = Tables<"parts">;
type Vehicle = Tables<"vehicles">;
type Mechanic = Tables<"mechanics">;

interface BookingWithDetails extends Booking {
    parts: Part & {
        vehicles: Vehicle;
    };
    mechanics: Mechanic;
}

interface BookingGroup {
    booking_group_id: number;
    bookings: BookingWithDetails[];
    vehicle: Vehicle;
    mechanic: Mechanic;
    totalPrice: number;
    date: string | null;
    status: string;
}

interface BookingGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingGroup: BookingGroup;
    userType: "customer" | "mechanic";
    onUpdate: (updatedGroup: BookingGroup) => void;
}

export default function BookingGroupModal({
    isOpen,
    onClose,
    bookingGroup,
    userType,
    onUpdate,
}: BookingGroupModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [currentBookingGroup, setCurrentBookingGroup] =
        useState(bookingGroup);
    const router = useRouter();

    if (!isOpen) return null;

    const formatPrice = (price: number | null) => {
        if (!price) return "₱0.00";
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(price);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Not scheduled";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const handleGroupStatusChange = async (newStatus: string) => {
        setIsLoading(true);
        try {
            const supabase = await createClient();

            const bookingIds = currentBookingGroup.bookings.map((b) => b.id);
            const { error } = await supabase
                .from("bookings")
                .update({ status: newStatus })
                .in("id", bookingIds);

            if (error) {
                console.error("Error updating booking group status:", error);
                return;
            }

            const updatedBookings = currentBookingGroup.bookings.map(
                (booking) => ({
                    ...booking,
                    status: newStatus,
                })
            );

            const updatedGroup = {
                ...currentBookingGroup,
                bookings: updatedBookings,
                status: newStatus,
            };

            setCurrentBookingGroup(updatedGroup);
            onUpdate(updatedGroup);
        } catch (error) {
            console.error("Error updating booking group status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelGroup = () => handleGroupStatusChange("cancelled");
    const handleAcceptGroup = () => handleGroupStatusChange("confirmed");
    const handleRejectGroup = () => handleGroupStatusChange("rejected");

    const handleChangeInEditor = () => {
        router.push(
            `/editor?edit_booking=${currentBookingGroup.booking_group_id}`
        );
        onClose();
    };

    const canModify = currentBookingGroup.status === "pending";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Booking Group Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="mb-4">
                    {currentBookingGroup.vehicle?.url && (
                        <Image
                            src={currentBookingGroup.vehicle.url}
                            alt={currentBookingGroup.vehicle.name || "Vehicle"}
                            width={400}
                            height={250}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                    )}
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            {currentBookingGroup.vehicle?.name ||
                                "Unknown Vehicle"}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {currentBookingGroup.vehicle?.make}{" "}
                            {currentBookingGroup.vehicle?.model}{" "}
                            {currentBookingGroup.vehicle?.year}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date
                            </label>
                            <p className="text-gray-900">
                                {formatDate(currentBookingGroup.date)}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    currentBookingGroup.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : currentBookingGroup.status ===
                                          "confirmed"
                                        ? "bg-green-100 text-green-800"
                                        : currentBookingGroup.status ===
                                          "completed"
                                        ? "bg-blue-100 text-blue-800"
                                        : currentBookingGroup.status ===
                                              "cancelled" ||
                                          currentBookingGroup.status ===
                                              "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : currentBookingGroup.status === "mixed"
                                        ? "bg-orange-100 text-orange-800"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                            >
                                {currentBookingGroup.status}
                            </span>
                        </div>
                    </div>

                    {userType === "customer" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mechanic
                            </label>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                                    {currentBookingGroup.mechanic?.url ? (
                                        <Image
                                            src={
                                                currentBookingGroup.mechanic.url
                                            }
                                            alt={
                                                currentBookingGroup.mechanic
                                                    .name || "Mechanic"
                                            }
                                            width={100}
                                            height={100}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xs font-medium text-gray-600">
                                            {currentBookingGroup.mechanic?.name?.charAt(
                                                0
                                            ) || "M"}
                                        </span>
                                    )}
                                </div>
                                <p className="font-medium text-gray-900">
                                    {currentBookingGroup.mechanic?.name ||
                                        "Unassigned"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                        Parts Ordered
                    </h4>
                    <div className="space-y-3">
                        {currentBookingGroup.bookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="bg-gray-50 p-3 rounded-lg"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h5 className="font-medium text-gray-900">
                                            {booking.parts?.name ||
                                                "Unknown Part"}
                                        </h5>
                                        <p className="text-sm text-gray-500">
                                            Unit Price:{" "}
                                            {formatPrice(booking.parts?.price)}
                                        </p>
                                        {booking.parts?.description && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                {booking.parts.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm font-medium">
                                            Qty: {booking.quantity || 1}
                                        </span>

                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">
                                                {formatPrice(
                                                    (booking.parts?.price ||
                                                        0) *
                                                        (booking.quantity || 1)
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t mt-4 pt-4">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold">
                                Total:
                            </span>
                            <span className="text-lg font-bold text-gray-900">
                                {formatPrice(currentBookingGroup.totalPrice)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>

                    {userType === "customer" && canModify && (
                        <>
                            <button
                                onClick={handleChangeInEditor}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                disabled={isLoading}
                            >
                                Change in Editor
                            </button>
                            <button
                                onClick={handleCancelGroup}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                disabled={isLoading}
                            >
                                {isLoading ? "Cancelling..." : "Cancel Order"}
                            </button>
                        </>
                    )}

                    {userType === "mechanic" && canModify && (
                        <>
                            <button
                                onClick={handleRejectGroup}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                disabled={isLoading}
                            >
                                {isLoading ? "Rejecting..." : "Reject Order"}
                            </button>
                            <button
                                onClick={handleAcceptGroup}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                disabled={isLoading}
                            >
                                {isLoading ? "Accepting..." : "Accept Order"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
