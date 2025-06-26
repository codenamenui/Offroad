import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { User, ChevronDown } from "lucide-react";

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

        const isUnavailable = unavailableDays && unavailableDays.length > 0;
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

  const selectedMechanic = mechanics.find(
    (m) => m.id === bookingData.mechanic_id
  );

  const handleMechanicSelect = (mechanic) => {
    const availability = mechanicAvailability[mechanic.id];
    if (availability?.isAvailable) {
      setBookingData((prev) => ({
        ...prev,
        mechanic_id: mechanic.id,
      }));
      setIsDropdownOpen(false);
      // Clear the tooltip when selecting a mechanic
      setHoveredMechanic(null);
    }
  };

  // Clear tooltip when dropdown closes
  useEffect(() => {
    if (!isDropdownOpen) {
      setHoveredMechanic(null);
    }
  }, [isDropdownOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg w-96 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Choose your mechanic
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mechanics
            </label>

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <div className="flex items-center space-x-2">
                  <User size={18} className="text-gray-400" />
                  <span className="text-gray-900">
                    {selectedMechanic
                      ? selectedMechanic.name
                      : "Select a mechanic"}
                  </span>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {mechanics.map((mechanic) => {
                    const availability = mechanicAvailability[mechanic.id];
                    const isAvailable = availability?.isAvailable;
                    const isUnavailable = availability?.isUnavailable;

                    return (
                      <div
                        key={mechanic.id}
                        className={`px-3 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                          !isAvailable ? "opacity-60 cursor-not-allowed" : ""
                        } ${
                          bookingData.mechanic_id === mechanic.id
                            ? "bg-orange-50"
                            : ""
                        }`}
                        onClick={() => handleMechanicSelect(mechanic)}
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
                        onMouseLeave={() => setHoveredMechanic(null)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User size={16} className="text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {mechanic.name}
                            </span>
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              isAvailable
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {isUnavailable ? "Unavailable" : "Available"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleNext}
              disabled={!bookingData.mechanic_id}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                bookingData.mechanic_id
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Book
            </button>

            <button
              onClick={handleClose}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredMechanic && mechanicAvailability[hoveredMechanic] && (
        <div
          className="fixed bg-gray-800 text-white p-3 rounded-lg text-xs whitespace-pre-line shadow-lg pointer-events-none z-[9999] max-w-xs"
          style={{
            left: `${mousePosition.x + 10}px`,
            top: `${mousePosition.y + 10}px`,
          }}
        >
          <div className="font-medium mb-1">
            <strong>Status:</strong>{" "}
            {mechanicAvailability[hoveredMechanic]?.isUnavailable
              ? `Unavailable (${
                  mechanicAvailability[hoveredMechanic]?.unavailableReason ||
                  "Day off"
                })`
              : "Available"}
          </div>
          <div className="text-[11px] text-gray-300">
            <strong>Upcoming unavailable days:</strong>
            <br />
            {formatUnavailableDays(
              mechanicAvailability[hoveredMechanic].upcomingUnavailableDays
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MechanicSelectionModal;
