import { useState } from "react";
import MechanicSelectionModal from "./mechanic-selection-modal";
import DateSelectionModal from "./date-selection-modal";
import BookingConfirmationModal from "./booking-confirmation-modal";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const VehiclePanel = ({
    vehicles,
    selectedVehicleId,
    setSelectedVehicleId,
    customizations,
    setCustomizations,
    parts,
    mechanics,
    isEditMode = false,
    editBookingGroupId = null,
    setIsEditMode,
    editBookingData = {},
}) => {
    const [showMechanicModal, setShowMechanicModal] = useState(false);
    const [showDateModal, setShowDateModal] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [bookingData, setBookingData] = useState({
        mechanic_id: null,
        date: null,
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const getAvailableQuantity = (part) => {
        if (isEditMode) {
            const originalBookingQuantity = editBookingData[part.id] || 0;
            return part.available_quantity + originalBookingQuantity;
        } else {
            return part.available_quantity;
        }
    };

    const updatePartQuantity = (part, newQuantity) => {
        if (newQuantity < 0 || isUpdating || isLoading) return;

        const maxAvailable = getAvailableQuantity(part);

        if (newQuantity > maxAvailable) return;

        setCustomizations((prev) => {
            const currentParts = prev?.parts || [];
            const existingIndex = currentParts.findIndex(
                (c) => c.part.id === part.id
            );

            if (newQuantity === 0) {
                if (existingIndex !== -1) {
                    return {
                        parts: currentParts.filter(
                            (c) => c.part.id !== part.id
                        ),
                    };
                }
                return prev || { parts: [] };
            }

            if (existingIndex !== -1) {
                const updatedParts = [...currentParts];
                updatedParts[existingIndex] = { part, quantity: newQuantity };
                return { parts: updatedParts };
            } else {
                return {
                    parts: [...currentParts, { part, quantity: newQuantity }],
                };
            }
        });
    };

    const getTotalPrice = () => {
        return (
            customizations?.parts
                ?.filter(
                    (customization) =>
                        customization.part.vehicle_id === selectedVehicleId
                )
                .reduce((total, customization) => {
                    return (
                        total +
                        customization.part.price * customization.quantity
                    );
                }, 0) || 0
        );
    };

    const filteredCustomizations =
        customizations?.parts?.filter(
            (customization) =>
                customization.part.vehicle_id === selectedVehicleId
        ) || [];

    const handleBookNow = () => {
        if (filteredCustomizations.length > 0 && !isUpdating && !isLoading) {
            setShowDateModal(true);
        }
    };

    const handleUpdateBooking = () => {
        if (filteredCustomizations.length > 0 && !isUpdating && !isLoading) {
            setShowDateModal(true);
        }
    };

    const handleDateNext = (selectedDate) => {
        setBookingData((prev) => ({ ...prev, date: selectedDate }));
        setShowDateModal(false);
        setShowMechanicModal(true);
    };

    const handleMechanicNext = () => {
        setShowMechanicModal(false);
        setShowConfirmationModal(true);
    };

    const handleMechanicBack = () => {
        setShowMechanicModal(false);
        setShowDateModal(true);
    };

    const handleConfirmBooking = async () => {
        setIsUpdating(true);
        setIsLoading(true);
        try {
            if (isEditMode) {
                await updateBookingInSupabase();
            } else {
                await submitBookingToSupabase();
            }
        } finally {
            setIsUpdating(false);
            setIsLoading(false);
        }
    };

    const handleCancelBooking = () => {
        setShowConfirmationModal(false);
        setBookingData({ mechanic_id: null, date: null });
    };

    const handleCloseDateModal = () => {
        setShowDateModal(false);
        setBookingData((prev) => ({ ...prev, date: null }));
    };

    const handleCloseMechanicModal = () => {
        setShowMechanicModal(false);
        setBookingData((prev) => ({ ...prev, mechanic_id: null }));
    };

    const handleCancelEdit = () => {
        if (isUpdating || isLoading) return;
        setIsEditMode(false);
        setCustomizations({ parts: [] });
        window.location.href = "/user/editor"; // This will do a full page reload
    };

    const refreshPartsAvailability = async () => {
        const supabase = await createClient();

        const bookingsQuery = supabase
            .from("bookings")
            .select("part_id, quantity")
            .in("status", ["pending", "accepted", "in_progress"]);

        const { data: bookings } = await bookingsQuery;

        const bookingsByPart =
            bookings?.reduce((acc, booking) => {
                if (!acc[booking.part_id]) {
                    acc[booking.part_id] = 0;
                }
                acc[booking.part_id] += booking.quantity || 0;
                return acc;
            }, {}) || {};

        return bookingsByPart;
    };

    const submitBookingToSupabase = async () => {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const updatedBookings = await refreshPartsAvailability();

        for (const customization of filteredCustomizations) {
            const currentlyBooked = updatedBookings[customization.part.id] || 0;
            const availableNow = customization.part.stock - currentlyBooked;

            if (customization.quantity > availableNow) {
                window.alert(
                    `Not enough stock for ${customization.part.name}. Available: ${availableNow}, Requested: ${customization.quantity}`
                );
                return;
            }
        }

        const { data: group } = await supabase
            .from("booking_groups")
            .insert({ user_id: user.id })
            .select("id")
            .single();

        const bookingRecords = filteredCustomizations.map((customization) => ({
            part_id: customization.part.id,
            mechanic_id: bookingData.mechanic_id,
            user_id: user.id,
            quantity: customization.quantity,
            date: bookingData.date,
            status: "pending",
            booking_group_id: group ? group.id : -1,
        }));

        const { error } = await supabase
            .from("bookings")
            .insert(bookingRecords);

        if (error) {
            console.error("Error inserting bookings:", error);
            window.alert("Error creating booking. Please try again.");
            return;
        }

        setCustomizations({
            parts: [],
        });
        setShowConfirmationModal(false);
        setBookingData({ mechanic_id: null, date: null });
        window.location.reload(); // Add this line
    };

    const updateBookingInSupabase = async () => {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const updatedBookings = await refreshPartsAvailability();

        for (const customization of filteredCustomizations) {
            const currentlyBooked = updatedBookings[customization.part.id] || 0;
            const currentEditQuantity =
                editBookingData[customization.part.id] || 0;
            const availableNow =
                customization.part.stock -
                currentlyBooked +
                currentEditQuantity;

            if (customization.quantity > availableNow) {
                window.alert(
                    `Not enough stock for ${customization.part.name}. Available: ${availableNow}, Requested: ${customization.quantity}`
                );
                return;
            }
        }

        await supabase
            .from("bookings")
            .delete()
            .eq("booking_group_id", editBookingGroupId);

        const bookingRecords = filteredCustomizations.map((customization) => ({
            part_id: customization.part.id,
            mechanic_id: bookingData.mechanic_id,
            user_id: user.id,
            quantity: customization.quantity,
            date: bookingData.date,
            status: "pending",
            booking_group_id: editBookingGroupId,
        }));

        const { error } = await supabase
            .from("bookings")
            .insert(bookingRecords);

        if (error) {
            console.error("Error updating bookings:", error);
            window.alert("Error updating booking. Please try again.");
            return;
        }

        setIsEditMode(false);
        setCustomizations({
            parts: [],
        });
        setShowConfirmationModal(false);
        setBookingData({ mechanic_id: null, date: null });
        router.push("/user/bookings");
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="flex rounded-lg overflow-hidden border border-gray-300 mb-8">
                {vehicles.map((vehicle) => (
                    <button
                        key={vehicle.id}
                        onClick={() => setSelectedVehicleId(vehicle.id)}
                        className={`
                            flex-1 py-3 px-6 font-medium transition-all duration-200 border-r border-gray-300 last:border-r-0
                            ${
                                selectedVehicleId === vehicle.id
                                    ? "bg-gray-100 text-gray-900"
                                    : "bg-white text-gray-600 hover:bg-gray-50"
                            }
                            ${
                                isEditMode || isUpdating
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                            }
                        `}
                        disabled={isEditMode || isUpdating}
                    >
                        {vehicle.name}
                    </button>
                ))}
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {isEditMode ? "Edit Booking" : "Selected Parts"}
            </h3>

            {filteredCustomizations.length > 0 ? (
                <div className="space-y-4">
                    {filteredCustomizations.map((customization) => (
                        <div
                            key={customization.part.id}
                            className="flex items-center justify-between py-3"
                        >
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() =>
                                        updatePartQuantity(
                                            parts.find(
                                                (part) =>
                                                    part.id ==
                                                    customization.part.id
                                            ),
                                            customization.quantity - 1
                                        )
                                    }
                                    disabled={isUpdating || isLoading}
                                    className="text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
                                >
                                    −
                                </button>

                                <div className="font-medium text-gray-900">
                                    {customization.part.name}
                                </div>

                                <div className="bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                                    ×{customization.quantity}
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-lg font-semibold text-gray-900 min-w-[80px] text-right">
                                    ₱
                                    {(
                                        customization.part.price *
                                        customization.quantity
                                    ).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="pt-4 border-t border-gray-200">
                        <div className="text-xl font-semibold text-gray-900 text-right">
                            Total: ₱{getTotalPrice().toFixed(2)}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <div className="text-lg">No parts selected</div>
                    <div className="text-sm">
                        Add parts to your cart to continue
                    </div>
                </div>
            )}

            <div className="flex justify-center gap-4 pt-8">
                {isEditMode ? (
                    <>
                        <button
                            onClick={handleUpdateBooking}
                            disabled={
                                isUpdating ||
                                isLoading ||
                                filteredCustomizations.length === 0
                            }
                            className="bg-amber-500 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200"
                        >
                            {isUpdating || isLoading
                                ? "Processing..."
                                : "Update Booking"}
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            disabled={isUpdating || isLoading}
                            className="bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-semibold py-3 px-8 rounded-lg transition-all duration-200"
                        >
                            Cancel Edit
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleBookNow}
                        disabled={
                            isUpdating ||
                            isLoading ||
                            filteredCustomizations.length === 0
                        }
                        className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200"
                    >
                        {isUpdating || isLoading ? "Processing..." : "Book Now"}
                    </button>
                )}
            </div>

            <DateSelectionModal
                isOpen={showDateModal}
                onClose={handleCloseDateModal}
                onNext={handleDateNext}
            />

            <MechanicSelectionModal
                isOpen={showMechanicModal}
                onClose={handleCloseMechanicModal}
                onBack={handleMechanicBack}
                mechanics={mechanics}
                onNext={handleMechanicNext}
                bookingData={bookingData}
                setBookingData={setBookingData}
                selectedDate={bookingData.date}
            />

            <BookingConfirmationModal
                isOpen={showConfirmationModal}
                onConfirm={handleConfirmBooking}
                onCancel={handleCancelBooking}
                bookingData={bookingData}
            />
        </div>
    );
};

export default VehiclePanel;
