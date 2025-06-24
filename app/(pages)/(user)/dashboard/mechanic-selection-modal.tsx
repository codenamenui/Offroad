const MechanicSelectionModal = ({
    isOpen,
    onClose,
    mechanics,
    onNext,
    bookingData,
    setBookingData,
}) => {
    const handleNext = () => {
        if (bookingData.mechanic_id) {
            onNext();
        }
    };

    const handleClose = () => {
        setBookingData((prev) => ({ ...prev, mechanic_id: null }));
        onClose();
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
                }}
            >
                <h3>Select Mechanic</h3>
                <select
                    value={bookingData.mechanic_id || ""}
                    onChange={(e) =>
                        setBookingData((prev) => ({
                            ...prev,
                            mechanic_id: e.target.value,
                        }))
                    }
                >
                    <option value="">Choose a mechanic</option>
                    {mechanics.map((mechanic) => (
                        <option key={mechanic.id} value={mechanic.id}>
                            {mechanic.name}
                        </option>
                    ))}
                </select>
                <div>
                    <button onClick={handleNext}>Next</button>
                    <button onClick={handleClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default MechanicSelectionModal;
