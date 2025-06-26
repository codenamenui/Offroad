// PartItem.tsx - Compact version with two-line description limit
import Image from "next/image";
import { Plus } from "lucide-react";

const PartItem = ({
    part,
    onAddPart,
    isDisabled = false,
    availableQuantity = null,
}) => {
    const displayStock =
        availableQuantity !== null
            ? availableQuantity
            : part.available_quantity || part.stock;

    const getTypeColor = () => {
        return "bg-amber-500";
    };

    const formatPrice = (price) => {
        return `₱${parseFloat(price).toFixed(2)}`;
    };

    const truncateName = (name, maxLength = 16) => {
        return name.length > maxLength
            ? `${name.substring(0, maxLength)}...`
            : name;
    };

    return (
        <div
            className={`
            bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 
            p-2 cursor-pointer border border-gray-200 h-full flex flex-col select-none
            ${
                isDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-amber-300"
            }
        `}
            style={{ userSelect: "none" }}
            onClick={() => !isDisabled && onAddPart(part)}
        >
            <div className="relative h-16 mb-2 bg-gray-50 rounded-md overflow-hidden">
                <Image
                    src={part.url}
                    alt={part.name}
                    fill
                    className="object-cover"
                />
            </div>

            <div
                className={`
                inline-block px-1.5 py-0.5 rounded-full text-xs font-medium text-white mb-1 w-fit
                ${getTypeColor()}
            `}
            >
                {part.types?.name || "General"}
            </div>

            <div className="mb-1">
                <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-gray-900 text-xs leading-tight line-clamp-1 flex-1 pr-1">
                        {part.name}
                    </h4>
                    {!isDisabled && (
                        <button
                            className="text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-full p-0.5 transition-colors flex-shrink-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddPart(part);
                            }}
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    )}
                </div>
                
                <div className="text-gray-600 text-xs leading-snug">
                    <p className="line-clamp-2">
                        {part.description}
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-end mt-auto">
                <div className="text-sm font-bold text-gray-900">
                    {formatPrice(part.price)}
                </div>
                <div
                    className={`text-xs ${
                        displayStock > 0 ? "text-green-600" : "text-red-500"
                    }`}
                >
                    {displayStock}
                </div>
            </div>
        </div>
    );
};

export default PartItem;