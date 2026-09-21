"use client";

import { useState, useCallback, useEffect } from "react";

// ============================================================================
// TYPE DEFINITIONS & INTERFACES
// ============================================================================

interface PaginationPageItem {
  type: "page" | "ellipsis";
  pageNumber?: number;
  isActive?: boolean;
  key: string;
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
    className={`px-3 py-1 rounded-md flex justify-center items-center gap-2 transition-all ${disabled
        ? "opacity-50 cursor-not-allowed"
        : "hover:bg-blue-50 active:bg-[#182286] cursor-pointer"
      }`}
  >
    {direction === "previous" && (
      <>
        <ArrowIcon direction="left" color={disabled ? "#6D7380" : "#182286"} />
        <div
          className={`justify-start text-base font-medium font-['Inter'] whitespace-nowrap ${disabled ? "text-gray-400" : "text-blue-900"
            }`}
        >
          {label}
        </div>
      </>
    )}
    {direction === "next" && (
      <>
        <div
          className={`justify-start text-base font-medium font-['Inter'] whitespace-nowrap ${disabled ? "text-gray-400" : "text-[#182286]"
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
    className={`w-8 h-8 rounded-lg flex justify-center items-center transition-all font-medium font-['Inter'] ${isActive
        ? "bg-[#182286] text-white shadow-md"
        : "text-[#182286] hover:bg-blue-50 active:bg-blue-100"
      }`}
  >
    {pageNumber}
  </button>
);

const Ellipsis: React.FC = () => (
  <span className="w-8 h-8 flex justify-center items-center text-[#182286] font-medium font-['Inter'] select-none">
    …
  </span>
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
      {pages.map((page) =>
        page.type === "ellipsis" ? (
          <Ellipsis key={page.key} />
        ) : (
          <PageNumberButton
            key={page.key}
            pageNumber={page.pageNumber!}
            isActive={page.isActive}
            onClick={() => onPageClick?.(page.pageNumber!)}
            ariaCurrent={page.isActive ? "page" : undefined}
          />
        ),
      )}
    </div>
  );
};

// ============================================================================
// PAGE RANGE GENERATOR (with truncation)
// ============================================================================

function buildPageItems(
  current: number,
  total: number,
  siblingCount = 1,
): PaginationPageItem[] {
  // Not enough pages to bother truncating — show them all
  const totalNumbersToShow = siblingCount * 2 + 5; // first, last, current, 2 siblings, 2 ellipses
  if (total <= totalNumbersToShow) {
    return Array.from({ length: total }, (_, i) => {
      const pageNumber = i + 1;
      return {
        type: "page" as const,
        pageNumber,
        isActive: pageNumber === current,
        key: `page-${pageNumber}`,
      };
    });
  }

  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, total);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;

  const items: PaginationPageItem[] = [];

  const pageItem = (pageNumber: number): PaginationPageItem => ({
    type: "page",
    pageNumber,
    isActive: pageNumber === current,
    key: `page-${pageNumber}`,
  });

  items.push(pageItem(1));

  if (showLeftEllipsis) {
    items.push({ type: "ellipsis", key: "ellipsis-left" });
  } else {
    for (let i = 2; i < leftSibling; i++) items.push(pageItem(i));
  }

  for (let i = leftSibling === 1 ? 2 : leftSibling; i <= (rightSibling === total ? total - 1 : rightSibling); i++) {
    if (i > 1 && i < total) items.push(pageItem(i));
  }

  if (showRightEllipsis) {
    items.push({ type: "ellipsis", key: "ellipsis-right" });
  } else {
    for (let i = rightSibling + 1; i < total; i++) items.push(pageItem(i));
  }

  items.push(pageItem(total));

  return items;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

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

  // Keep internal state in sync if the parent changes currentPage
  // (e.g. resetting to page 1 after a filter change) without remounting.
  useEffect(() => {
    setActivePage(currentPage);
  }, [currentPage]);

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

  const pageItems = buildPageItems(activePage, totalPages);

  return (
    <nav
      className={`inline-flex justify-start items-start ${className}`}
      aria-label="Pagination"
    >
      <div className="flex justify-start items-center gap-2">
        <NavButton
          label="Previous"
          direction="previous"
          onClick={handlePreviousClick}
          disabled={disabled || activePage === 1}
          ariaLabel="Go to previous page"
        />

        {showPageNumbers && (
          <PageNumbersGroup pages={pageItems} onPageClick={handlePageClick} />
        )}

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