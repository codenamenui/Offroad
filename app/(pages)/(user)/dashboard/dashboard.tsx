"use client";

import React, { useState } from "react";
import VehiclePanel from "./vehicle";
import SearchPanel from "./search";
import HeaderPanel, { SearchProvider } from "./header";
import { Tables } from "@/data/database.types";
import Image from "next/image";

interface DashboardClientProps {
    vehicles: Tables<"vehicles">[];
    parts: Tables<"parts">[];
    types: Tables<"types">[];
    mechanics: Tables<"mechanics">[];
    user: { name: string };
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
    user,
}: DashboardClientProps) => {
    const [selectedVehicleId, setSelectedVehicleId] = useState(
        vehicles[0]?.id || 1
    );

    const [customizations, setCustomizations] = useState<Customizations>({
        parts: [],
    });
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

export default DashboardPanel;
