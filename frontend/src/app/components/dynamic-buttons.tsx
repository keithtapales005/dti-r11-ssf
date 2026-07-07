"use client";

import { ReactNode, useCallback, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

type ButtonVariant = "blue" | "white" | "red" | "clear";
type ButtonIconPosition = "left" | "right" | "none";
type ButtonSize = "small" | "medium" | "large";

export interface DynamicButtonProps {
  label: string;
  variant?: ButtonVariant;
  iconPosition?: ButtonIconPosition;
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  size?: ButtonSize;
  padding?: string;
  className?: string;
  ariaLabel?: string;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
}

interface IconProps {
  color?: string;
  size?: string;
}

// ============================================================================
// COLOR UTILITY
// ============================================================================

const lightenColor = (hex: string, percent: number) => {
  const num = parseInt(hex.replace("#", ""), 16);

  const r = (num >> 16) + Math.round(255 * percent);
  const g = ((num >> 8) & 0xff) + Math.round(255 * percent);
  const b = (num & 0xff) + Math.round(255 * percent);

  const newColor =
    (1 << 24) +
    (Math.min(255, r) << 16) +
    (Math.min(255, g) << 8) +
    Math.min(255, b);

  return `#${newColor.toString(16).slice(1)}`;
};

const darkenColor = (hex: string, percent: number) => {
  const num = parseInt(hex.replace("#", ""), 16);

  const r = (num >> 16) - Math.round(255 * percent);
  const g = ((num >> 8) & 0xff) - Math.round(255 * percent);
  const b = (num & 0xff) - Math.round(255 * percent);

  const newColor =
    (1 << 24) + (Math.max(0, r) << 16) + (Math.max(0, g) << 8) + Math.max(0, b);

  return `#${newColor.toString(16).slice(1)}`;
};

// ============================================================================
// DESIGN TOKENS
// ============================================================================

const VARIANT_COLORS: Record<ButtonVariant, { bg: string; text: string }> = {
  blue: {
    bg: "#182286",
    text: "#FEFEFE",
  },
  white: {
    bg: "#FFFFFF",
    text: "#182286",
  },
  red: {
    bg: "#DC2636",
    text: "#FEFEFE",
  },
  clear: {
    bg: "transparent",
    text: "#182286",
  },
};

const SIZE_STYLES: Record<
  ButtonSize,
  { padding: string; height: string; font: string }
> = {
  small: {
    padding: "px-6 py-3",
    height: "h-[40px]",
    font: "text-xs",
  },
  medium: {
    padding: "px-6 py-3",
    height: "h-[44px]",
    font: "text-sm",
  },
  large: {
    padding: "px-6 py-3",
    height: "h-[48px]",
    font: "text-base",
  },
};

// ============================================================================
// ICONS
// ============================================================================

const DefaultLeftIcon: React.FC<IconProps> = ({
  color = "#182286",
  size = "16",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M15 19L8 12L15 5"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DefaultRightIcon: React.FC<IconProps> = ({
  color = "#182286",
  size = "16",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M9 5L16 12L9 19"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ============================================================================
// LOADING SPINNER
// ============================================================================

const LoadingSpinner = ({ color = "#182286", size = "16" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className="animate-spin"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="2"
      opacity=".25"
    />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// ============================================================================
// MAIN BUTTON
// ============================================================================

export const DynamicButton: React.FC<DynamicButtonProps> = ({
  label,
  variant = "blue",
  iconPosition = "none",
  icon,
  loading = false,
  disabled = false,
  onClick,
  size = "small",
  padding,
  className = "",
  ariaLabel,
  fullWidth = false,
  type = "button",
}) => {
  const colors = VARIANT_COLORS[variant];
  const sizeStyle = SIZE_STYLES[size];

  const isDisabled = disabled || loading;

  const disabledBg =
    variant === "white" || variant === "clear"
      ? "#CCCCCC"
      : lightenColor(colors.bg, 0.6);

  const [interaction, setInteraction] = useState<"idle" | "hover" | "active">(
    "idle",
  );

  const computeBgAndText = () => {
    if (isDisabled) return { bg: disabledBg, text: "#999999" };

    if (variant === "clear") {
      // Clear: transparent background, text changes from #2563EB -> #182286
      const text = interaction === "idle" ? "#2563EB" : "#182286";
      return { bg: "transparent", text };
    }

    // Blue and Red: darken background on hover/active
    if (variant === "blue" || variant === "red") {
      if (interaction === "hover")
        return { bg: darkenColor(colors.bg, 0.1), text: colors.text };
      if (interaction === "active")
        return { bg: darkenColor(colors.bg, 0.12), text: colors.text };
      return { bg: colors.bg, text: colors.text };
    }

    return { bg: colors.bg, text: colors.text };
  };

  const { bg: computedBg, text: computedText } = computeBgAndText();

  const buttonStyle: React.CSSProperties = {
    backgroundColor: computedBg,
    color: computedText,
    cursor: isDisabled ? "not-allowed" : "pointer",
    transition: "all 0.12s ease-in-out",
    // remove native focus outline for clear/blue/red; keep default behavior for white
    outline: variant === "white" ? undefined : "none",
    boxShadow: variant === "white" ? undefined : "none",
  };

  const handleClick = useCallback(() => {
    if (!isDisabled) onClick?.();
  }, [isDisabled, onClick]);

  const iconColor = isDisabled ? "#999999" : computedText;

  const getIcon = () => {
    if (loading) return <LoadingSpinner color={iconColor} />;
    if (icon) return icon;

    if (iconPosition === "left") return <DefaultLeftIcon color={iconColor} />;
    if (iconPosition === "right") return <DefaultRightIcon color={iconColor} />;

    return null;
  };

  // ✅ Shadow only for WHITE buttons
  const shadowClass =
    variant === "white"
      ? "shadow-[0px_4px_8px_0px_rgba(0,0,0,0.15)]"
      : "shadow-none";

  // Focus/interaction classes: remove rings/outlines for clear/blue/red
  const focusAndInteractionClasses =
    variant === "white"
      ? "focus:outline-none focus:ring-2 focus:ring-offset-2 hover:opacity-90 active:opacity-75"
      : "focus:outline-none focus:ring-0";

  return (
    <button
      type={type}
      onClick={handleClick}
      onMouseEnter={() => setInteraction("hover")}
      onMouseLeave={() => setInteraction("idle")}
      onMouseDown={() => setInteraction("active")}
      onMouseUp={() => setInteraction("hover")}
      onFocus={() => setInteraction("hover")}
      onBlur={() => setInteraction("idle")}
      disabled={isDisabled}
      aria-label={ariaLabel || label}
      style={buttonStyle}
      className={`
        ${fullWidth ? "w-full" : "inline-flex"}
        ${sizeStyle.height}
        ${padding || sizeStyle.padding}
        ${sizeStyle.font}
        ${shadowClass}
        rounded-[5px]
        flex
        items-center
        justify-center
        gap-2
        font-medium
        font-['Inter']
        ${className}
        ${focusAndInteractionClasses}
      `}
    >
      {iconPosition === "left" && getIcon()}
      <span className="whitespace-nowrap">{label}</span>
      {iconPosition === "right" && getIcon()}
    </button>
  );
};

// ============================================================================
// BUTTON GROUP
// ============================================================================

interface ButtonGroupProps {
  buttons: DynamicButtonProps[];
  gap?: string;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  buttons,
  gap = "gap-3",
  className = "",
  orientation = "horizontal",
}) => {
  const flexDirection = orientation === "horizontal" ? "flex-row" : "flex-col";

  return (
    <div className={`flex ${flexDirection} ${gap} ${className}`}>
      {buttons.map((btn, index) => (
        <DynamicButton key={index} {...btn} />
      ))}
    </div>
  );
};

export default DynamicButton;
