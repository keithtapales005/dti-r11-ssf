"use client";

import React, { useState } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";

interface InputFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  disabled?: boolean;
  required?: boolean;
  error?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

export default function InputField({
  label,
  name,
  placeholder = "Enter text",
  value = "",
  onChange,
  type = "text",
  disabled = false,
  required = false,
  error,
  maxLength,
  minLength,
  pattern,
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";
  const inputType = isPasswordField && showPassword ? "text" : type;

  return (
    <div>
      <label
        className="block mb-1.5 text-[14px] font-semibold leading-none"
        style={{
          color: "#002075",
          fontFamily: "Inter",
        }}
      >
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <div className="relative w-full">
        <input
          type={inputType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          className="w-full rounded-md transition-all duration-200 outline-none px-3 py-2 text-sm font-medium bg-[#F9FAFB] text-[#182286] disabled:cursor-not-allowed disabled:opacity-50 pr-10"
          style={{
            borderColor: error ? "#DC2626" : "#E5E7EB",
            border: `1px solid ${error ? "#DC2626" : "#E5E7EB"}`,
          }}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = "#182286";
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? "#DC2626" : "#E5E7EB";
          }}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled || !value}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#182286] hover:text-[#002075] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-[11px] font-medium text-[#DC2626]">{error}</p>
      )}
    </div>
  );
}
