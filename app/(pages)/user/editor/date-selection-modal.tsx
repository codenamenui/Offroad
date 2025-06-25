import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DateSelectionModal = ({ isOpen, onClose, onNext }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const changeMonth = (direction) => {
        setCurrentDate((prev) => {
            setSelectedDate(null); // Clear selection inside the state update
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };

    const handleDateClick = (day, monthOffset = 0) => {
        let clickedDate;
        
        if (monthOffset === -1) {
            // Previous month
            clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, day);
        } else if (monthOffset === 1) {
            // Next month
            clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
        } else {
            // Current month
            clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (clickedDate >= today) {
            if (monthOffset !== 0) {
                // If clicking on prev/next month date, change the month first
                setCurrentDate(new Date(clickedDate.getFullYear(), clickedDate.getMonth(), 1));
            }
            setSelectedDate(clickedDate);
        }
    };

    const handleNext = () => {
        if (selectedDate) {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
            const day = String(selectedDate.getDate()).padStart(2, "0");
            const isoDate = `${year}-${month}-${day}`;
            onNext(isoDate);
            setSelectedDate(null);
        }
    };

    const handleClose = () => {
        setSelectedDate(null);
        onClose();
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const days = [];
        const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

        // Day headers
        dayNames.forEach((day) => {
            days.push(
                <div key={day} className="text-sm font-medium text-gray-500 p-3 text-center">
                    {day}
                </div>
            );
        });

        // Adjust for Monday start (0 = Monday, 6 = Sunday)
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
        
        // Previous month's trailing days
        if (adjustedFirstDay > 0) {
            const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            const daysInPrevMonth = getDaysInMonth(prevMonthDate);
            
            for (let i = adjustedFirstDay - 1; i >= 0; i--) {
                const day = daysInPrevMonth - i;
                const dateObj = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), day);
                const isPast = dateObj < today;
                
                days.push(
                    <div
                        key={`prev-${day}`}
                        className={`
                            p-3 text-center text-sm font-medium rounded-full cursor-pointer
                            transition-all duration-200 hover:bg-gray-50
                            ${isPast 
                                ? "text-gray-300 cursor-not-allowed hover:bg-transparent" 
                                : "text-gray-500 hover:text-gray-700"
                            }
                        `}
                        onClick={() => !isPast && handleDateClick(day, -1)}
                    >
                        {day}
                    </div>
                );
            }
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                day
            );
            const isPast = dateObj < today;
            const isSelected =
                selectedDate && 
                selectedDate.getTime() === dateObj.getTime() &&
                selectedDate.getMonth() === currentDate.getMonth() &&
                selectedDate.getFullYear() === currentDate.getFullYear();

            days.push(
                <div
                    key={day}
                    onClick={() => !isPast && handleDateClick(day, 0)}
                    className={`
                        p-3 text-center text-sm font-medium rounded-full cursor-pointer
                        transition-all duration-200 hover:bg-gray-100
                        ${isPast 
                            ? "text-gray-300 cursor-not-allowed hover:bg-transparent" 
                            : "text-gray-900"
                        }
                        ${isSelected 
                            ? "bg-amber-500 text-white hover:bg-amber-600" 
                            : ""
                        }
                    `}
                >
                    {day}
                </div>
            );
        }

        // Next month's leading days to fill remaining slots (always 6 weeks total = 42 cells)
        const currentCellCount = adjustedFirstDay + daysInMonth;
        const remainingCells = 42 - currentCellCount; // Always fill to 42 total cells (6 weeks)
        
        for (let day = 1; day <= remainingCells; day++) {
            const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
            const isPast = dateObj < today;
            
            days.push(
                <div
                    key={`next-${day}`}
                    className={`
                        p-3 text-center text-sm font-medium rounded-full cursor-pointer
                        transition-all duration-200 hover:bg-gray-50
                        ${isPast 
                            ? "text-gray-300 cursor-not-allowed hover:bg-transparent" 
                            : "text-gray-500 hover:text-gray-700"
                        }
                    `}
                    onClick={() => !isPast && handleDateClick(day, 1)}
                >
                    {day}
                </div>
            );
        }

        return days;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                {/* Header */}
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

                {/* Calendar Grid */}
                <div className="p-6">
                    <div className="grid grid-cols-7 gap-1">
                        {renderCalendar()}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 p-6 border-t border-gray-100">
                    <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={!selectedDate}
                        className={`
                            flex-1 px-4 py-3 rounded-lg font-medium transition-colors
                            ${selectedDate
                                ? "bg-amber-500 hover:bg-amber-600 text-white"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }
                        `}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DateSelectionModal;