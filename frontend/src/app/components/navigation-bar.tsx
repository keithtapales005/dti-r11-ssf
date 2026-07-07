"use client";

import Link from "next/link";
import { useState, useCallback, useRef, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import ProfileBadge from "./profile-badge";

// ============================================================================
// 1. DYNAMIC BUTTON (clear variant: white text, 12px for username)
// ============================================================================

type ButtonVariant = "blue" | "white" | "red" | "clear";
type ButtonIconPosition = "left" | "right" | "none";
type ButtonSize = "small" | "medium" | "large";

interface DynamicButtonProps {
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
}

// Color utilities
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

const VARIANT_COLORS: Record<ButtonVariant, { bg: string; text: string }> = {
  blue: { bg: "#182286", text: "#FEFEFE" },
  white: { bg: "#FFFFFF", text: "#182286" },
  red: { bg: "#DC2636", text: "#FEFEFE" },
  clear: { bg: "transparent", text: "#182286" },
};

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

const DynamicButton: React.FC<DynamicButtonProps> = ({
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
}) => {
  const colors = VARIANT_COLORS[variant];
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
      // ✅ Username always white
      return { bg: "transparent", text: "#FFFFFF" };
    }
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
  const iconColor = isDisabled ? "#999999" : computedText;

  const getIcon = () => {
    if (loading) return <LoadingSpinner color={iconColor} />;
    if (icon) return icon;
    return null;
  };

  // Size styles: small gives text-xs (12px), medium text-sm, large text-base
  const sizeStyles = {
    small: { height: "h-full", font: "text-[16px]" },
  };
  const style = sizeStyles[size];

  const shadowClass =
    variant === "white"
      ? "shadow-[0px_4px_8px_0px_rgba(0,0,0,0.15)]"
      : "shadow-none";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setInteraction("hover")}
      onMouseLeave={() => setInteraction("idle")}
      onMouseDown={() => setInteraction("active")}
      onMouseUp={() => setInteraction("hover")}
      onFocus={() => setInteraction("hover")}
      onBlur={() => setInteraction("idle")}
      disabled={isDisabled}
      aria-label={ariaLabel || label}
      style={{ backgroundColor: computedBg, color: computedText }}
      className={`
        ${fullWidth ? "w-full" : "inline-flex"}
        ${style.height}
        ${padding || style.padding}
        ${style.font}
        ${shadowClass}
        rounded-[5px]
        flex items-center justify-center gap-2
        font-medium font-['Inter']
        ${className}
        focus:outline-none focus:ring-0
      `}
    >
      {iconPosition === "left" && getIcon()}
      <span className="whitespace-nowrap">{label}</span>
      {iconPosition === "right" && getIcon()}
    </button>
  );
};

// ============================================================================
// 2. CHEVRON DOWN ICON
// ============================================================================

const ChevronDownIcon = ({
  size = 20,
  stroke = "currentColor",
  strokeWidth = 2,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ============================================================================
// 3. TYPES & INTERFACES
// ============================================================================

export interface UserProfile {
  username: string;
  initials?: string;
  firstName?: string;
  lastName?: string;
  userId?: string;
  isOnline?: boolean;
  avatarUrl?: string;
  onProfileClick?: () => void;
  onDropdownToggle?: (isOpen: boolean) => void;
  onLogout?: () => void;
  avatarBgColor?: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
}

export interface NavigationBarProps {
  brandName?: string;
  tagline?: string;
  userProfile?: UserProfile;
  navItems?: NavItem[];
  logoBoxColors?: string[];
  onLogoClick?: () => void;
  className?: string;
}

// ============================================================================
// 4. LOGO
// ============================================================================

const Logo: React.FC<{ onClick?: () => void; ariaLabel?: string }> = ({
  onClick,
  ariaLabel = "Shared Service Facilities Logo",
}) => (
  <div
    className="w-24 h-10 flex justify-start items-center cursor-pointer"
    onClick={onClick}
    role="button"
    tabIndex={onClick ? 0 : -1}
    aria-label={ariaLabel}
    onKeyDown={(e) => {
      if (onClick && (e.key === "Enter" || e.key === " ")) onClick();
    }}
  >
    <img
      src="/ssf-logo.png"
      alt="SSF Logo"
      className="h-full w-auto object-contain"
    />
  </div>
);

// ============================================================================
// 5. BRANDING (tagline italic)
// ============================================================================

const BrandingSection: React.FC<{ brandName?: string; tagline?: string }> = ({
  brandName = "Shared Service Facilities",
  tagline = '"Shared Success for Filipino MSMEs"',
}) => (
  <div className="inline-flex flex-col justify-start items-start gap-0">
    <div className="text-white text-base font-semibold font-['Inter'] whitespace-nowrap">
      {brandName}
    </div>
    <div className="text-white text-xs italic font-normal font-['IM_FELL_Great_Primer'] whitespace-nowrap">
      {tagline}
    </div>
  </div>
);

// ============================================================================
// 6. USER MENU (DynamicButton + Dropdown with Logout)
// ============================================================================

const UserMenu: React.FC<{
  username: string;
  onLogout?: () => void;
  onToggle?: (isOpen: boolean) => void;
}> = ({ username, onLogout, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const toggleDropdown = useCallback(() => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  }, [isOpen, onToggle]);

  const handleLogout = useCallback(() => {
    // Navigate to the login page, then invoke any provided logout callback.
    try {
      router.push("/login-page");
    } catch {
      /* ignore router errors */
    }
    onLogout?.();
    setIsOpen(false);
    onToggle?.(false);
  }, [onLogout, onToggle, router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onToggle?.(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onToggle]);

  return (
    <div ref={menuRef} className="relative">
      {/* 
        - size="small" gives text-xs (12px) and appropriate padding
        - inline-flex ensures width depends on content (username length)
        - whitespace-nowrap prevents wrapping
      */}
      <DynamicButton
        label={username}
        variant="clear"
        iconPosition="right"
        icon={<ChevronDownIcon size={17} stroke="white" />}
        onClick={toggleDropdown}
        size="small"
        className="text-white hover:bg-white/10 transition-colors"
      />
      {isOpen && (
        <div className="absolute right-0 mt-6 w-30 bg-white rounded-md shadow-lg z-20 border border-gray-200">
          <button
            onClick={handleLogout}
            className="block w-full text-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 7. USER SECTION (ProfileBadge + UserMenu)
// ============================================================================

const UserSection: React.FC<{ userProfile?: UserProfile }> = ({
  userProfile,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDropdownToggle = useCallback(
    (isOpen: boolean) => {
      setIsDropdownOpen(isOpen);
      userProfile?.onDropdownToggle?.(isOpen);
    },
    [userProfile],
  );

  const getFirstName = () => {
    if (userProfile?.firstName) return userProfile.firstName;
    if (userProfile?.initials) return userProfile.initials[0] || "U";
    return userProfile?.username?.charAt(0) || "U";
  };

  const getLastName = () => {
    if (userProfile?.lastName) return userProfile.lastName;
    if (userProfile?.initials && userProfile.initials.length > 1)
      return userProfile.initials[1];
    return "";
  };

  return (
    <div className="flex justify-start items-center gap-5">
      <ProfileBadge
        firstName={getFirstName()}
        lastName={getLastName()}
        userId={userProfile?.userId}
        isOnline={userProfile?.isOnline ?? true}
        avatarUrl={userProfile?.avatarUrl}
        isLoading={false}
        onClick={userProfile?.onProfileClick}
      />
      <UserMenu
        username={userProfile?.username || "Username"}
        onLogout={userProfile?.onLogout}
        onToggle={handleDropdownToggle}
      />
    </div>
  );
};

// ============================================================================
// 8. MAIN NAVIGATION BAR
// ============================================================================

export const NavigationBar: React.FC<NavigationBarProps> = ({
  brandName = "Shared Service Facilities",
  tagline = '"Shared Success for Filipino MSMEs"',
  userProfile,
  onLogoClick,
  className = "",
  navItems = [],
}) => {
  const router = useRouter();
  const navBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navBarRef.current &&
        !navBarRef.current.contains(event.target as Node)
      ) {
        userProfile?.onDropdownToggle?.(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userProfile]);

  return (
    <div
      ref={navBarRef}
      className={`w-full h-20 px-10 pr-12 py-3.5 bg-[#182286] shadow-lg flex justify-between items-center gap-6 ${className}`}
      style={{ backgroundColor: "#182286" }}
      role="banner"
    >
      <div className="flex items-center gap-6 min-w-0 flex-1">
        <div className="flex justify-start items-center gap-3 shrink-0">
          <Logo onClick={onLogoClick} />
          <BrandingSection brandName={brandName} tagline={tagline} />
        </div>

        <div className="flex items-center gap-4 ml-auto">
          {navItems.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
              {navItems.map((item) => {
                const isActive = item.isActive ?? false;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick();
                        return;
                      }

                      router.push(item.href);
                    }}
                    className={`rounded-[5px] px-4 py-2 text-sm font-small transition-colors ${
                      isActive
                        ? "bg-white text-[#182286]"
                        : "text-white hover:bg-white/10"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
          {userProfile && <UserSection userProfile={userProfile} />}
        </div>
      </div>
      <div className="flex items-center gap-6">
        {navItems && navItems.length > 0 && (
          <nav aria-label="Primary" className="flex items-center gap-6">
            {navItems.map((item) =>
              item.isActive ? (
                <span
                  key={item.id}
                  aria-current="page"
                  className="text-[16px] font-medium font-['Inter'] whitespace-nowrap text-white/70"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={item.onClick}
                  className="text-[16px] font-medium font-['Inter'] whitespace-nowrap text-white transition-opacity hover:opacity-80"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        )}
        {userProfile && <UserSection userProfile={userProfile} />}
      </div>
    </div>
  );
};

export default NavigationBar;
