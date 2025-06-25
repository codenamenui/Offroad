import React, { useMemo, useState, useRef } from "react";
import PartItem from "./part-item";
import { useSearch } from "../../../../components/header";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SearchPanel = ({
    selectedVehicleId,
    parts,
    customizations,
    setCustomizations,
    isEditMode = false,
}) => {
    const { searchTerm, selectedTypes } = useSearch();
    const [scrollPosition, setScrollPosition] = useState(0);
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startScrollLeft, setStartScrollLeft] = useState(0);

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

        let maxAllowed;

        if (isEditMode) {
            maxAllowed =
                part.stock - part.booked_quantity + part.edit_booking_quantity;
        } else {
            maxAllowed = part.available_quantity;
        }

        if (currentQuantity < maxAllowed) {
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

    const scrollLeft = () => {
        if (containerRef.current) {
            const newPosition = Math.max(0, scrollPosition - 300);
            setScrollPosition(newPosition);
            containerRef.current.scrollTo({
                left: newPosition,
                behavior: "smooth",
            });
        }
    };

    const scrollRight = () => {
        if (containerRef.current) {
            const maxScroll =
                containerRef.current.scrollWidth -
                containerRef.current.clientWidth;
            const newPosition = Math.min(maxScroll, scrollPosition + 300);
            setScrollPosition(newPosition);
            containerRef.current.scrollTo({
                left: newPosition,
                behavior: "smooth",
            });
        }
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - containerRef.current.offsetLeft);
        setStartScrollLeft(containerRef.current.scrollLeft);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - containerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        containerRef.current.scrollLeft = startScrollLeft - walk;
        setScrollPosition(containerRef.current.scrollLeft);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const canScrollLeft = scrollPosition > 0;
    const canScrollRight =
        containerRef.current &&
        scrollPosition <
            containerRef.current.scrollWidth - containerRef.current.clientWidth;

    if (filteredParts.length === 0) {
        return (
            <div className="h-full flex items-center justify-center p-4">
                <p className="text-gray-500">No parts found</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-4 relative">
            <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button
                    onClick={scrollLeft}
                    disabled={!canScrollLeft}
                    className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                    onClick={scrollRight}
                    disabled={!canScrollRight}
                    className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            <div
                ref={containerRef}
                className={`h-full overflow-x-auto overflow-y-hidden scrollbar-hide ${
                    isDragging ? "cursor-grabbing" : "cursor-grab"
                }`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                <div className="flex gap-4 h-full pb-4">
                    {filteredParts.map((part) => {
                        const currentQuantity =
                            customizations?.parts?.find(
                                (c) => c.part.id === part.id
                            )?.quantity || 0;

                        let maxAllowed;
                        let remainingAvailable;

                        if (isEditMode) {
                            maxAllowed =
                                part.stock -
                                part.booked_quantity +
                                part.edit_booking_quantity;
                            remainingAvailable = maxAllowed - currentQuantity;
                        } else {
                            maxAllowed = part.available_quantity;
                            remainingAvailable = maxAllowed - currentQuantity;
                        }

                        return (
                            <div key={part.id} className="flex-shrink-0 w-64">
                                <PartItem
                                    part={part}
                                    onAddPart={() => handleAddPart(part)}
                                    isDisabled={remainingAvailable <= 0}
                                    availableQuantity={remainingAvailable}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SearchPanel;
