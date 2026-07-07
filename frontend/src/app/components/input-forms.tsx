"use client";

import React, { ReactNode } from "react";
import { MdClose } from "react-icons/md";

interface InputFormsProps {
  title: string;
  children: ReactNode;
  onSubmit?: () => void;
  onCancel?: () => void;
  onSecondaryAction?: () => void;
  showCloseButton?: boolean;
  width?: string;
  buttonLabel?: string;
  secondaryButtonLabel?: string;
  secondaryButtonVariant?: "white" | "red";
  buttonLoading?: boolean;
  buttonDisabled?: boolean;
  secondaryButtonLoading?: boolean;
  secondaryButtonDisabled?: boolean;
  mode?: "add" | "edit";
}

export default function InputForms({
  title,
  children,
  onSubmit,
  onCancel,
  onSecondaryAction,
  showCloseButton = true,
  width = "666px",
  buttonLabel,
  secondaryButtonLabel,
  secondaryButtonVariant = "white",
  buttonLoading = false,
  buttonDisabled = false,
  secondaryButtonLoading = false,
  secondaryButtonDisabled = false,
  mode = "add",
}: InputFormsProps) {
  const defaultButtonLabel = mode === "edit" ? "Save Changes" : "Add Project";
  const finalButtonLabel = buttonLabel || defaultButtonLabel;
  const hasSecondaryButton = Boolean(secondaryButtonLabel);

  return (
    <div
      style={{
        width,
        maxWidth: "560px",
        height: "680px",
        padding: "28px 22px",
        borderRadius: "10px",
        background: "#FDFDFD",
        boxShadow: "0 4px 4px rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Close Button */}
      {showCloseButton && (
        <button
          onClick={onCancel}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          aria-label="Close form"
        >
          <MdClose size={24} color="#002075" />
        </button>
      )}

      {/* Title */}
      <h1
        style={{
          fontSize: "26px",
          fontWeight: "bold",
          color: "#002075",
          textAlign: "center",
        }}
      >
        {title}
      </h1>

      {/* FORM CONTENT */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "100%",
          flex: 1,
          minHeight: 0,
        }}
      >
        {children}
      </div>

      {/* ACTIONS */}
      <div style={{ width: "100%", display: "flex", gap: "12px" }}>
        {hasSecondaryButton && (
          <button
            onClick={onSecondaryAction}
            disabled={secondaryButtonDisabled || secondaryButtonLoading}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              backgroundColor:
                secondaryButtonVariant === "red" ? "#DC2636" : "#F3F4F6",
              color: secondaryButtonVariant === "red" ? "#FFFFFF" : "#182286",
              fontSize: "14px",
              fontWeight: 600,
              cursor:
                secondaryButtonDisabled || secondaryButtonLoading
                  ? "not-allowed"
                  : "pointer",
              opacity:
                secondaryButtonDisabled || secondaryButtonLoading ? 0.7 : 1,
            }}
          >
            {secondaryButtonLoading ? "Please wait..." : secondaryButtonLabel}
          </button>
        )}

        <button
          onClick={onSubmit}
          disabled={buttonDisabled || buttonLoading}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            backgroundColor:
              buttonDisabled || buttonLoading ? "#9CA3AF" : "#002075",
            color: "#FFFFFF",
            fontSize: "14px",
            fontWeight: 600,
            cursor: buttonDisabled || buttonLoading ? "not-allowed" : "pointer",
            opacity: buttonDisabled || buttonLoading ? 0.7 : 1,
          }}
        >
          {buttonLoading ? "Saving..." : finalButtonLabel}
        </button>
      </div>
    </div>
  );
}
