import Image from "next/image";

const PartItem = ({ part, onAddPart }) => {
    return (
        <div
            className="border p-4 cursor-pointer hover:bg-gray-100"
            onClick={() => onAddPart(part)}
        >
            <Image src={part.url} alt={part.name} width="150" height="100" />
            <h4>{part.name}</h4>
            <p>{part.description}</p>
            <p>${part.price}</p>
            <p>Stock: {part.stock}</p>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onAddPart(part);
                }}
            >
                Add
            </button>
        </div>
    );
};

export default PartItem;
