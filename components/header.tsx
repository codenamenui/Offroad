import React, { useState, createContext, useContext } from "react";
import Link from "next/link";
import { Menu, User, Filter } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FilterPopup from "../app/(pages)/user/editor/filter-popup";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import ProfilePopup from "../app/(pages)/user/editor/profile-popup";

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

const HeaderPanel = ({ user, search, mechanic = false }) => {
    const { searchTerm, setSearchTerm, setShowFilterPopup } = useSearch();
    const [showProfilePopup, setShowProfilePopup] = useState(false);
    const [profile, setProfile] = useState(user);

    const onUpdate = (updatedUser) => {
        setProfile(updatedUser);
    };

    const handleLogout = async () => {
        const supabase = await createClient();
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    return (
        <>
            <header className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={100}
                            height={100}
                            className="h-8 w-8"
                        />
                        <span className="font-bold text-lg">
                            Putik Offroaders
                        </span>
                    </div>
                    <nav className="flex space-x-4">
                        {mechanic ? (
                            <>
                                <Link
                                    href="/mechanic/bookings"
                                    className="hover:text-gray-600"
                                >
                                    Bookings
                                </Link>
                                <Link
                                    href="/mechanic/leaves"
                                    className="hover:text-gray-600"
                                >
                                    Leaves
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/user/editor"
                                    className="hover:text-gray-600"
                                >
                                    Editor
                                </Link>
                                <Link
                                    href="/user/bookings"
                                    className="hover:text-gray-600"
                                >
                                    Bookings
                                </Link>
                            </>
                        )}
                    </nav>
                </div>

                {search && (
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
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger className="p-2">
                        <Menu size={20} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem
                            onClick={() => setShowProfilePopup(true)}
                        >
                            <div className="flex items-center space-x-2">
                                <User size={16} />
                                <span>{profile.name}</span>
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout}>
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            {showProfilePopup && (
                <ProfilePopup
                    onUpdate={onUpdate}
                    user={profile}
                    onClose={() => setShowProfilePopup(false)}
                />
            )}
        </>
    );
};

export default HeaderPanel;
