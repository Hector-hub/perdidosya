"use client";

import React, { InputHTMLAttributes, ChangeEvent } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

const Input = ({
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  id,
  required = false,
  disabled = false,
  error,
  className = "",
  ...props
}: InputProps) => {
  return (
    <div className="w-full">
      <input
        type={type}
        name={name}
        id={id || name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={twMerge(
          "w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
          "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100",
          error && "border-red-500 focus:ring-red-500",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
