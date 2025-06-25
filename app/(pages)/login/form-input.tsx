import { Input } from "@/components/ui/input";
import React from "react";

const FormInput = ({ id, name, type, placeholder, disabled, label }) => {
    return (
        <div>
            <label
                htmlFor={id}
                className="block text-sm font-medium text-gray-700"
            >
                {label}
            </label>
            <div className="mt-1">
                <Input
                    type={type}
                    id={id}
                    name={name}
                    placeholder={placeholder}
                    required
                    disabled={disabled}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
            </div>
        </div>
    );
};

export default FormInput;
