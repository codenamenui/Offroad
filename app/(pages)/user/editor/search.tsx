// SearchPanel.tsx - Fixed horizontal scrolling
import React, { useMemo, useState, useRef, useEffect } from "react";
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
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
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

    // Update scroll button states
    const updateScrollButtons = () => {
        if (containerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // -1 for rounding
            setScrollPosition(scrollLeft);
        }
    };

    // Handle mouse wheel for horizontal scrolling
    const handleWheel = (e) => {
        if (containerRef.current) {
            // Prevent default vertical scrolling
            e.preventDefault();
            
            // Convert vertical wheel movement to horizontal scroll
            const scrollAmount = e.deltaY * 2; // Multiply for faster scrolling
            containerRef.current.scrollLeft += scrollAmount;
        }
    };

    // Initialize scroll buttons and listen for container changes
    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            // Initial check
            updateScrollButtons();
            
            // Listen for scroll events
            container.addEventListener('scroll', updateScrollButtons);
            
            // Listen for wheel events for horizontal scrolling
            container.addEventListener('wheel', handleWheel, { passive: false });
            
            // Listen for resize events
            const resizeObserver = new ResizeObserver(updateScrollButtons);
            resizeObserver.observe(container);
            
            return () => {
                container.removeEventListener('scroll', updateScrollButtons);
                container.removeEventListener('wheel', handleWheel);
                resizeObserver.disconnect();
            };
        }
    }, [filteredParts]); // Re-run when parts change

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
            const newPosition = Math.max(0, scrollPosition - 250);
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
            const newPosition = Math.min(maxScroll, scrollPosition + 250);
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
        containerRef.current.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - containerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        containerRef.current.scrollLeft = startScrollLeft - walk;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (containerRef.current) {
            containerRef.current.style.cursor = 'grab';
        }
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        if (containerRef.current) {
            containerRef.current.style.cursor = 'grab';
        }
    };

    if (filteredParts.length === 0) {
        return (
            <div className="h-full flex items-center justify-center p-3">
                <p className="text-gray-500 text-sm">No parts found</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-3 relative">
            {/* Scroll buttons - only show if scrolling is possible */}
            {(canScrollLeft || canScrollRight) && (
                <div className="absolute top-2 right-2 flex gap-1 z-10">
                    <button
                        onClick={scrollLeft}
                        disabled={!canScrollLeft}
                        className="p-1.5 rounded-full bg-white shadow-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border"
                        title="Scroll left"
                    >
                        <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                        onClick={scrollRight}
                        disabled={!canScrollRight}
                        className="p-1.5 rounded-full bg-white shadow-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border"
                        title="Scroll right"
                    >
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            )}

            <div
                ref={containerRef}
                className="h-full overflow-x-auto overflow-y-hidden cursor-grab select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                style={{ 
                    scrollbarWidth: "none", 
                    msOverflowStyle: "none",
                    WebkitOverflowScrolling: "touch" // Better mobile scrolling
                }}
            >
                <div className="flex gap-2 h-full pb-2 min-w-max">
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
                            <div key={part.id} className="flex-shrink-0 w-40">
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