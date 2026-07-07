"use client";

import React from "react";
import { DynamicButton } from "@/app/components/dynamic-buttons";

// ============================================================================
// TYPES
// ============================================================================

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
  disabled?: boolean;
}

// ============================================================================
// DESIGN TOKENS
// ============================================================================

const MODAL_STYLES = {
  CONTAINER: {
    WIDTH: "460px",
    MIN_HEIGHT: "200px",
    PADDING: "32px",
    PADDING_TOP: "40px",
    GAP: "24px",
    BORDER_RADIUS: "10px",
  },
  COLORS: {
    PRIMARY: "#182286",
    TEXT: "#000000",
    BACKGROUND: "#FDFDFD",
    OVERLAY: "rgba(0, 0, 0, 0.5)",
  },
};

// ============================================================================
// CONFIRMATION MODAL COMPONENT
// ============================================================================

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  cancelLabel = "Cancel",
  confirmLabel = "Save Changes",
  onCancel,
  onConfirm,
  loading = false,
  disabled = false,
}) => {
  if (!isOpen) {
    return null;
  }

  // ========================================================================
  // INLINE STYLES
  // ========================================================================

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: MODAL_STYLES.COLORS.OVERLAY,
  };

  const modalContainerStyle: React.CSSProperties = {
    position: "relative",
    display: "flex",
    width: MODAL_STYLES.CONTAINER.WIDTH,
    minHeight: MODAL_STYLES.CONTAINER.MIN_HEIGHT,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: MODAL_STYLES.CONTAINER.PADDING,
    paddingTop: MODAL_STYLES.CONTAINER.PADDING_TOP,
    gap: MODAL_STYLES.CONTAINER.GAP,
    borderRadius: MODAL_STYLES.CONTAINER.BORDER_RADIUS,
    backgroundColor: MODAL_STYLES.COLORS.BACKGROUND,
  };

  const contentContainerStyle: React.CSSProperties = {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "8px",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "20px",
    fontWeight: "700",
    color: MODAL_STYLES.COLORS.PRIMARY,
  };

  const messageStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: "400",
    color: MODAL_STYLES.COLORS.TEXT,
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    alignSelf: "stretch",
  };

  // ------------------------------------------------------------------------
  // ACTION PLACEHOLDERS
  // ------------------------------------------------------------------------
  // These wrappers call the external callbacks and include a placeholder
  // spot for future functionality (e.g. API calls, state updates).
  const handleCancelClick = () => {
    // Call external handler first so parent can manage closing/state
    onCancel();

    // Placeholder: implement cancel-side effects here (analytics, rollback)
    console.log("ConfirmationModal: cancel clicked (placeholder)");
  };

  const handleConfirmClick = () => {
    // Call external handler first so parent can manage the confirmed action
    onConfirm();

    // Placeholder: implement confirm-side effects here (API request, save)
    console.log("ConfirmationModal: confirm clicked (placeholder)");
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
    >
      {/* Overlay */}
      <div style={overlayStyle} onClick={onCancel} aria-hidden="true" />

      {/* Modal Container */}
      <div style={modalContainerStyle} tabIndex={-1}>
        {/* Content Container */}
        <div style={contentContainerStyle}>
          {/* Title */}
          <h2 id="confirmation-modal-title" style={titleStyle}>
            {title}
          </h2>

          {/* Message */}
          <p style={messageStyle}>{message}</p>
        </div>

        {/* Button Container */}
        <div style={buttonContainerStyle}>
          {/* Cancel Button */}
          <DynamicButton
            label={cancelLabel}
            variant="red"
            onClick={handleCancelClick}
            size="medium"
            disabled={disabled || loading}
            loading={loading}
            fullWidth
          />

          {/* Confirm Button */}
          <DynamicButton
            label={confirmLabel}
            variant="blue"
            onClick={handleConfirmClick}
            size="medium"
            disabled={disabled || loading}
            loading={loading}
            fullWidth
          />
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
