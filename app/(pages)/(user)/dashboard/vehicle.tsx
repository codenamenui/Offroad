import Image from "next/image";

const VehiclePanel = ({
    vehicles,
    selectedVehicleId,
    setSelectedVehicleId,
    customizations,
    setCustomizations,
    parts,
}) => {
    const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
    const vehicleParts =
        parts?.filter((part) => part.vehicle_id === selectedVehicleId) || [];

    const getPartQuantity = (partId) => {
        const customization = customizations?.parts?.find(
            (c) => c.part.id === partId
        );
        return customization?.quantity || 0;
    };

    const updatePartQuantity = (part, newQuantity) => {
        if (newQuantity < 0 || newQuantity > part.stock) return;

        setCustomizations((prev) => {
            const currentParts = prev?.parts || [];
            const existingIndex = currentParts.findIndex(
                (c) => c.part.id === part.id
            );

            if (newQuantity === 0) {
                if (existingIndex !== -1) {
                    return {
                        parts: currentParts.filter(
                            (c) => c.part.id !== part.id
                        ),
                    };
                }
                return prev || { parts: [] };
            }

            if (existingIndex !== -1) {
                const updatedParts = [...currentParts];
                updatedParts[existingIndex] = { part, quantity: newQuantity };
                return { parts: updatedParts };
            } else {
                return {
                    parts: [...currentParts, { part, quantity: newQuantity }],
                };
            }
        });
    };

    const getTotalPrice = () => {
        return (
            customizations?.parts?.reduce((total, customization) => {
                return (
                    total + customization.part.price * customization.quantity
                );
            }, 0) || 0
        );
    };

    return (
        <div>
            <div>
                <Image
                    src={selectedVehicle?.url}
                    alt={selectedVehicle?.name}
                    width="300"
                    height="200"
                />
            </div>

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
                <h3>Customizations</h3>
                <div>
                    <strong>Total: ${getTotalPrice()}</strong>
                </div>
                {customizations?.parts?.map((customization) => (
                    <div key={customization.part.id}>
                        <span>{customization.part.name}</span>
                        <span>Unit Price: ${customization.part.price}</span>
                        <button
                            onClick={() =>
                                updatePartQuantity(
                                    customization.part,
                                    customization.quantity - 1
                                )
                            }
                        >
                            -
                        </button>
                        <span>{customization.quantity}</span>
                        <button
                            onClick={() =>
                                updatePartQuantity(
                                    customization.part,
                                    customization.quantity + 1
                                )
                            }
                            disabled={
                                customization.quantity >=
                                customization.part.stock
                            }
                        >
                            +
                        </button>
                        <span>
                            Total: $
                            {customization.part.price * customization.quantity}
                        </span>
                    </div>
                ))}
                <button>Book Now</button>
            </div>
        </div>
    );
};

export default VehiclePanel;
