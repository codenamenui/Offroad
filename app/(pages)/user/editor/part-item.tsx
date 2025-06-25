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

    const truncateName = (name, maxLength = 20) => {
        return name.length > maxLength
            ? `${name.substring(0, maxLength)}...`
            : name;
    };

    return (
        <div
            className={`
            bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 
            p-4 cursor-pointer border border-gray-200 h-full flex flex-col select-none
            ${
                isDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-amber-300"
            }
        `}
            style={{ userSelect: "none" }}
            onClick={() => !isDisabled && onAddPart(part)}
        >
            <div className="relative h-32 mb-3 bg-gray-50 rounded-md overflow-hidden">
                <Image
                    src={part.url}
                    alt={part.name}
                    fill
                    className="object-cover"
                />
            </div>

            <div
                className={`
                inline-block px-2 py-1 rounded-full text-xs font-medium text-white mb-2 w-fit
                ${getTypeColor()}
            `}
            >
                {part.types?.name || "General"}
            </div>

            <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-sm flex-1 pr-2">
                    {truncateName(part.name)}
                </h4>
                {!isDisabled && (
                    <button
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-full p-1 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddPart(part);
                        }}
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                )}
            </div>

            <p className="text-gray-600 text-xs mb-3 flex-1 leading-relaxed">
                {part.description.length > 80
                    ? `${part.description.substring(0, 80)}...`
                    : part.description}
            </p>

            <div className="flex justify-between items-end mt-auto">
                <div className="text-lg font-bold text-gray-900">
                    {formatPrice(part.price)}
                </div>
                <div
                    className={`text-sm ${
                        displayStock > 0 ? "text-green-600" : "text-red-500"
                    }`}
                >
                    {displayStock} in stock
                </div>
            </div>
        </div>
    );
};

export default PartItem;
