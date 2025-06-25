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

    const getAvailableQuantity = (part) => {
        if (isEditMode) {
            const originalBookingQuantity = editBookingData[part.id] || 0;
            const customization = customizations.parts.find((c) => {
                return c.part.id == part.id;
            });
            if (customization)
                return (
                    part.available_quantity +
                    part.booked_quantity -
                    customization.quantity
                );
            return part.available_quantity + originalBookingQuantity;
        } else {
            return part.available_quantity;
        }
    };

    const handleAddPart = (part) => {
        const currentQuantity =
            customizations?.parts?.find((c) => c.part.id === part.id)
                ?.quantity || 0;

        const maxAvailable = getAvailableQuantity(part);

        if (currentQuantity < maxAvailable) {
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
                {filteredParts.map((part) => {
                    const maxAvailable = getAvailableQuantity(part);
                    const currentQuantity =
                        customizations?.parts?.find(
                            (c) => c.part.id === part.id
                        )?.quantity || 0;
                    let remainingAvailable;
                    if (isEditMode) {
                        remainingAvailable = maxAvailable;
                    } else {
                        remainingAvailable = maxAvailable - currentQuantity;
                    }
                    return (
                        <PartItem
                            key={part.id}
                            part={part}
                            onAddPart={() => handleAddPart(part)}
                            isDisabled={remainingAvailable <= 0}
                            availableQuantity={remainingAvailable}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default SearchPanel;
