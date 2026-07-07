"use client";

import React, { useState, useEffect, useCallback } from "react";
import { HiXMark } from "react-icons/hi2";

/* =========================
   ICON COMPONENTS
========================= */

/**
 * Check Icon - Success/Checkmark
 */
export const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

/**
 * Close Icon - Error/X Mark
 */
export const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/**
 * Info Icon - Information
 */
export const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
  </svg>
);

/**
 * Warning Icon - Alert/Triangle
 */
export const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export type ToastType = "success" | "error" | "info" | "warning";

export type ToastPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

/**
 * Toast Props Interface
 * Configuration for individual toast notifications
 */
export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  duration?: number;
  onClose?: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  isClosable?: boolean;
}

/**
 * Toast State Interface
 * Manages multiple toast notifications
 */
export interface ToastState {
  toasts: ToastProps[];
  position: ToastPosition;
}

export interface ToastContextType {
  addToast: (toast: Omit<ToastProps, "id">) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

/* =========================
   COLOR CONFIGURATION
========================= */

const toastColors: Record<
  ToastType,
  { bar: string; bg: string; icon: string }
> = {
  success: {
    bar: "bg-[#009900]",
    bg: "bg-white",
    icon: "text-green-700",
  },
  error: {
    bar: "bg-[#DC2636]",
    bg: "bg-white",
    icon: "text-[#DC2636]",
  },
  info: {
    bar: "bg-blue-500",
    bg: "bg-white",
    icon: "text-blue-500",
  },
  warning: {
    bar: "bg-yellow-500",
    bg: "bg-white",
    icon: "text-yellow-500",
  },
};

/* =========================
   TOAST ICON SUB-COMPONENT
========================= */

const ToastIcon: React.FC<{
  type: ToastType;
  customIcon?: React.ReactNode;
}> = ({ type, customIcon }) => {
  const colors = toastColors[type];

  const defaultIcons: Record<ToastType, React.ReactNode> = {
    success: <CheckIcon />,
    error: <CloseIcon />,
    info: <InfoIcon />,
    warning: <WarningIcon />,
  };

  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${colors.bar}`}
    >
      {customIcon ? (
        <div className="w-5 h-5 text-white">{customIcon}</div>
      ) : (
        <div className="w-5 h-5 text-white">{defaultIcons[type]}</div>
      )}
    </div>
  );
};

/* =========================
   TOAST CONTENT SUB-COMPONENT
========================= */

/**
 * Toast Content Sub-component
 * Displays title and description text
 */
const ToastContent: React.FC<{
  title: string;
  description?: string;
}> = ({ title, description }) => (
  <div className="flex flex-col justify-start items-start gap-0.5 flex-1">
    <h3 className="text-black text-sm font-semibold font-['Inter'] leading-tight">
      {title}
    </h3>
    {description && (
      <p className="text-black text-[10px] font-light font-['Inter'] leading-tight opacity-80">
        {description}
      </p>
    )}
  </div>
);

/* =========================
   TOAST BAR SUB-COMPONENT
========================= */

/**
 * Toast Bar Sub-component
 * Colored indicator bar on the left side of the toast
 */
const ToastBar: React.FC<{ type: ToastType }> = ({ type }) => {
  const barColor = toastColors[type].bar;
  return (
    <div
      className={`w-3 h-16 rounded-tl-[5px] rounded-bl-[5px] shrink-0 ${barColor}`}
      role="presentation"
      aria-hidden="true"
    />
  );
};

/* =========================
   TOAST CLOSE BUTTON SUB-COMPONENT
========================= */

/**
 * Toast Close Button Sub-component
 * Dismissible close button for the toast
 */
const ToastCloseButton: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => (
  <button
    onClick={onClose}
    className="px-0 py-3 hover:bg-black/5 rounded transition-colors
               focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 shrink-0"
    aria-label="Close notification"
    type="button"
  >
    <HiXMark className="w-3 h-3 text-black" strokeWidth={1.5} />
  </button>
);

/* =========================
   MAIN TOAST COMPONENT
========================= */

/**
 * Dynamic Toast Component
 * Renders a single toast notification with customizable content and behavior
 *
 * Features:
 * - Multiple toast types (success, error, info, warning)
 * - Auto-dismiss capability with configurable duration
 * - Customizable icons and actions
 * - Full keyboard and screen reader support
 * - Smooth animations and transitions
 * - Dismissible with close button
 */
export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  description,
  icon,
  duration = 5000,
  onClose,
  action,
  isClosable = true,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.(id);
    }, 300);
  }, [id, onClose]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  return (
    <div
      className={`w-96 h-16 pr-3 bg-white rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] inline-flex justify-start items-start gap-2.5 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
      }`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Left colored bar */}
      <ToastBar type={type} />

      {/* Main content container */}
      <div className="flex justify-start items-center gap-4 flex-1 py-3">
        {/* Icon */}
        <ToastIcon type={type} customIcon={icon} />

        {/* Title and description */}
        <ToastContent title={title} description={description} />
      </div>

      {/* Action button or close button */}
      {isClosable && <ToastCloseButton onClose={handleClose} />}
      {action && !isClosable && (
        <button
          onClick={action.onClick}
          className="px-3 py-1 text-xs font-medium text-white bg-black rounded hover:bg-black hover:bg-opacity-80 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 shrink-0"
          type="button"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

/* =========================
   TOAST CONTAINER COMPONENT
========================= */

/**
 * Toast Container Component
 * Manages and displays multiple toast notifications with positioning
 *
 * Use this to wrap your application for global toast management
 */
export interface ToastContainerProps {
  toasts: ToastProps[];
  position?: ToastPosition;
  onRemoveToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position = "top-right",
  onRemoveToast,
}) => {
  const positionClasses: Record<ToastPosition, string> = {
    "top-left": "top-4 left-4 flex-col",
    "top-right": "top-4 right-4 flex-col",
    "bottom-left": "bottom-4 left-4 flex-col-reverse",
    "bottom-right": "bottom-4 right-4 flex-col-reverse",
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} gap-2 pointer-events-none z-50`}
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onClose={onRemoveToast} />
        </div>
      ))}
    </div>
  );
};

export default Toast;
