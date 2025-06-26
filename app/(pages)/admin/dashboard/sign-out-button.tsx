"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            await supabase.auth.signOut();
            router.push("/");
            router.refresh();
        } catch (error) {
            console.error("Sign out error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed font-inter"
        >
            {isLoading ? "Signing out..." : "Sign Out"}
        </button>
    );
}
