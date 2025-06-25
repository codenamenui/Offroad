import { useState } from "react";

const FilterPopup = ({
  types,
  selectedTypes,
  onTypeToggle,
  onClose,
  onConfirm,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-80 max-w-sm mx-4">
        {/* Header */}
        <div className="p-6 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>

        {/* Filter Options */}
        <div className="px-6 pb-6 space-y-4">
          {types.map((type) => (
            <div key={type.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`type-${type.id}`}
                  checked={selectedTypes.includes(type.id)}
                  onChange={() => onTypeToggle(type.id)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label
                  htmlFor={`type-${type.id}`}
                  className="ml-3 text-sm font-medium text-gray-700 cursor-pointer"
                >
                  {type.name}
                </label>
              </div>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full min-w-[24px] text-center">
                {type.count || 0}
              </span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 p-6 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPopup;
