"use client";

import React, { useState } from "react";
import VehiclePanel from "./vehicle";
import SearchPanel from "./search";
import { Tables } from "@/data/database.types";
import Image from "next/image";

interface DashboardClientProps {
    vehicles: Tables<"vehicles">[];
    parts: Tables<"parts">[];
    types: Tables<"types">[];
    mechanics: Tables<"mechanics">[];
}

type Part = Tables<"parts">;

type Customizations = {
    parts: Customization[];
};

type Customization = {
    part: Part;
    quantity: number;
};

const DashboardPanel = ({
    vehicles,
    parts,
    types,
    mechanics,
}: DashboardClientProps) => {
    const [selectedVehicleId, setSelectedVehicleId] = useState(
        vehicles[0]?.id || 1
    );

    const [customizations, setCustomizations] = useState<Customizations>({
        parts: [],
    });

    const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

    return (
        <div className="flex">
            <VehiclePanel
                vehicles={vehicles}
                selectedVehicleId={selectedVehicleId}
                setSelectedVehicleId={setSelectedVehicleId}
                customizations={customizations}
                setCustomizations={setCustomizations}
                mechanics={mechanics}
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
                    types={types}
                    customizations={customizations}
                    setCustomizations={setCustomizations}
                />
            </div>
        </div>
    );
};

export default DashboardPanel;
