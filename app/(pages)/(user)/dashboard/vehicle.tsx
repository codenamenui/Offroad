import { useState } from "react";
import MechanicSelectionModal from "./mechanic-selection-modal";
import DateSelectionModal from "./date-selection-modal";
import BookingConfirmationModal from "./booking-confirmation-modal";
import { createClient } from "@/utils/supabase/client";

const VehiclePanel = ({
    vehicles,
    selectedVehicleId,
    setSelectedVehicleId,
    customizations,
    setCustomizations,
    mechanics,
}) => {
    const [showMechanicModal, setShowMechanicModal] = useState(false);
    const [showDateModal, setShowDateModal] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [bookingData, setBookingData] = useState({
        mechanic_id: null,
        date: null,
    });

    const updatePartQuantity = (part, newQuantity) => {
        if (newQuantity < 0 || newQuantity > part.stock) return;

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
        if (filteredCustomizations.length > 0) {
            setShowMechanicModal(true);
        }
    };

    const handleMechanicNext = () => {
        setShowMechanicModal(false);
        setShowDateModal(true);
    };

    const handleDateNext = (selectedDate) => {
        setBookingData((prev) => ({ ...prev, date: selectedDate }));
        setShowDateModal(false);
        setShowConfirmationModal(true);
    };

    const handleConfirmBooking = async () => {
        await submitBookingToSupabase();
        setShowConfirmationModal(false);
        setBookingData({ mechanic_id: null, date: null });
    };

    const handleCancelBooking = () => {
        setShowConfirmationModal(false);
        setBookingData({ mechanic_id: null, date: null });
    };

    const handleCloseDateModal = () => {
        setShowDateModal(false);
        setBookingData((prev) => ({ ...prev, date: null }));
    };

    const submitBookingToSupabase = async () => {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

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

        if (error) console.error("Error inserting bookings:", error);

        setCustomizations({
            parts: [],
        });
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
                    >
                        {vehicle.name}
                    </button>
                ))}
            </div>

            <div>
                <h3>Customizations</h3>
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
                                customization.quantity >=
                                customization.part.stock
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
                <button onClick={handleBookNow}>Book Now</button>
            </div>

            <MechanicSelectionModal
                isOpen={showMechanicModal}
                onClose={() => setShowMechanicModal(false)}
                mechanics={mechanics}
                onNext={handleMechanicNext}
                bookingData={bookingData}
                setBookingData={setBookingData}
            />

            <DateSelectionModal
                isOpen={showDateModal}
                onClose={handleCloseDateModal}
                onNext={handleDateNext}
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
