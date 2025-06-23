import React from "react";
import SignInButton from "./SignInButton";
import Link from "next/link";

const LoginPage = () => {
    return (
        <div>
            <div>log in to your accoutn!</div>
            <div>welcome to offroad!</div>
            <form action="">
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                />
                <input type="password" placeholder="********" />
                <input type="submit" placeholder="Sign In" />
            </form>
            <SignInButton />
            <div>
                Dont have an account?
                <Link href={"/register"}>Register</Link>
            </div>
        </div>
    );
};

export default LoginPage;
