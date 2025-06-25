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
                return "bg-yellow-100 text-yellow-800";
            case "accepted":
                return "bg-green-100 text-green-800";
            case "completed":
                return "bg-blue-100 text-blue-800";
            case "cancelled":
            case "rejected":
                return "bg-red-100 text-red-800";
            case "mixed":
                return "bg-orange-100 text-orange-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
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

    return (
        <SearchProvider types={undefined}>
            <div className="p-6 max-w-7xl mx-auto">
                <HeaderPanel
                    user={user}
                    search={false}
                    mechanic={userType != "customer"}
                />
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Booking requests
                    </h1>
                    <p className="text-gray-600">
                        Manage your appointments and installations.
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow">
                    <div className="bg-gray-50 p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex-shrink-0">
                                <h3 className="font-semibold text-gray-900">
                                    Vehicle
                                </h3>
                            </div>

                            <div className="flex items-center space-x-6">
                                <div className="text-right">
                                    <h3 className="font-semibold text-gray-900">
                                        Parts Count
                                    </h3>
                                </div>

                                <div className="text-right">
                                    <h3 className="font-semibold text-gray-900">
                                        Total Price
                                    </h3>
                                </div>

                                <div className="text-right">
                                    <h3 className="font-semibold text-gray-900">
                                        Date
                                    </h3>
                                </div>

                                <div className="text-right">
                                    <h3 className="font-semibold text-gray-900">
                                        Status
                                    </h3>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10"></div>
                                    <div className="text-right">
                                        <h3 className="font-semibold text-gray-900">
                                            {userType === "customer"
                                                ? "Mechanic"
                                                : "Customer"}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden">
                        {currentGroups.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <p>No booking requests found.</p>
                            </div>
                        ) : (
                            currentGroups.map((group) => (
                                <button
                                    key={group.booking_group_id}
                                    onClick={() => handleGroupClick(group)}
                                    className="w-full p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 text-left"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-shrink-0">
                                            <h3 className="font-medium text-gray-900">
                                                {group.vehicle?.name ||
                                                    "Unknown Vehicle"}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {group.vehicle?.make}{" "}
                                                {group.vehicle?.model}{" "}
                                                {group.vehicle?.year}
                                            </p>
                                        </div>

                                        <div className="flex items-center space-x-6">
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">
                                                    {group.bookings.length}{" "}
                                                    parts
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {group.bookings.reduce(
                                                        (sum, b) =>
                                                            sum +
                                                            (b.quantity || 1),
                                                        0
                                                    )}{" "}
                                                    total qty
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">
                                                    {formatPrice(
                                                        group.totalPrice
                                                    )}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-gray-900">
                                                    {formatDate(group.date)}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                                        group.status
                                                    )}`}
                                                >
                                                    {group.status}
                                                </span>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                {userType === "customer" ? (
                                                    <>
                                                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                                                            {group.mechanic
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
                                                                    width={100}
                                                                    height={100}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-xs font-medium text-gray-600">
                                                                    {group.mechanic?.name?.charAt(
                                                                        0
                                                                    ) || "M"}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium text-gray-900">
                                                                {group.mechanic
                                                                    ?.name ||
                                                                    "Unassigned"}
                                                            </p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                                                            <span className="text-xs font-medium text-gray-600">
                                                                {group.bookings[0]?.users?.name?.charAt(
                                                                    0
                                                                ) || "C"}
                                                            </span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium text-gray-900">
                                                                {group
                                                                    .bookings[0]
                                                                    ?.users
                                                                    ?.name ||
                                                                    "Unknown Customer"}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {group
                                                                    .bookings[0]
                                                                    ?.users
                                                                    ?.contact_number ||
                                                                    "No contact"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Page {currentPage} of {totalPages}
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={goToPrevious}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                {Array.from(
                                    { length: Math.min(5, totalPages) },
                                    (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (
                                            currentPage >=
                                            totalPages - 2
                                        ) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() =>
                                                    goToPage(pageNum)
                                                }
                                                className={`px-3 py-1 text-sm border rounded ${
                                                    pageNum === currentPage
                                                        ? "bg-blue-500 text-white border-blue-500"
                                                        : "border-gray-300 hover:bg-gray-100"
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    }
                                )}

                                <button
                                    onClick={goToNext}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
