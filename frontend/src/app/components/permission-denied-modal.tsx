"use client";

import { useEffect } from "react";

interface PermissionDeniedModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PermissionDeniedModal({
  open,
  onClose,
}: PermissionDeniedModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="permission-denied-title"
        aria-describedby="permission-denied-message"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-[40px] bg-white p-6 text-center shadow-[0px_8px_32px_rgba(0,0,0,0.25)]"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FEE2E2]">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#DC2626"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h2
          id="permission-denied-title"
          className="mb-1.5 text-xl font-bold text-black"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Permission denied
        </h2>

        <p
          id="permission-denied-message"
          className="mb-5 text-sm text-black"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          You do not have enough permissions to perform such action.
        </p>

        <button
          autoFocus
          onClick={onClose}
          className="w-full rounded-lg bg-[#182286] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#101a66] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#182286]"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
