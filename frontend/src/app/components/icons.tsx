"use client";

import React from "react";

/* ======================================================
   ICON PROPS
====================================================== */

export interface IconProps {
  size?: number;
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  className?: string;
}

/* ======================================================
   BASE SVG COMPONENT
   (NO GLOBAL DEFAULT OBJECT)
====================================================== */

const Svg = ({
  children,
  size = 20,
  width,
  height,
  stroke = "currentColor",
  strokeWidth = 2,
  className,
}: React.PropsWithChildren<IconProps>) => (
  <svg
    width={width ?? size}
    height={height ?? size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

/* ======================================================
   ICONS
====================================================== */

export const CheckIcon = (props: IconProps) => (
  <Svg {...props}>
    <polyline points="20 6 9 17 4 12" />
  </Svg>
);

export const XIcon = (props: IconProps) => (
  <Svg {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);

export const PencilIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5l4 4L7 21l-4 1 1-4z" />
  </Svg>
);

export const MoreVerticalIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </Svg>
);

/* ---------- CHEVRONS ---------- */

export const ChevronLeftIcon = (props: IconProps) => (
  <Svg {...props}>
    <polyline points="15 18 9 12 15 6" />
  </Svg>
);

export const ChevronRightIcon = (props: IconProps) => (
  <Svg {...props}>
    <polyline points="9 18 15 12 9 6" />
  </Svg>
);

export const ChevronUpIcon = (props: IconProps) => (
  <Svg {...props}>
    <polyline points="18 15 12 9 6 15" />
  </Svg>
);

export const ChevronDownIcon = (props: IconProps) => (
  <Svg {...props}>
    <polyline points="6 9 12 15 18 9" />
  </Svg>
);

/* ---------- FILE ACTIONS ---------- */

export const DownloadIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 3v12" />
    <polyline points="7 10 12 15 17 10" />
    <path d="M5 21h14" />
  </Svg>
);

export const FileIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </Svg>
);

export const TrashIcon = (props: IconProps) => (
  <Svg {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
  </Svg>
);

export const CloudUploadIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M20 17a4 4 0 00-2-7.5A5 5 0 005 12a4 4 0 001 7h14" />
    <polyline points="12 12 12 19" />
    <polyline points="9 15 12 12 15 15" />
  </Svg>
);

/* ---------- INFO ---------- */

export const PinIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 21s-6-5-6-10a6 6 0 1112 0c0 5-6 10-6 10z" />
    <circle cx="12" cy="11" r="2" />
  </Svg>
);

export const InfoIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </Svg>
);

export const PhoneIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M22 16.9v3a2 2 0 01-2.2 2A19.7 19.7 0 013 5.3 2 2 0 015 3h3a2 2 0 012 1.7l.5 3a2 2 0 01-.6 1.8L9 11a16 16 0 007 7l1.5-1.3a2 2 0 011.8-.6l3 .5a2 2 0 011.7 2z" />
  </Svg>
);

export const GlobeIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
  </Svg>
);

export const MailIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <polyline points="3 7 12 13 21 7" />
  </Svg>
);

/* ---------- ACTIONS ---------- */

export const PlusIcon = (props: IconProps) => (
  <Svg {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

export const SelectorIcon = (props: IconProps) => (
  <Svg {...props}>
    <polyline points="7 10 12 5 17 10" />
    <polyline points="7 14 12 19 17 14" />
  </Svg>
);

export const SearchIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.5" y2="16.5" />
  </Svg>
);

export const CalendarIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
);

/* ---------- NEW ICONS ---------- */

export const SettingsIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H5.78a1.65 1.65 0 0 0-1.51 1 1.65 1.65 0 0 0 .33 1.82l.06.07a10 10 0 0 0 14.68 0z" />
    <path d="M18 2v4M6 2v4M2 6h20M2 18h20M6 22v-4M18 22v-4" />
  </Svg>
);

export const ThreeDotVerticalIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </Svg>
);
