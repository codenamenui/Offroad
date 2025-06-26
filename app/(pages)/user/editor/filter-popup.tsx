import { useState } from "react";
import { X } from "lucide-react";

const FilterPopup = ({ types, selectedTypes, onTypeToggle, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-80 max-w-sm mx-4">
        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Filter Options */}
        <div className="px-6 pb-6 space-y-4">
          {types.map((type) => (
            <div key={type.id} className="flex items-center">
              <input
                type="checkbox"
                id={`type-${type.id}`}
                checked={selectedTypes.includes(type.id)}
                onChange={() => onTypeToggle(type.id)}
                className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded hover:border-amber-400 focus:outline-none focus:ring-0 checked:bg-amber-600 checked:border-amber-600"
              />
              <label
                htmlFor={`type-${type.id}`}
                className="ml-3 text-sm font-medium text-gray-700 cursor-pointer"
              >
                {type.name}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPopup;