"use client";

import React, { useState } from "react";
import Image from "next/image";
import SignUpButton from "./signup";
import { signUpWithEmail } from "@/utils/user";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FormInput from "../login/form-input";
import SubmitButton from "@/components/submit-button";

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

  const formFields = [
    {
      id: "name",
      name: "name",
      type: "text",
      placeholder: "Enter your full name",
      label: "Full Name",
    },
    {
      id: "contact",
      name: "contact",
      type: "tel",
      placeholder: "Enter your contact number",
      label: "Contact Number",
    },
    {
      id: "email",
      name: "email",
      type: "email",
      placeholder: "Enter your email",
      label: "Email",
    },
    {
      id: "password",
      name: "password",
      type: "password",
      placeholder: "••••••••",
      label: "Password",
    },
    {
      id: "confirm",
      name: "confirm",
      type: "password",
      placeholder: "••••••••",
      label: "Confirm Password",
    },
  ];

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
          {formFields.map((field) => (
            <FormInput key={field.id} {...field} disabled={loading} />
          ))}

          <SubmitButton
            id={"button"}
            type={"submit"}
            name={"button"}
            disabled={loading}
            content={"Get started"}
            loading={"Creating account..."}
          />

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
