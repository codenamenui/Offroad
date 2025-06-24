const BookingConfirmationModal = ({
    isOpen,
    onConfirm,
    onCancel,
    bookingData,
}) => {
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
                <h3>Booking request sent</h3>
                <p>
                    Your booking request for off-road parts installation has
                    been submitted. Please wait for the confirmation of the
                    mechanic. Thank you!
                </p>
                {bookingData.date && (
                    <p>
                        Selected Date: {bookingData.date.toLocaleDateString()}
                    </p>
                )}
                <div>
                    <button onClick={onConfirm}>Confirm</button>
                    <button onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmationModal;
