"use client";

import React, { useState } from "react";
import VehiclePanel from "./vehicle";
import SearchPanel from "./search";
import { Tables } from "@/data/database.types";

interface DashboardClientProps {
    vehicles: Tables<"vehicles">[];
    parts: Tables<"parts">[];
    types: Tables<"types">[];
}

type Part = Tables<"parts">;

type Customizations = {
    parts: Customization[];
};

type Customization = {
    part: Part;
    quantity: number;
};

const DashboardPanel = ({ vehicles, parts, types }: DashboardClientProps) => {
    const [selectedVehicleId, setSelectedVehicleId] = useState(
        vehicles[0]?.id || 1
    );

    const [customizations, setCustomizations] = useState<Customizations>({
        parts: [],
    });

    return (
        <div className="flex">
            <VehiclePanel
                vehicles={vehicles}
                selectedVehicleId={selectedVehicleId}
                setSelectedVehicleId={setSelectedVehicleId}
                customizations={customizations}
                setCustomizations={setCustomizations}
                parts={parts}
            />
            <SearchPanel
                selectedVehicleId={selectedVehicleId}
                parts={parts}
                types={types}
                customizations={customizations}
                setCustomizations={setCustomizations}
            />
        </div>
    );
};

export default DashboardPanel;
