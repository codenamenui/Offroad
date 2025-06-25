import Image from "next/image";

const PartItem = ({
    part,
    onAddPart,
    isDisabled = false,
    availableQuantity = null,
}) => {
    const displayStock =
        availableQuantity !== null ? availableQuantity : part.stock;

    const containerClasses = [
        "border",
        "p-4",
        "cursor-pointer",
        "hover:bg-gray-100",
    ];

    if (isDisabled) {
        containerClasses.push("opacity-50", "cursor-not-allowed");
    }

    return (
        <div
            className={containerClasses.join(" ")}
            onClick={() => !isDisabled && onAddPart(part)}
        >
            <Image src={part.url} alt={part.name} width="150" height="100" />
            <h4>{part.name}</h4>
            <p>{part.description}</p>
            <p>${part.price}</p>
            <p>
                {availableQuantity !== null ? "Available: " : "Stock: "}
                {displayStock}
                {displayStock === 0 && (
                    <span className="text-red-500 ml-2">(Out of Stock)</span>
                )}
            </p>
        </div>
    );
};

export default PartItem;
