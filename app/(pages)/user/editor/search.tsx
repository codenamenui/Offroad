import React, { useMemo } from "react";
import PartItem from "./part-item";
import { useSearch } from "../../../../components/header";

const SearchPanel = ({
    selectedVehicleId,
    parts,
    customizations,
    setCustomizations,
    isEditMode = false,
    editBookingData = {},
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

    // Same logic as VehiclePanel for getting available quantity
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

    const handleAddPart = (part) => {
        const currentQuantity =
            customizations?.parts?.find((c) => c.part.id === part.id)
                ?.quantity || 0;

        const availableQuantity = getAvailableQuantity(part);

        // Check if we can add more (same logic as VehiclePanel)
        if (currentQuantity < availableQuantity + currentQuantity) {
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
        <div>
            <div>
                {filteredParts.map((part) => (
                    <PartItem
                        key={part.id}
                        part={part}
                        onAddPart={() => handleAddPart(part)}
                        isDisabled={
                            getAvailableQuantity(part) <= 0 ||
                            (customizations?.parts?.find(
                                (c) => c.part.id === part.id
                            )?.quantity || 0) >=
                                getAvailableQuantity(part) +
                                    (customizations?.parts?.find(
                                        (c) => c.part.id === part.id
                                    )?.quantity || 0)
                        }
                        availableQuantity={getAvailableQuantity(part)}
                    />
                ))}
            </div>
        </div>
    );
};

export default SearchPanel;
