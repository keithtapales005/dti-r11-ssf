"use client";

import { useState, useCallback } from "react";

// ============================================================================
// TYPE DEFINITIONS & INTERFACES
// ============================================================================

interface PaginationPageItem {
  pageNumber: number;
  isActive?: boolean;
}

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (pageNumber: number) => void;
  onPreviousClick?: () => void;
  onNextClick?: () => void;
  showPageNumbers?: boolean;
  disabled?: boolean;
  className?: string;
}

// ============================================================================
// ARROW ICON COMPONENT
// ============================================================================

interface ArrowIconProps {
  direction: "left" | "right";
  color?: string;
}

const ArrowIcon: React.FC<ArrowIconProps> = ({
  direction,
  color = "#182286",
}) => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {direction === "left" ? (
      <path
        d="M10 12L6 8L10 4"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <path
        d="M6 12L10 8L6 4"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

// ============================================================================
// NAVIGATION BUTTON COMPONENT
// ============================================================================

interface NavButtonProps {
  label: string;
  direction: "previous" | "next";
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

const NavButton: React.FC<NavButtonProps> = ({
  label,
  direction,
  onClick,
  disabled = false,
  ariaLabel,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel || label}
    className={`px-3 py-1 rounded-md flex justify-center items-center gap-2 transition-all ${
      disabled
        ? "opacity-50 cursor-not-allowed"
        : "hover:bg-blue-50 active:bg-[#182286] cursor-pointer"
    }`}
  >
    {direction === "previous" && (
      <>
        <ArrowIcon direction="left" color={disabled ? "#6D7380" : "#182286"} />
        <div
          className={`justify-start text-base font-medium font-['Inter'] whitespace-nowrap ${
            disabled ? "text-gray-400" : "text-blue-900"
          }`}
        >
          {label}
        </div>
      </>
    )}
    {direction === "next" && (
      <>
        <div
          className={`justify-start text-base font-medium font-['Inter'] whitespace-nowrap ${
            disabled ? "text-gray-400" : "text-[#182286]"
          }`}
        >
          {label}
        </div>
        <ArrowIcon direction="right" color={disabled ? "#6D7380" : "#182286"} />
      </>
    )}
  </button>
);

// ============================================================================
// PAGE NUMBER BUTTON COMPONENT
// ============================================================================

interface PageNumberButtonProps {
  pageNumber: number;
  isActive?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  ariaCurrent?: "page" | undefined;
}

const PageNumberButton: React.FC<PageNumberButtonProps> = ({
  pageNumber,
  isActive = false,
  onClick,
  ariaLabel,
  ariaCurrent,
}) => (
  <button
    onClick={onClick}
    aria-current={ariaCurrent}
    aria-label={ariaLabel || `Page ${pageNumber}`}
    className={`w-8 h-8 rounded-lg flex justify-center items-center transition-all font-medium font-['Inter'] ${
      isActive
        ? "bg-[#182286] text-white shadow-md"
        : "text-[#182286] hover:bg-blue-50 active:bg-blue-100"
    }`}
  >
    {pageNumber}
  </button>
);

interface PageNumbersGroupProps {
  pages: PaginationPageItem[];
  onPageClick?: (pageNumber: number) => void;
}

const PageNumbersGroup: React.FC<PageNumbersGroupProps> = ({
  pages,
  onPageClick,
}) => {
  if (pages.length === 0) {
    return null;
  }

  return (
    <div
      className="flex justify-start items-center gap-2"
      role="group"
      aria-label="Page numbers"
    >
      {pages.map((page) => (
        <PageNumberButton
          key={`page-${page.pageNumber}`}
          pageNumber={page.pageNumber}
          isActive={page.isActive}
          onClick={() => onPageClick?.(page.pageNumber)}
          ariaCurrent={page.isActive ? "page" : undefined}
        />
      ))}
    </div>
  );
};

export const Pagination: React.FC<PaginationProps> = ({
  currentPage = 1,
  totalPages = 5,
  onPageChange,
  onPreviousClick,
  onNextClick,
  showPageNumbers = true,
  disabled = false,
  className = "",
}) => {
  const [activePage, setActivePage] = useState(currentPage);

  // Generate page items array
  const getPageItems = useCallback((): PaginationPageItem[] => {
    const pages: PaginationPageItem[] = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push({
        pageNumber: i,
        isActive: i === activePage,
      });
    }
    return pages;
  }, [activePage, totalPages]);

  const handlePreviousClick = useCallback(() => {
    if (activePage > 1 && !disabled) {
      const newPage = activePage - 1;
      setActivePage(newPage);
      onPageChange?.(newPage);
      onPreviousClick?.();
    }
  }, [activePage, disabled, onPageChange, onPreviousClick]);

  const handleNextClick = useCallback(() => {
    if (activePage < totalPages && !disabled) {
      const newPage = activePage + 1;
      setActivePage(newPage);
      onPageChange?.(newPage);
      onNextClick?.();
    }
  }, [activePage, totalPages, disabled, onPageChange, onNextClick]);

  const handlePageClick = useCallback(
    (pageNumber: number) => {
      if (!disabled) {
        setActivePage(pageNumber);
        onPageChange?.(pageNumber);
      }
    },
    [disabled, onPageChange],
  );

  const pageItems = getPageItems();

  return (
    <nav
      className={`inline-flex justify-start items-start ${className}`}
      aria-label="Pagination"
    >
      <div className="flex justify-start items-center gap-2">
        {/* Previous Button */}
        <NavButton
          label="Previous"
          direction="previous"
          onClick={handlePreviousClick}
          disabled={disabled || activePage === 1}
          ariaLabel="Go to previous page"
        />

        {/* Page Numbers */}
        {showPageNumbers && (
          <PageNumbersGroup pages={pageItems} onPageClick={handlePageClick} />
        )}

        {/* Next Button */}
        <NavButton
          label="Next"
          direction="next"
          onClick={handleNextClick}
          disabled={disabled || activePage === totalPages}
          ariaLabel="Go to next page"
        />
      </div>
    </nav>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export type { PaginationProps, PaginationPageItem };

export default Pagination;
