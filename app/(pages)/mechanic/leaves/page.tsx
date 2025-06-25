"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import HeaderPanel, { SearchProvider } from "@/components/header";

interface UnavailableDay {
    id: number;
    date: string;
    reason: string;
}

export default function MechanicLeaveCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [unavailableDays, setUnavailableDays] = useState<UnavailableDay[]>(
        []
    );
    const [mechanicId, setMechanicId] = useState<string | null>(null);
    const [name, setName] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [reason, setReason] = useState("leave");
    const [showModal, setShowModal] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        async function fetchMechanicAndUnavailableDays() {
            try {
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
        }

        fetchMechanicAndUnavailableDays();
    }, []);

    async function fetchUnavailableDays(mechId: string) {
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
    }

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const current = new Date(startDate);

        while (
            current <= lastDay ||
            current.getDay() !== 0 ||
            days.length < 42
        ) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
            if (days.length >= 42) break;
        }

        return days;
    };

    const formatDateString = (date: Date) => {
        return date.toISOString().split("T")[0];
    };

    const getUnavailableDay = (date: Date) => {
        const dateString = formatDateString(date);
        return unavailableDays.find((day) => day.date === dateString);
    };

    const handleDateClick = (date: Date) => {
        if (date < new Date()) return;

        const dateString = formatDateString(date);
        const existingDay = getUnavailableDay(date);

        if (existingDay) {
            handleRemoveUnavailableDay(existingDay.id);
        } else {
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

    const navigateMonth = (direction: number) => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + direction);
            return newDate;
        });
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

    const days = getDaysInMonth(currentDate);
    const monthYear = currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    return (
        <SearchProvider types={[]}>
            <HeaderPanel user={{ name: name }} search={false} mechanic={true} />
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-lg">
                    <div className="p-6 border-b">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Manage Leave Days
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Click on future dates to add/remove leave days
                        </p>
                    </div>

                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => navigateMonth(-1)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                Previous
                            </button>
                            <h2 className="text-xl font-semibold">
                                {monthYear}
                            </h2>
                            <button
                                onClick={() => navigateMonth(1)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                Next
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-4">
                            {[
                                "Sun",
                                "Mon",
                                "Tue",
                                "Wed",
                                "Thu",
                                "Fri",
                                "Sat",
                            ].map((day) => (
                                <div
                                    key={day}
                                    className="p-3 text-center font-medium text-gray-700 bg-gray-100"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {days.map((day, index) => {
                                const isCurrentMonth =
                                    day.getMonth() === currentDate.getMonth();
                                const isToday =
                                    formatDateString(day) ===
                                    formatDateString(new Date());
                                const isPast = day < new Date();
                                const unavailableDay = getUnavailableDay(day);

                                return (
                                    <div
                                        key={index}
                                        onClick={() =>
                                            isCurrentMonth &&
                                            !isPast &&
                                            handleDateClick(day)
                                        }
                                        className={`
                                        p-3 h-16 border border-gray-200 cursor-pointer transition-colors relative
                                        ${
                                            !isCurrentMonth
                                                ? "text-gray-300 bg-gray-50"
                                                : ""
                                        }
                                        ${
                                            isToday
                                                ? "bg-blue-100 border-blue-300"
                                                : ""
                                        }
                                        ${
                                            isPast
                                                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                                                : ""
                                        }
                                        ${
                                            unavailableDay
                                                ? "bg-red-100 border-red-300"
                                                : ""
                                        }
                                        ${
                                            isCurrentMonth &&
                                            !isPast &&
                                            !unavailableDay
                                                ? "hover:bg-gray-50"
                                                : ""
                                        }
                                    `}
                                    >
                                        <div className="text-sm">
                                            {day.getDate()}
                                        </div>
                                        {unavailableDay && (
                                            <div className="absolute bottom-1 left-1 right-1 text-xs text-red-600 truncate">
                                                {unavailableDay.reason}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-blue-100 border border-blue-300"></div>
                                <span>Today</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-red-100 border border-red-300"></div>
                                <span>Unavailable</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-gray-100 border border-gray-300"></div>
                                <span>Past dates</span>
                            </div>
                        </div>
                    </div>
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-96">
                            <h3 className="text-lg font-semibold mb-4">
                                Add Leave Day
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Selected date:{" "}
                                {selectedDate &&
                                    new Date(selectedDate).toLocaleDateString()}
                            </p>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason
                                </label>
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="leave">Leave</option>
                                    <option value="sick">Sick</option>
                                    <option value="personal">Personal</option>
                                    <option value="vacation">Vacation</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleAddUnavailableDay}
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                >
                                    Add Leave Day
                                </button>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedDate(null);
                                        setReason("leave");
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SearchProvider>
    );
}
