"use client";

import { useState } from "react";
import { Tables } from "@/data/database.types";
import BookingGroupModal from "./booking-group-modal";
import Image from "next/image";
import HeaderPanel, { SearchProvider } from "../../../../components/header";

type User = Tables<"users">;
type Booking = Tables<"bookings">;
type Part = Tables<"parts">;
type Vehicle = Tables<"vehicles">;
type Mechanic = Tables<"mechanics">;

interface BookingWithDetails extends Booking {
    users: User;
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

interface BookingRequestsPanelProps {
    bookings: BookingWithDetails[];
    userType?: "customer" | "mechanic";
    user: { name: string };
}

export default function BookingRequestsPanel({
    bookings,
    userType = "customer",
    user,
}: BookingRequestsPanelProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedBookingGroup, setSelectedBookingGroup] =
        useState<BookingGroup | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [localBookings, setLocalBookings] = useState(bookings);
    const itemsPerPage = 6;

    const calculateGroupStatus = (groupBookings: BookingWithDetails[]) => {
        const statuses = groupBookings.map((b) => b.status);
        const uniqueStatuses = [...new Set(statuses)];

        if (uniqueStatuses.length === 1) {
            return uniqueStatuses[0];
        }

        if (statuses.every((s) => s === "completed")) return "completed";
        if (statuses.every((s) => s === "accepted")) return "accepted";
        if (statuses.every((s) => s === "pending")) return "pending";
        if (statuses.every((s) => s === "cancelled")) return "cancelled";
        if (statuses.every((s) => s === "rejected")) return "rejected";

        return "mixed";
    };

    const groupBookings = (): BookingGroup[] => {
        const groups = new Map<number, BookingWithDetails[]>();

        localBookings.forEach((booking) => {
            const groupId = booking.booking_group_id;
            if (!groupId) return;

            if (!groups.has(groupId)) {
                groups.set(groupId, []);
            }
            groups.get(groupId)!.push(booking);
        });

        return Array.from(groups.entries()).map(([groupId, groupBookings]) => {
            const firstBooking = groupBookings[0];
            const totalPrice = groupBookings.reduce(
                (sum, booking) =>
                    sum + (booking.parts?.price || 0) * (booking.quantity || 1),
                0
            );

            const groupStatus = calculateGroupStatus(groupBookings);

            return {
                booking_group_id: groupId,
                bookings: groupBookings,
                vehicle: firstBooking.parts.vehicles,
                mechanic: firstBooking.mechanics,
                totalPrice,
                date: firstBooking.date,
                status: groupStatus,
            };
        });
    };

    const bookingGroups = groupBookings();
    const totalPages = Math.ceil(bookingGroups.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentGroups = bookingGroups.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const formatPrice = (price: number) => {
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
            month: "short",
            day: "numeric",
        });
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return "text-yellow-600";
            case "accepted":
                return "text-green-600";
            case "completed":
                return "text-blue-600";
            case "cancelled":
            case "rejected":
                return "text-red-600";
            case "mixed":
                return "text-orange-600";
            default:
                return "text-gray-600";
        }
    };

    const formatStatus = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    };

    const handleGroupClick = (group: BookingGroup) => {
        setSelectedBookingGroup(group);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedBookingGroup(null);
    };

    const handleGroupUpdate = (updatedGroup: BookingGroup) => {
        setLocalBookings((prevBookings) =>
            prevBookings.map((booking) => {
                const updatedBooking = updatedGroup.bookings.find(
                    (b) => b.id === booking.id
                );
                return updatedBooking || booking;
            })
        );
        setSelectedBookingGroup(updatedGroup);
    };

    const goToPage = (page: number) => {
        setCurrentPage(page);
    };

    const goToPrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const getVisiblePages = () => {
        const maxVisible = 10;
        const start = Math.max(
            1,
            Math.min(currentPage - 5, totalPages - maxVisible + 1)
        );
        const end = Math.min(totalPages, start + maxVisible - 1);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    return (
        <SearchProvider types={[]}>
            <div className="p-6 max-w-7xl mx-auto">
                <HeaderPanel
                    user={user}
                    search={false}
                    mechanic={userType != "customer"}
                />
                <div className="mb-8 pt-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Booking requests
                    </h1>
                    <p className="text-gray-600">
                        Manage your appointments and installations.
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                            All booking requests
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                                        Booking
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/3">
                                        <div className="grid grid-cols-5 gap-4">
                                            <span>Parts</span>
                                            <span>Total price</span>
                                            <span>Date</span>
                                            <span>Status</span>
                                            <span>
                                                {userType === "customer"
                                                    ? "Mechanic"
                                                    : "Customer"}
                                            </span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentGroups.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={2}
                                            className="px-6 py-12 text-center text-gray-500"
                                        >
                                            No booking requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    currentGroups.map((group) => (
                                        <tr
                                            key={group.booking_group_id}
                                            onClick={() =>
                                                handleGroupClick(group)
                                            }
                                            className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap w-1/3">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {group.vehicle?.name ||
                                                            "Unknown Vehicle"}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {group.vehicle?.make}{" "}
                                                        {group.vehicle?.model}{" "}
                                                        {group.vehicle?.year}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 w-2/3">
                                                <div className="grid grid-cols-5 gap-4 items-center">
                                                    <div>
                                                        <div className="text-sm text-gray-900">
                                                            {
                                                                group.bookings
                                                                    .length
                                                            }{" "}
                                                            parts
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {group.bookings.reduce(
                                                                (sum, b) =>
                                                                    sum +
                                                                    (b.quantity ||
                                                                        1),
                                                                0
                                                            )}{" "}
                                                            total qty
                                                        </div>
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatPrice(
                                                            group.totalPrice
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-900">
                                                        {formatDate(group.date)}
                                                    </div>
                                                    <div>
                                                        <div
                                                            className={`flex items-center text-sm font-medium ${getStatusColor(
                                                                group.status
                                                            )}`}
                                                        >
                                                            <div
                                                                className={`w-2 h-2 rounded-full mr-2 ${
                                                                    group.status?.toLowerCase() ===
                                                                    "pending"
                                                                        ? "bg-yellow-600"
                                                                        : group.status?.toLowerCase() ===
                                                                          "accepted"
                                                                        ? "bg-green-600"
                                                                        : group.status?.toLowerCase() ===
                                                                          "completed"
                                                                        ? "bg-blue-600"
                                                                        : group.status?.toLowerCase() ===
                                                                              "cancelled" ||
                                                                          group.status?.toLowerCase() ===
                                                                              "rejected"
                                                                        ? "bg-red-600"
                                                                        : group.status?.toLowerCase() ===
                                                                          "mixed"
                                                                        ? "bg-orange-600"
                                                                        : "bg-gray-600"
                                                                }`}
                                                            ></div>
                                                            {formatStatus(
                                                                group.status
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        {userType ===
                                                        "customer" ? (
                                                            <div className="flex items-center">
                                                                <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden mr-3">
                                                                    {group
                                                                        .mechanic
                                                                        ?.url ? (
                                                                        <Image
                                                                            src={
                                                                                group
                                                                                    .mechanic
                                                                                    .url
                                                                            }
                                                                            alt={
                                                                                group
                                                                                    .mechanic
                                                                                    .name ||
                                                                                "Mechanic"
                                                                            }
                                                                            width={
                                                                                32
                                                                            }
                                                                            height={
                                                                                32
                                                                            }
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <span className="text-xs font-medium text-gray-600">
                                                                            {group.mechanic?.name?.charAt(
                                                                                0
                                                                            ) ||
                                                                                "M"}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="text-sm font-medium text-gray-900 truncate">
                                                                        {group
                                                                            .mechanic
                                                                            ?.name ||
                                                                            "Unassigned"}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 truncate">
                                                                        {group
                                                                            .mechanic
                                                                            ?.email ||
                                                                            "No email"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center">
                                                                <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden mr-3">
                                                                    <span className="text-xs font-medium text-gray-600">
                                                                        {group.bookings[0]?.users?.name?.charAt(
                                                                            0
                                                                        ) ||
                                                                            "C"}
                                                                    </span>
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="text-sm font-medium text-gray-900 truncate">
                                                                        {group
                                                                            .bookings[0]
                                                                            ?.users
                                                                            ?.name ||
                                                                            "Unknown Customer"}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 truncate">
                                                                        {group
                                                                            .bookings[0]
                                                                            ?.users
                                                                            ?.email ||
                                                                            "No email"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                {getVisiblePages().map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        onClick={() => goToPage(pageNum)}
                                        className={`px-3 py-1 text-sm border rounded transition-colors duration-200 ${
                                            pageNum === currentPage
                                                ? "bg-blue-500 text-white border-blue-500"
                                                : "border-gray-300 hover:bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={goToPrevious}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 transition-colors duration-200"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={goToNext}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 transition-colors duration-200"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {selectedBookingGroup && (
                    <BookingGroupModal
                        isOpen={showModal}
                        onClose={handleCloseModal}
                        bookingGroup={selectedBookingGroup}
                        onUpdate={handleGroupUpdate}
                        userType={userType}
                    />
                )}
            </div>
        </SearchProvider>
    );
}
