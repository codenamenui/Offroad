"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import HeaderPanel, { SearchProvider } from "@/components/header";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface UnavailableDay {
  id: number;
  date: string;
  reason: string;
}

export default function MechanicLeaveCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [unavailableDays, setUnavailableDays] = useState<UnavailableDay[]>([]);
  const [mechanicId, setMechanicId] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [reason, setReason] = useState("leave");
  const [showModal, setShowModal] = useState(false);

  const supabase = createClient();

  const fetchUnavailableDays = useCallback(
    async (mechId: string) => {
      try {
        const { data, error } = await supabase
          .from("mechanic_unavailable_days")
          .select("*")
          .eq("mechanic_id", mechId);

        if (error) throw error;
        setUnavailableDays(data || []);
      } catch (error) {
        console.error("Error fetching unavailable days:", error);
      }
    },
    [supabase]
  );

  const fetchMechanicAndUnavailableDays = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: mechanic } = await supabase
        .from("mechanics")
        .select("id, name")
        .eq("profile_id", user.id)
        .single();

      if (mechanic) {
        setMechanicId(mechanic.id);
        setName(mechanic.name);
        await fetchUnavailableDays(mechanic.id);
      }
    } catch (error) {
      console.error("Error fetching mechanic data:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase, fetchUnavailableDays]);

  useEffect(() => {
    fetchMechanicAndUnavailableDays();
  }, [fetchMechanicAndUnavailableDays]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Fixed formatDateString to avoid timezone issues
  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getUnavailableDay = (date: Date) => {
    const dateString = formatDateString(date);
    return unavailableDays.find((day) => day.date === dateString);
  };

  const changeMonth = (direction: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const handleDateClick = (day: number, monthOffset = 0) => {
    let clickedDate;

    if (monthOffset === -1) {
      clickedDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        day
      );
    } else if (monthOffset === 1) {
      clickedDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        day
      );
    } else {
      clickedDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (clickedDate < today) return;

    if (monthOffset !== 0) {
      setCurrentDate(
        new Date(clickedDate.getFullYear(), clickedDate.getMonth(), 1)
      );
    }

    const existingDay = getUnavailableDay(clickedDate);
    if (existingDay) {
      handleRemoveUnavailableDay(existingDay.id);
    } else {
      const dateString = formatDateString(clickedDate);
      setSelectedDate(dateString);
      setShowModal(true);
    }
  };

  const handleAddUnavailableDay = async () => {
    if (!mechanicId || !selectedDate) return;

    try {
      const { error } = await supabase
        .from("mechanic_unavailable_days")
        .insert({
          mechanic_id: mechanicId,
          date: selectedDate,
          reason: reason,
        });

      if (error) throw error;

      await fetchUnavailableDays(mechanicId);
      setShowModal(false);
      setSelectedDate(null);
      setReason("leave");
    } catch (error) {
      console.error("Error adding unavailable day:", error);
    }
  };

  const handleRemoveUnavailableDay = async (id: number) => {
    try {
      const { error } = await supabase
        .from("mechanic_unavailable_days")
        .delete()
        .eq("id", id);

      if (error) throw error;

      if (mechanicId) {
        await fetchUnavailableDays(mechanicId);
      }
    } catch (error) {
      console.error("Error removing unavailable day:", error);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

    dayNames.forEach((day) => {
      days.push(
        <div
          key={day}
          className="text-sm font-medium text-gray-500 p-3 text-center"
        >
          {day}
        </div>
      );
    });

    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    if (adjustedFirstDay > 0) {
      const prevMonthDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      );
      const daysInPrevMonth = getDaysInMonth(prevMonthDate);

      for (let i = adjustedFirstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dateObj = new Date(
          prevMonthDate.getFullYear(),
          prevMonthDate.getMonth(),
          day
        );
        const isPast = dateObj < today;
        const unavailableDay = getUnavailableDay(dateObj);

        days.push(
          <div
            key={`prev-${day}`}
            className={`
                            p-3 text-center text-sm font-medium rounded-full cursor-pointer
                            transition-all duration-200 hover:bg-gray-50 min-h-[48px] flex flex-col items-center justify-center relative
                            ${
                              isPast
                                ? "text-gray-300 cursor-not-allowed hover:bg-transparent"
                                : "text-gray-500 hover:text-gray-700"
                            }
                            ${
                              unavailableDay && !isPast
                                ? "bg-red-100 text-red-600 hover:bg-red-200"
                                : ""
                            }
                        `}
            onClick={() => !isPast && handleDateClick(day, -1)}
          >
            <span>{day}</span>
            {unavailableDay && (
              <span className="text-xs mt-1 truncate w-full px-1">
                {unavailableDay.reason}
              </span>
            )}
          </div>
        );
      }
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const isPast = dateObj < today;
      const unavailableDay = getUnavailableDay(dateObj);
      const isToday = formatDateString(dateObj) === formatDateString(today);

      days.push(
        <div
          key={day}
          onClick={() => !isPast && handleDateClick(day, 0)}
          className={`
                        p-3 text-center text-sm font-medium rounded-full cursor-pointer
                        transition-all duration-200 hover:bg-gray-100 min-h-[48px] flex flex-col items-center justify-center relative
                        ${
                          isPast
                            ? "text-gray-300 cursor-not-allowed hover:bg-transparent"
                            : "text-gray-900"
                        }
                        ${
                          isToday
                            ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                            : ""
                        }
                        ${
                          unavailableDay && !isPast
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : ""
                        }
                    `}
        >
          <span>{day}</span>
          {unavailableDay && (
            <span className="text-xs mt-1 truncate w-full px-1">
              {unavailableDay.reason}
            </span>
          )}
        </div>
      );
    }

    const currentCellCount = adjustedFirstDay + daysInMonth;
    const remainingCells = 42 - currentCellCount;

    for (let day = 1; day <= remainingCells; day++) {
      const dateObj = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        day
      );
      const isPast = dateObj < today;
      const unavailableDay = getUnavailableDay(dateObj);

      days.push(
        <div
          key={`next-${day}`}
          className={`
                        p-3 text-center text-sm font-medium rounded-full cursor-pointer
                        transition-all duration-200 hover:bg-gray-50 min-h-[48px] flex flex-col items-center justify-center relative
                        ${
                          isPast
                            ? "text-gray-300 cursor-not-allowed hover:bg-transparent"
                            : "text-gray-500 hover:text-gray-700"
                        }
                        ${
                          unavailableDay && !isPast
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : ""
                        }
                    `}
          onClick={() => !isPast && handleDateClick(day, 1)}
        >
          <span>{day}</span>
          {unavailableDay && (
            <span className="text-xs mt-1 truncate w-full px-1">
              {unavailableDay.reason}
            </span>
          )}
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!mechanicId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">
          Please log in as a mechanic to access this page
        </div>
      </div>
    );
  }

  return (
    <SearchProvider types={[]}>
      <div className="h-screen flex flex-col overflow-hidden">
        <HeaderPanel user={{ name: name }} search={false} mechanic={true} />
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <h3 className="text-lg font-semibold text-gray-900">
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <button
                onClick={() => changeMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
            </div>

            <div className="p-6 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-100 rounded-full"></div>
                  <span className="text-gray-600">Today</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-100 rounded-full"></div>
                  <span className="text-gray-600">Leave Day</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                  <span className="text-gray-600">Past</span>
                </div>
              </div>
              <p className="text-center text-gray-500 text-sm mt-4">
                Click on future dates to add leave days • Click on leave days to
                remove them
              </p>
            </div>
          </div>
        </div>
        {showModal && (
          <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Leave Day
                </h3>
                <p className="text-gray-600 mt-2">
                  {selectedDate &&
                    new Date(selectedDate + 'T00:00:00').toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                </p>
              </div>

              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Leave
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                >
                  <option value="leave">Leave</option>
                  <option value="sick">Sick</option>
                  <option value="personal">Personal</option>
                  <option value="vacation">Vacation</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-3 p-6 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedDate(null);
                    setReason("leave");
                  }}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUnavailableDay}
                  className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
                >
                  Add Leave Day
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SearchProvider>
  );
}