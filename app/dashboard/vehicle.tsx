import Image from "next/image";

const VehiclePanel = ({
    vehicles,
    selectedVehicleId,
    setSelectedVehicleId,
}) => {
    const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

    const parts = [
        { id: 1, name: "Part 1", price: 100, quantity: 0 },
        { id: 2, name: "Part 2", price: 200, quantity: 0 },
        { id: 3, name: "Part 3", price: 150, quantity: 0 },
    ];

    return (
        <div>
            <div>
                {vehicles.map((vehicle) => (
                    <button
                        key={vehicle.id}
                        onClick={() => setSelectedVehicleId(vehicle.id)}
                        className={
                            selectedVehicleId === vehicle.id ? "active" : ""
                        }
                    >
                        {vehicle.name}
                    </button>
                ))}
            </div>

            <div>
                <Image
                    src={selectedVehicle?.image}
                    alt={selectedVehicle?.name}
                    width="300"
                    height="200"
                />
            </div>

            <div>
                <h3>Parts List</h3>
                {parts.map((part) => (
                    <div key={part.id}>
                        <span>{part.name}</span>
                        <span>${part.price}</span>
                        <button>-</button>
                        <span>0</span>
                        <button>+</button>
                    </div>
                ))}
                <button>Book Now</button>
            </div>
        </div>
    );
};

export default VehiclePanel;
