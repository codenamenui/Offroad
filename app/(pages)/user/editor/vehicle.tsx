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
        const currentBookingQuantity =
            isEditMode && editBookingData[part.id]
                ? editBookingData[part.id]
                : 0;
        const currentCustomizationQuantity =
            customizations?.parts?.find((c) => c.part.id === part.id)
                ?.quantity || 0;

        return (
            part.available_quantity +
            currentBookingQuantity -
            currentCustomizationQuantity
        );
    };

    const updatePartQuantity = (part, newQuantity) => {
        if (newQuantity < 0 || isUpdating || isLoading) return;

        const availableQuantity = getAvailableQuantity(part);

        if (
            newQuantity >
            availableQuantity +
                (customizations?.parts?.find((c) => c.part.id === part.id)
                    ?.quantity || 0)
        )
            return;

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
        router.push("/user/editor");
    };

    const refreshPartsAvailability = async () => {
        const supabase = await createClient();

        let bookingsQuery = supabase
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

    const isQuantityAtMax = (part) => {
        const currentQuantity =
            customizations?.parts?.find((c) => c.part.id === part.id)
                ?.quantity || 0;
        const availableQuantity = getAvailableQuantity(part);
        return currentQuantity >= availableQuantity + currentQuantity;
    };

    return (
        <div>
            <div>
                {vehicles.map((vehicle) => (
                    <button
                        key={vehicle.id}
                        onClick={() => setSelectedVehicleId(vehicle.id)}
                        className={
                            selectedVehicleId === vehicle.id ? "active" : ""
                        }
                        disabled={isEditMode || isUpdating}
                    >
                        {vehicle.name}
                    </button>
                ))}
            </div>

            <div>
                <h3>{isEditMode ? "Edit Booking" : "Customizations"}</h3>
                <div>
                    <strong>Total: ${getTotalPrice()}</strong>
                </div>
                {filteredCustomizations.map((customization) => (
                    <div key={customization.part.id}>
                        <span>{customization.part.name}</span>
                        <span>Unit Price: ${customization.part.price}</span>
                        <button
                            onClick={() =>
                                updatePartQuantity(
                                    customization.part,
                                    customization.quantity - 1
                                )
                            }
                            disabled={isUpdating || isLoading}
                        >
                            -
                        </button>
                        <span>{customization.quantity}</span>
                        <button
                            onClick={() =>
                                updatePartQuantity(
                                    customization.part,
                                    customization.quantity + 1
                                )
                            }
                            disabled={
                                isQuantityAtMax(customization.part) ||
                                isUpdating ||
                                isLoading
                            }
                        >
                            +
                        </button>
                        <span>
                            Total: $
                            {customization.part.price * customization.quantity}
                        </span>
                    </div>
                ))}

                {isEditMode ? (
                    <div>
                        <button
                            onClick={handleUpdateBooking}
                            disabled={isUpdating || isLoading}
                        >
                            {isUpdating || isLoading
                                ? "Processing..."
                                : "Update Booking"}
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            disabled={isUpdating || isLoading}
                        >
                            Cancel Edit
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleBookNow}
                        disabled={isUpdating || isLoading}
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
