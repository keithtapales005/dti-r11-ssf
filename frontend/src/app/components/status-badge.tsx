"use client";

import React from "react";

export interface StatusBadgeProps {
  status:
    | "Ongoing"
    | "Currently Established"
    | "Established - Operational"
    | "Established - Partially Operational"
    | "Established - Non-Operational"
    | "Extended"
    | "Transferred"
    | "Fully Transferred"
    | "Disposed"
    | "For Approval";
  isLoading?: boolean;
  variant?: "small" | "large";
}

export const STATUS_CONFIG = {
  "Ongoing": {
    backgroundColor: "#FFF3CD",
    color: "#856404",
  },
  "Currently Established": {
    backgroundColor: "#D4EDDA",
    color: "#155724",
  },
  "Established - Operational": {
    backgroundColor: "#28A745",
    color: "#FFFFFF",
  },
  "Established - Partially Operational": {
    backgroundColor: "#FFC107",
    color: "#212529",
  },
  "Established - Non-Operational": {
    backgroundColor: "#DC3545",
    color: "#FFFFFF",
  },
  "Extended": {
    backgroundColor: "#17A2B8",
    color: "#FFFFFF",
  },
  "Transferred": {
    backgroundColor: "#6F42C1",
    color: "#FFFFFF",
  },
  "Fully Transferred": {
    backgroundColor: "#20C997",
    color: "#FFFFFF",
  },
  "Disposed": {
    backgroundColor: "#6C757D",
    color: "#FFFFFF",
  },
  "For Approval": {
    backgroundColor: "#CECECE",
    color: "#FFFFFF",
  },
};

export default function StatusBadge({
  status,
  isLoading = false,
  variant = "small",
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    backgroundColor: "#E5E7EB", // Light gray placeholder
    color: "#4B5563",           // Gray typography text
  };
  const isLarge = variant === "large";

  if (isLoading) {
    return (
      <div
        style={{
          width: isLarge ? "150px" : "130px",
          height: isLarge ? "42px" : "34px",
          borderRadius: isLarge ? "10px" : "8px",
          backgroundColor: "#E5E7EB",
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          width: isLarge ? "163px" : "130px",
          padding: isLarge ? "5px 16px" : "4px 16px",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
          borderRadius: isLarge ? "10px" : "8px",
          backgroundColor: config.backgroundColor,
          color: config.color,
          fontSize: isLarge ? "14px" : "10px",
          fontWeight: "600",
          opacity: isLoading ? 0.6 : 1,
          transition: "opacity 0.2s ease",
          whiteSpace: "nowrap",
        }}
      >
        {status}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}