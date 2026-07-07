"use client";

import React, { useState, FormEvent } from "react";
import { HiSearch } from "react-icons/hi";

interface SearchBarProps {
  onSearch?: (query: string) => Promise<void> | void;
  placeholder?: string;
  isLoading?: boolean;
}

export default function SearchBar({
  onSearch,
  placeholder = "Search",
  isLoading = false,
}: SearchBarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchValue.trim() || isSubmitting || isLoading) return;

    setIsSubmitting(true);
    try {
      if (onSearch) {
        await onSearch(searchValue);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    width: "100%",
    maxWidth: "100%",
    flexDirection: "column",
    alignItems: "stretch",
  };

  const searchInputContainerStyle: React.CSSProperties = {
    display: "flex",
    width: "100%",
    alignItems: "center",
    padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.15)",
    border: "none",
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "clamp(14px, 2vw, 16px)",
    color: "#182286",
    backgroundColor: "transparent",
    fontFamily: "inherit",
    minWidth: 0, // Prevents flex overflow
  };

  const iconStyle: React.CSSProperties = {
    color: isSubmitting || isLoading ? "#D1D5DB" : "#182286",
    fontSize: "clamp(18px, 3vw, 20px)",
    flexShrink: 0,
    cursor: isSubmitting || isLoading ? "not-allowed" : "pointer",
    transition: "color 0.2s ease",
  };

  return (
    <form onSubmit={handleSubmit} style={{ ...containerStyle, width: "100%" }}>
      <div style={searchInputContainerStyle}>
        <input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          style={inputStyle}
          disabled={isSubmitting || isLoading}
          aria-label="search input"
        />
        <button
          type="submit"
          style={{
            background: "none",
            border: "none",
            padding: "0",
            cursor: isSubmitting || isLoading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          disabled={isSubmitting || isLoading}
          aria-label="search button"
        >
          <HiSearch style={iconStyle} />
        </button>
      </div>
    </form>
  );
}
