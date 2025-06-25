import React from 'react';

const BookingConfirmationModal = ({
    isOpen,
    onConfirm,
    onCancel,
    bookingData,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-sm w-full mx-4 p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Booking request sent
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-8">
                    Your booking request for off-road parts installation has
                    been submitted. Please wait for the confirmation of the
                    mechanic. Thank you!
                </p>
                {bookingData?.date && (
                    <p className="text-sm text-gray-600 mb-6">
                        Selected Date: {bookingData.date}
                    </p>
                )}
                <div className="flex gap-3">
                    <button 
                        onClick={onCancel}
                        className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="flex-1 py-3 px-4 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};


export default BookingConfirmationModal;
