"use client";

import React, { useState, createContext, useContext } from "react";
import Link from "next/link";
import { Menu, User, Filter, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FilterPopup from "../app/(pages)/user/editor/filter-popup";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import ProfilePopup from "./profile-popup";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const onUpdate = (updatedUser) => {
    setProfile(updatedUser);
  };

  const handleLogout = async () => {
    const supabase = await createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleProfileClick = () => {
    setShowProfilePopup(true);
    setDropdownOpen(false);
  };

  return (
    <>
      <header
        className={`flex items-center px-6 py-4 border-b bg-white font-inter ${
          search ? "justify-between" : "justify-between"
        }`}
      >
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <Image
              src="/icon.png"
              alt="Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="font-bold text-xl text-gray-900">
              Putik Offroaders
            </span>
          </div>
          <nav className="flex space-x-6">
            {mechanic ? (
              <>
                <Link
                  href="/mechanic/bookings"
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  Bookings
                </Link>
                <Link
                  href="/mechanic/leaves"
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  Leaves
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/user/editor"
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  Editor
                </Link>
                <Link
                  href="/user/bookings"
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  Bookings
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Center - Search Bar (only when search is enabled) */}
        {search && (
          <div className="flex items-center space-x-3 flex-1 max-w-5xl mx-8">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search for parts"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilterPopup(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={16} />
              <span className="text-sm font-medium">Filters</span>
            </button>
          </div>
        )}

        {/* Right side - User Menu */}
        <div className="flex items-center">
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu size={24} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 p-6 bg-white border border-gray-200 rounded-lg shadow-lg"
            >
              <div
                className="flex items-center space-x-3 mb-6 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={handleProfileClick}
              >
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{profile.name}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
              >
                Log out
              </button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
