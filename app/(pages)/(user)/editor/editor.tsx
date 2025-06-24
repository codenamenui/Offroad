"use client";

import React, { useEffect, useState } from "react";
import VehiclePanel from "./vehicle";
import SearchPanel from "./search";
import HeaderPanel, { SearchProvider } from "./header";
import { Tables } from "@/data/database.types";
import Image from "next/image";

interface EditorClientProps {
    vehicles: Tables<"vehicles">[];
    parts: Tables<"parts">[];
    types: Tables<"types">[];
    mechanics: Tables<"mechanics">[];
    user: { name: string };
    editBooking?: BookingWithDetails[] | null;
}

type Part = Tables<"parts">;
type Booking = Tables<"bookings">;

interface BookingWithDetails extends Booking {
    parts: Part & {
        vehicles: Tables<"vehicles">;
    };
    mechanics: Tables<"mechanics">;
}

type Customizations = {
    parts: Customization[];
};

type Customization = {
    part: Part;
    quantity: number;
};

const EditorPanel = ({
    vehicles,
    parts,
    types,
    mechanics,
    user,
    editBooking,
}: EditorClientProps) => {
    const [selectedVehicleId, setSelectedVehicleId] = useState(
        vehicles[0]?.id || 1
    );
    const [customizations, setCustomizations] = useState<Customizations>({
        parts: [],
    });
    const [isEditMode, setIsEditMode] = useState(false);
    const [editBookingGroupId, setEditBookingGroupId] = useState<number | null>(
        null
    );

    useEffect(() => {
        if (editBooking && editBooking.length > 0) {
            setIsEditMode(true);
            setEditBookingGroupId(editBooking[0].booking_group_id);

            const vehicleId = editBooking[0].parts.vehicle_id;
            setSelectedVehicleId(vehicleId);

            const editCustomizations = editBooking.map((booking) => ({
                part: booking.parts,
                quantity: booking.quantity || 1,
            }));

            setCustomizations({
                parts: editCustomizations,
            });
        }
    }, [editBooking]);

    const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

    return (
        <SearchProvider types={types}>
            <HeaderPanel user={user} search={true} />
            <div className="flex">
                <VehiclePanel
                    vehicles={vehicles}
                    selectedVehicleId={selectedVehicleId}
                    setSelectedVehicleId={setSelectedVehicleId}
                    customizations={customizations}
                    setCustomizations={setCustomizations}
                    mechanics={mechanics}
                    isEditMode={isEditMode}
                    setIsEditMode={setIsEditMode}
                    editBookingGroupId={editBookingGroupId}
                />
                <div className="flex flex-col">
                    <Image
                        src={selectedVehicle?.url}
                        alt={selectedVehicle?.name}
                        width="300"
                        height="200"
                    />
                    <SearchPanel
                        selectedVehicleId={selectedVehicleId}
                        parts={parts}
                        customizations={customizations}
                        setCustomizations={setCustomizations}
                    />
                </div>
            </div>
        </SearchProvider>
    );
};

export default EditorPanel;
