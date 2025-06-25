import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

const MechanicSelectionModal = ({
    isOpen,
    onClose,
    onBack,
    mechanics = [],
    onNext,
    bookingData,
    setBookingData,
    selectedDate,
}) => {
    const [hoveredMechanic, setHoveredMechanic] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [mechanicAvailability, setMechanicAvailability] = useState({});

    const normalizeDate = useCallback((date) => {
        if (!date) return null;
        const d = new Date(date);
        return d.toISOString().split("T")[0];
    }, []);

    useEffect(() => {
        const checkMechanicAvailability = async () => {
            if (!isOpen || !selectedDate || !mechanics.length) return;

            const supabase = await createClient();
            const availability = {};
            const selectedDateStr = normalizeDate(selectedDate);

            for (const mechanic of mechanics) {
                const { data: unavailableDays } = await supabase
                    .from("mechanic_unavailable_days")
                    .select("*")
                    .eq("mechanic_id", mechanic.id)
                    .eq("date", selectedDateStr);

                const { data: allUnavailableDays } = await supabase
                    .from("mechanic_unavailable_days")
                    .select("date, reason")
                    .eq("mechanic_id", mechanic.id)
                    .gte("date", new Date().toISOString().split("T")[0])
                    .order("date", { ascending: true })
                    .limit(10);

                const isUnavailable =
                    unavailableDays && unavailableDays.length > 0;
                const unavailableReason = isUnavailable
                    ? unavailableDays[0].reason
                    : null;

                availability[mechanic.id] = {
                    isAvailable: !isUnavailable,
                    isUnavailable: isUnavailable,
                    unavailableReason: unavailableReason,
                    upcomingUnavailableDays: allUnavailableDays || [],
                };
            }

            setMechanicAvailability(availability);
        };

        checkMechanicAvailability();
    }, [isOpen, mechanics, normalizeDate, selectedDate]);

    const handleNext = () => {
        if (bookingData.mechanic_id) {
            onNext();
        }
    };

    const handleClose = () => {
        setBookingData((prev) => ({ ...prev, mechanic_id: null }));
        onClose();
    };

    const handleBack = () => {
        setBookingData((prev) => ({ ...prev, mechanic_id: null }));
        onBack();
    };

    const formatUnavailableDays = (unavailableDays) => {
        if (!unavailableDays || unavailableDays.length === 0) {
            return "No upcoming unavailable days";
        }

        return unavailableDays
            .map((day) => {
                const date = new Date(day.date).toLocaleDateString();
                const reason = day.reason ? ` (${day.reason})` : "";
                return `${date}${reason}`;
            })
            .join("\n");
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-5 rounded-lg min-w-96 relative">
                    <h3 className="mb-5">
                        Select Mechanic for{" "}
                        {new Date(selectedDate).toLocaleDateString()}
                    </h3>
                    <div className="mb-5">
                        {mechanics.map((mechanic) => {
                            const availability =
                                mechanicAvailability[mechanic.id];
                            const isAvailable = availability?.isAvailable;
                            const isUnavailable = availability?.isUnavailable;

                            return (
                                <div
                                    key={mechanic.id}
                                    className={`p-2.5 my-1 border border-gray-300 rounded ${
                                        bookingData.mechanic_id === mechanic.id
                                            ? "bg-blue-50"
                                            : "bg-white"
                                    } ${
                                        isAvailable
                                            ? "cursor-pointer opacity-100"
                                            : "cursor-not-allowed opacity-60"
                                    }`}
                                    onClick={() => {
                                        if (isAvailable) {
                                            setBookingData((prev) => ({
                                                ...prev,
                                                mechanic_id: mechanic.id,
                                            }));
                                        }
                                    }}
                                    onMouseEnter={(e) => {
                                        setHoveredMechanic(mechanic.id);
                                        setMousePosition({
                                            x: e.clientX,
                                            y: e.clientY,
                                        });
                                    }}
                                    onMouseMove={(e) => {
                                        setMousePosition({
                                            x: e.clientX,
                                            y: e.clientY,
                                        });
                                    }}
                                    onMouseLeave={() =>
                                        setHoveredMechanic(null)
                                    }
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold">
                                            {mechanic.name}
                                        </span>
                                        <span
                                            className={`text-xs font-bold ${
                                                isAvailable
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {isUnavailable
                                                ? `Unavailable (${
                                                      availability?.unavailableReason ||
                                                      "Day off"
                                                  })`
                                                : "Available"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex gap-2.5 justify-end">
                        <button
                            onClick={handleBack}
                            className="px-4 py-2 bg-gray-500 text-white border-none rounded cursor-pointer"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!bookingData.mechanic_id}
                            className={`px-4 py-2 text-white border-none rounded ${
                                bookingData.mechanic_id
                                    ? "bg-green-500 cursor-pointer"
                                    : "bg-gray-300 cursor-not-allowed"
                            }`}
                        >
                            Next
                        </button>
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 bg-red-500 text-white border-none rounded cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            {hoveredMechanic && mechanicAvailability[hoveredMechanic] && (
                <div
                    className="fixed bg-gray-800 text-white p-2.5 rounded text-xs whitespace-pre-line shadow-lg pointer-events-none z-[9999]"
                    style={{
                        left: `${mousePosition.x + 10}px`,
                        top: `${mousePosition.y + 10}px`,
                    }}
                >
                    <div>
                        <strong>Status:</strong>{" "}
                        {mechanicAvailability[hoveredMechanic]?.isUnavailable
                            ? `Unavailable (${
                                  mechanicAvailability[hoveredMechanic]
                                      ?.unavailableReason || "Day off"
                              })`
                            : "Available"}
                    </div>
                    <div className="text-[11px] mt-1">
                        {formatUnavailableDays(
                            mechanicAvailability[hoveredMechanic]
                                .upcomingUnavailableDays
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default MechanicSelectionModal;
