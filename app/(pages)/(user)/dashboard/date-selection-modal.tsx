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
            onNext(selectedDate);
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
                <div
                    key={day}
                    style={{
                        fontWeight: "bold",
                        padding: "10px",
                        textAlign: "center",
                    }}
                >
                    {day}
                </div>
            );
        });

        for (let i = 0; i < firstDay; i++) {
            days.push(
                <div key={`empty-${i}`} style={{ padding: "10px" }}></div>
            );
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
                    style={{
                        padding: "10px",
                        textAlign: "center",
                        cursor: isPast ? "not-allowed" : "pointer",
                        backgroundColor: isSelected ? "#007bff" : "transparent",
                        color: isPast ? "#ccc" : isSelected ? "white" : "black",
                        border: "1px solid #ddd",
                    }}
                >
                    {day}
                </div>
            );
        }

        return days;
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div
                style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "8px",
                    minWidth: "400px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                    }}
                >
                    <button onClick={() => changeMonth(-1)}>&lt;</button>
                    <h3>
                        {currentDate.toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                        })}
                    </h3>
                    <button onClick={() => changeMonth(1)}>&gt;</button>
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: "1px",
                    }}
                >
                    {renderCalendar()}
                </div>
                <div style={{ marginTop: "20px" }}>
                    <button onClick={handleNext} disabled={!selectedDate}>
                        Next
                    </button>
                    <button onClick={handleClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default DateSelectionModal;
