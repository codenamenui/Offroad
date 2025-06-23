"use client";

import React, { useState } from "react";
import VehiclePanel from "./vehicle";
import SearchPanel from "./search";

const DashboardPage = () => {
    const [selectedVehicleId, setSelectedVehicleId] = useState(1);

    const vehicles = [
        {
            id: 1,
            name: "Vehicle 1",
            image: "https://via.placeholder.com/300x200",
        },
        {
            id: 2,
            name: "Vehicle 2",
            image: "https://via.placeholder.com/300x200",
        },
        {
            id: 3,
            name: "Vehicle 3",
            image: "https://via.placeholder.com/300x200",
        },
    ];

    return (
        <div>
            <h1>Dashboard</h1>
            <VehiclePanel
                vehicles={vehicles}
                selectedVehicleId={selectedVehicleId}
                setSelectedVehicleId={setSelectedVehicleId}
            />
            <SearchPanel />
        </div>
    );
};

export default DashboardPage;
