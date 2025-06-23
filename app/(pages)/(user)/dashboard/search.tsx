import React, { useState, useMemo } from "react";
import PartItem from "./part-item";
import FilterPopup from "./filter-popup";

const SearchPanel = ({
    selectedVehicleId,
    parts,
    types,
    customizations,
    setCustomizations,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [showFilterPopup, setShowFilterPopup] = useState(false);

    const filteredParts = useMemo(() => {
        return parts.filter((part) => {
            const matchesVehicle = part.vehicle_id === selectedVehicleId;
            const matchesSearch = part.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            const matchesType =
                selectedTypes.length === 0 ||
                selectedTypes.includes(part.type_id);
            return matchesVehicle && matchesSearch && matchesType;
        });
    }, [parts, selectedVehicleId, searchTerm, selectedTypes]);

    const handleTypeToggle = (typeId) => {
        setSelectedTypes((prev) =>
            prev.includes(typeId)
                ? prev.filter((id) => id !== typeId)
                : [...prev, typeId]
        );
    };

    const handleAddPart = (part) => {
        const currentQuantity =
            customizations?.parts?.find((c) => c.part.id === part.id)
                ?.quantity || 0;

        if (currentQuantity < part.stock) {
            setCustomizations((prev) => {
                const currentParts = prev?.parts || [];
                const existingIndex = currentParts.findIndex(
                    (c) => c.part.id === part.id
                );

                if (existingIndex !== -1) {
                    const updatedParts = [...currentParts];
                    updatedParts[existingIndex] = {
                        part,
                        quantity: currentQuantity + 1,
                    };
                    return { parts: updatedParts };
                } else {
                    return {
                        parts: [...currentParts, { part, quantity: 1 }],
                    };
                }
            });
        }
    };

    return (
        <div className="border-l-2 p-4">
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search parts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border p-2 w-full mb-2"
                />
                <button
                    onClick={() => setShowFilterPopup(true)}
                    className="border p-2"
                >
                    Filter by Type
                </button>
            </div>

            <div className="grid gap-4">
                {filteredParts.map((part) => (
                    <PartItem
                        key={part.id}
                        part={part}
                        onAddPart={handleAddPart}
                    />
                ))}
            </div>

            {showFilterPopup && (
                <FilterPopup
                    types={types}
                    selectedTypes={selectedTypes}
                    onTypeToggle={handleTypeToggle}
                    onClose={() => setShowFilterPopup(false)}
                />
            )}
        </div>
    );
};

export default SearchPanel;
