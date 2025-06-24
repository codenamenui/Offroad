import React, { useState, createContext, useContext } from "react";
import Link from "next/link";
import { Menu, User, Filter } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FilterPopup from "./filter-popup";

const SearchContext = createContext(null);

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error("useSearch must be used within a SearchProvider");
    }
    return context;
};

export const SearchProvider = ({ children, types }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [showFilterPopup, setShowFilterPopup] = useState(false);

    const handleTypeToggle = (typeId) => {
        setSelectedTypes((prev) =>
            prev.includes(typeId)
                ? prev.filter((id) => id !== typeId)
                : [...prev, typeId]
        );
    };

    const value = {
        searchTerm,
        setSearchTerm,
        selectedTypes,
        setSelectedTypes,
        showFilterPopup,
        setShowFilterPopup,
        handleTypeToggle,
        types,
    };

    return (
        <SearchContext.Provider value={value}>
            {children}
            {showFilterPopup && (
                <FilterPopup
                    types={types}
                    selectedTypes={selectedTypes}
                    onTypeToggle={handleTypeToggle}
                    onClose={() => setShowFilterPopup(false)}
                />
            )}
        </SearchContext.Provider>
    );
};

const HeaderPanel = (user) => {
    const { searchTerm, setSearchTerm, setShowFilterPopup } = useSearch();
    console.log(user);
    return (
        <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                    <img src="/logo.png" alt="Logo" className="h-8 w-8" />
                    <span className="font-bold text-lg">Putik Offroaders</span>
                </div>
                <nav className="flex space-x-4">
                    <Link href="/" className="hover:text-gray-600">
                        Home
                    </Link>
                    <Link href="/bookings" className="hover:text-gray-600">
                        Bookings
                    </Link>
                </nav>
            </div>

            <div className="flex items-center space-x-4">
                <input
                    type="text"
                    placeholder="Search parts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border p-2 rounded"
                />
                <button
                    onClick={() => setShowFilterPopup(true)}
                    className="border p-2 rounded"
                >
                    <Filter size={16} />
                </button>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger className="p-2">
                    <Menu size={20} />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                        <Link
                            href="/profile"
                            className="flex items-center space-x-2"
                        >
                            <User size={16} />
                            <span>{user.user.name}</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
};

export default HeaderPanel;
