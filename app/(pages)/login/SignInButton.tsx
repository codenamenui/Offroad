"use client";

import { Button } from "@/components/ui/button";
import { signInUserOAuth } from "@/utils/user";
import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa";

const SignInButton = () => {
    const [isSigningIn, setIsSigningIn] = useState(false);

    const handleSignIn = async () => {
        setIsSigningIn(true);
        try {
            await signInUserOAuth();
        } finally {
            setIsSigningIn(false);
        }
    };
    return (
        <Button
            onClick={handleSignIn}
            variant="outline"
            className="group relative transition-transform hover:scale-105"
            disabled={isSigningIn}
        >
            <FaGoogle className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
            {isSigningIn ? "Signing in..." : "Sign in with Google"}
        </Button>
    );
};

export default SignInButton;
