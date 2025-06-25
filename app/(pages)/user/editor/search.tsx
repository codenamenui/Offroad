import React, { useMemo } from "react";
import PartItem from "./part-item";
import { useSearch } from "../../../../components/header";

const SearchPanel = ({
    selectedVehicleId,
    parts,
    customizations,
    setCustomizations,
}) => {
    const { searchTerm, selectedTypes } = useSearch();

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
            <div className="flex">
                {filteredParts.map((part) => (
                    <PartItem
                        key={part.id}
                        part={part}
                        onAddPart={handleAddPart}
                    />
                ))}
            </div>
        </div>
    );
};

export default SearchPanel;
