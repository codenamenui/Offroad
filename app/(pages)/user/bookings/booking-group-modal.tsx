"use client";

import { useState } from "react";
import { Tables } from "@/data/database.types";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

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
  const [currentBookingGroup, setCurrentBookingGroup] = useState(bookingGroup);
  const router = useRouter();

  if (!isOpen) return null;

  const formatPrice = (price: number | null) => {
    if (!price) return "₱0";
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

      const updatedBookings = currentBookingGroup.bookings.map((booking) => ({
        ...booking,
        status: newStatus,
      }));

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
  const handleAcceptGroup = () => handleGroupStatusChange("accepted");
  const handleRejectGroup = () => handleGroupStatusChange("rejected");

  const handleChangeInEditor = () => {
    router.push(
      `/user/editor?edit_booking=${currentBookingGroup.booking_group_id}`
    );
    onClose();
  };

  const canModify = currentBookingGroup.status === "pending";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md mx-auto max-h-screen overflow-y-auto">
        {/* Vehicle Image */}
        <div className="relative">
          {currentBookingGroup.vehicle?.url ? (
            <Image
              src={currentBookingGroup.vehicle.url}
              alt={currentBookingGroup.vehicle.name || "Vehicle"}
              width={400}
              height={200}
              className="w-full h-48 object-contain rounded-t-2xl bg-gray-50 px-4 pt-4"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 rounded-t-2xl flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50"
          >
            <span className="text-gray-600 text-lg">×</span>
          </button>
        </div>

        <div className="px-6 pb-6">
          {/* Booking Details Header */}
          <div className="mt-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Booking Details
            </h2>
            <p className="text-gray-600 text-sm">
              {currentBookingGroup.vehicle?.name || "Unknown Vehicle"}
            </p>
          </div>

          {/* Customer/Mechanic Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Mechanic Name</p>
              <p className="font-medium text-gray-900">
                {currentBookingGroup.mechanic?.name || "Unassigned"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    currentBookingGroup.status === "pending"
                      ? "bg-orange-400"
                      : currentBookingGroup.status === "accepted"
                      ? "bg-green-400"
                      : currentBookingGroup.status === "completed"
                      ? "bg-blue-400"
                      : "bg-red-400"
                  }`}
                ></div>
                <span className="text-sm font-medium capitalize">
                  {currentBookingGroup.status}
                </span>
              </div>
            </div>
          </div>

          {/* Parts Ordered Section */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Parts Ordered</h3>
            <div className="space-y-4">
              {currentBookingGroup.bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border-b border-gray-100 pb-4 last:border-b-0"
                >
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {booking.parts?.name || "Unknown Part"}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {booking.parts?.description || "No description available"}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                          />
                        </svg>
                        Quantity: {booking.quantity || 1}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                        </svg>
                        {formatPrice(booking.parts?.price)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total:</span>
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(currentBookingGroup.totalPrice)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>

            {userType === "customer" && canModify && (
              <>
                <button
                  onClick={handleChangeInEditor}
                  className="w-full py-3 bg-orange-400 text-white rounded-xl font-medium hover:bg-orange-500 transition-colors"
                  disabled={isLoading}
                >
                  Change in Editor
                </button>
                <button
                  onClick={handleCancelGroup}
                  className="w-full py-3 border border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Cancelling..." : "Cancel Booking"}
                </button>
              </>
            )}

            {userType === "mechanic" && canModify && (
              <>
                <button
                  onClick={handleAcceptGroup}
                  className="w-full py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Accepting..." : "Accept Order"}
                </button>
                <button
                  onClick={handleRejectGroup}
                  className="w-full py-3 border border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Rejecting..." : "Reject Order"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
