"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import SignUpButton from "./signup";
import { signUpWithEmail } from "@/utils/user";
import { useRouter } from "next/navigation";
import Link from "next/link";

const RegisterPage = () => {
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const contact = formData.get("contact") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm") as string;

    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const displayName = name?.trim() || undefined;
      const phoneNumber = contact?.trim() || undefined;

      const result = await signUpWithEmail(
        email,
        password,
        displayName,
        phoneNumber
      );

      if (result.error) {
        setError(result.error);
      } else if (result.message) {
        setMessage(result.message);
      } else {
        router.push("/user/editor");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen max-h-screen overflow-hidden flex items-center justify-center bg-gray-50 px-4 py-4 font-inter">
      <div className="w-full max-w-md max-h-full overflow-y-auto">
        <div className="text-center mb-4">
          <div className="flex justify-center mb-3">
            <Image
              src="/icon.png"
              alt="Putik Offroaders"
              width={50}
              height={50}
              className="rounded-full"
            />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Create an account</h2>
          <p className="mt-1 text-xs text-gray-600">
            Start your journey with Putik Offroaders.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-xs mb-3">
            Error: {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md text-xs mb-3">
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-3 bg-white rounded-lg shadow-md p-6"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <Input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your full name"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label
              htmlFor="contact"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Contact Number
            </label>
            <Input
              type="tel"
              id="contact"
              name="contact"
              placeholder="Enter your contact number"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <Input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label
              htmlFor="confirm"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <Input
              type="password"
              id="confirm"
              name="confirm"
              placeholder="••••••••"
              required
              disabled={loading}
              className="w-full px-2 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 mt-4 border border-transparent rounded-md text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Get started"}
          </button>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
          <div className="flex justify-center">
            <SignUpButton />
          </div>

          <div className="text-center mt-3">
            <span className="text-xs text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-amber-600 hover:text-amber-500"
              >
                Log in
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
