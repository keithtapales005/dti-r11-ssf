"use client";

import React from "react";

interface ProfileBadgeProps {
  firstName: string;
  lastName: string;
  userId?: string;
  isOnline?: boolean;
  avatarUrl?: string;
  isLoading?: boolean;
  onClick?: () => void;
}

// Color palette for profile badges
const BADGE_COLORS = [
  "#EF5350", // Red
  "#66BB6A", // Green
  "#42A5F5", // Blue
  "#AB47BC", // Purple
  "#FFA726", // Orange
  "#29B6F6", // Light Blue
  "#EC407A", // Pink
  "#5ab5c8", // Teal
];

// Hash function to consistently generate a color based on name
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export default function ProfileBadge({
  firstName,
  lastName,
  userId,
  isOnline = true,
  avatarUrl,
  isLoading = false,
  onClick,
}: ProfileBadgeProps) {
  // Get initials
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  // Generate consistent color based on userId or name
  const hashInput = userId || `${firstName}${lastName}`;
  const colorIndex = hashString(hashInput) % BADGE_COLORS.length;
  const backgroundColor = BADGE_COLORS[colorIndex];

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: "40px",
    height: "41px",
    display: "inline-block",
    cursor: onClick ? "pointer" : "default",
  };

  const badgeStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    backgroundColor: avatarUrl ? "transparent" : backgroundColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "700",
    color: "#182286",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    opacity: isLoading ? 0.6 : 1,
    transition: "opacity 0.2s ease",
    backgroundImage: avatarUrl ? `url(${avatarUrl})` : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const skeletonStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    backgroundColor: "#E5E7EB",
    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
  };

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={skeletonStyle} />
      </div>
    );
  }

  return (
    <div
      style={containerStyle}
      onClick={onClick}
      role="button"
      tabIndex={onClick ? 0 : -1}
    >
      <div style={badgeStyle}>{!avatarUrl && initials}</div>
      {/* <div style={onlineIndicatorStyle} /> */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
