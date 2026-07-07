"use client";

import React, { useState, useRef, useEffect } from "react";
import { HiOutlineSelector } from "react-icons/hi";

/* ================= TYPES ================= */

export interface DropdownOption {
  id: string | number;
  label: string;
  value: string | number;
}

interface DropdownProps {
  options: DropdownOption[];
  placeholder?: string;
  selectedValue?: string | number;
  onSelect?: (option: DropdownOption) => void;
  disabled?: boolean;
  error?: string;
  variant?: "primary" | "secondary";
  label?: string;
  required?: boolean;
  showRequiredAsterisk?: boolean;
}

/* ================= COMPONENT ================= */

export default function Dropdown({
  options,
  placeholder = "Select an option",
  selectedValue,
  onSelect,
  disabled = false,
  error,
  variant = "primary",
  label,
  required = false,
  showRequiredAsterisk = required,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* ================= ACTIVE SELECTED ================= */

  const activeSelected =
    selectedValue !== undefined
      ? options.find(
          (opt) => opt.id === selectedValue || opt.value === selectedValue,
        ) || null
      : null;

  /* ================= CLOSE ON OUTSIDE CLICK ================= */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= HANDLE SELECT ================= */

  const handleSelect = (option: DropdownOption) => {
    onSelect?.(option);
    setIsOpen(false);
  };

  /* ================= LONGEST TEXT WIDTH FIX ================= */

  const allTexts = [
    placeholder,
    activeSelected?.label,
    ...options.map((o) => o.label),
  ].filter(Boolean) as string[];

  const longestText =
    allTexts.reduce((a, b) => (b.length > a.length ? b : a), "") || placeholder;

  /* ============================================================
     SECONDARY VARIANT (INPUT STYLE)
  ============================================================ */

  if (variant === "secondary") {
    return (
      <div ref={dropdownRef} className="w-full">
        {label && (
          <label className="block mb-2 text-[16px] font-semibold text-[#002075]">
            {label}
            {showRequiredAsterisk && (
              <span className="text-red-600 ml-1">*</span>
            )}
          </label>
        )}

        <div className="relative inline-grid w-full">
          {/* hidden measurement */}
          <div
            aria-hidden
            className="opacity-0 pointer-events-none flex justify-between px-3 py-2.5 text-sm"
            style={{ gridColumn: 1, gridRow: 1 }}
          >
            <span>{longestText}</span>
            <HiOutlineSelector size={16} />
          </div>

          <div style={{ gridColumn: 1, gridRow: 1 }}>
            {/* BUTTON */}
            <button
              onClick={() => !disabled && setIsOpen(!isOpen)}
              disabled={disabled}
              className="w-full flex justify-between items-center px-3 py-2.5 text-[12px] rounded-[5px] transition-all"
              style={{
                background: "#F9FAFB",
                border: `1px solid ${
                  error ? "#DC2626" : isOpen ? "#182286" : "#E5E7EB"
                }`,
                color: "#182286",
                opacity: disabled ? 0.5 : 1,
              }}
            >
              <span className="flex-1 text-left">
                {activeSelected?.label || placeholder}
              </span>

              <HiOutlineSelector
                size={16}
                style={{
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "0.2s",
                }}
              />
            </button>

            {/* MENU */}
            {isOpen && !disabled && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-[5px] z-50">
                <div className="max-h-40 overflow-y-auto p-1.5">
                  {options.length ? (
                    options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleSelect(option)}
                        className="w-full text-left px-4 py-2 text-[12px] text-[#182286] hover:bg-indigo-100 rounded-[5px]"
                      >
                        {option.label}
                      </button>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 py-2">
                      No options available
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <p className="text-[12px] mt-1 text-red-600 font-medium">{error}</p>
        )}
      </div>
    );
  }

  /* ============================================================
     PRIMARY VARIANT
  ============================================================ */

  return (
    <div ref={dropdownRef}>
      <div className="relative inline-grid">
        {/* hidden measurement */}
        <div
          aria-hidden
          className="opacity-0 pointer-events-none flex justify-between h-10 px-6 py-3 text-[12px]"
          style={{ gridColumn: 1, gridRow: 1 }}
        >
          <span>{longestText}</span>
          <HiOutlineSelector size={16} />
        </div>

        <div style={{ gridColumn: 1, gridRow: 1 }}>
          <button
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className="flex justify-between items-center px-3 py-2 rounded-[5px] text-[12px] transition-all h-10 w-full"
            style={{
              background: "#FEFEFE",
              color: "#182286",
              boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
              border: isOpen ? "2px solid #182286" : "3px solid transparent",
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <span className="flex-1 text-center font-medium">
              {activeSelected?.label || placeholder}
            </span>

            <HiOutlineSelector
              size={16}
              style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "0.2s",
              }}
            />
          </button>

          {isOpen && !disabled && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-[5px] shadow-lg z-50">
              <div className="max-h-60 overflow-y-auto p-2">
                {options.length ? (
                  options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleSelect(option)}
                      className="w-full text-left px-6 py-3 text-[12px] text-[#182286] hover:bg-indigo-100 rounded-[5px]"
                    >
                      {option.label}
                    </button>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-2">
                    No options available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
