import { useState } from "react";

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
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
        setSelectedDate(null);
    };

    const handleDateClick = (day) => {
        const clickedDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
        );
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (clickedDate >= today) {
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
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        dayNames.forEach((day) => {
            days.push(
                <div key={day} className="font-bold p-2.5 text-center">
                    {day}
                </div>
            );
        });

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="p-2.5"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                day
            );
            const isPast = dateObj < today;
            const isSelected =
                selectedDate && selectedDate.getTime() === dateObj.getTime();

            days.push(
                <div
                    key={day}
                    onClick={() => !isPast && handleDateClick(day)}
                    className={`p-2.5 text-center border border-gray-300 ${
                        isPast
                            ? "cursor-not-allowed text-gray-300"
                            : "cursor-pointer"
                    } ${
                        isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-transparent text-black"
                    }`}
                >
                    {day}
                </div>
            );
        }

        return days;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-5 rounded-lg min-w-96">
                <div className="flex justify-between items-center mb-5">
                    <button onClick={() => changeMonth(-1)}>&lt;</button>
                    <h3>
                        {currentDate.toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                        })}
                    </h3>
                    <button onClick={() => changeMonth(1)}>&gt;</button>
                </div>
                <div className="grid grid-cols-7 gap-px">
                    {renderCalendar()}
                </div>
                <div className="mt-5">
                    <button
                        onClick={handleNext}
                        disabled={!selectedDate}
                        className={`px-4 py-2 mr-2 border-none rounded ${
                            selectedDate
                                ? "bg-blue-600 text-white cursor-pointer"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
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
    );
};

export default DateSelectionModal;
