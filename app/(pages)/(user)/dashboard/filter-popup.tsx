const FilterPopup = ({ types, selectedTypes, onTypeToggle, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg">
                <h3>Filter by Types</h3>
                {types.map((type) => (
                    <div key={type.id}>
                        <input
                            type="checkbox"
                            id={`type-${type.id}`}
                            checked={selectedTypes.includes(type.id)}
                            onChange={() => onTypeToggle(type.id)}
                        />
                        <label htmlFor={`type-${type.id}`}>{type.name}</label>
                    </div>
                ))}
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default FilterPopup;
