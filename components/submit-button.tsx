import React from "react";

const SubmitButton = ({ id, type, name, disabled, content, loading }) => {
  return (
    <div>
      <button
        id={id}
        type={type}
        name={name}
        disabled={disabled}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {disabled ? loading : content}
      </button>
    </div>
  );
};

export default SubmitButton;
