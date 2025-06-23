"use client";

import { Button } from "@/components/ui/button";
import { signInUserOAuth } from "@/utils/user";
import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa";

const SignUpButton = () => {
    const [isSigningUp, setIsSigningUp] = useState(false);

    const handleSignUp = async () => {
        setIsSigningUp(true);
        try {
            // OAuth sign up uses the same function as sign in
            // Supabase automatically creates account if user doesn't exist
            await signInUserOAuth();
        } finally {
            setIsSigningUp(false);
        }
    };

    return (
        <Button
            onClick={handleSignUp}
            variant="outline"
            className="group relative transition-transform hover:scale-105"
            disabled={isSigningUp}
        >
            <FaGoogle className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
            {isSigningUp ? "Signing up..." : "Sign up with Google"}
        </Button>
    );
};

export default SignUpButton;
