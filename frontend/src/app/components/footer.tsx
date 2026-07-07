"use client";

import {
  HiPhone,
  HiLocationMarker,
  HiMail,
  HiInformationCircle,
} from "react-icons/hi";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-[#EBF2FF] shadow-[0_4px_8px_rgba(0,0,0,0.15)]">
      <div className="flex items-center justify-around gap-12 mx-auto max-w-7xl px-10 py-12">
        {/* LEFT COLUMN - Logos & Description (30%) */}
        <div
          className="flex flex-col items-start gap-6 flex-shrink-0"
          style={{ width: "30%" }}
        >
          {/* Logos */}
          <div className="flex items-center gap-20">
            <Image
              src="/DTIdefault.png"
              alt="DTI Logo"
              width={92}
              height={132}
              priority
            />
            <Image
              src="/SSFdefault.png"
              alt="SSF Logo"
              width={180}
              height={98}
              priority
            />
          </div>

          {/* Description - Icon and Text Side-by-Side */}
          <div className="flex items-center gap-3">
            <div className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-[#D4E1FF] text-[#182286]">
              <HiInformationCircle size={16} />
            </div>
            <p className="m-0 text-xs text-[#002075] leading-relaxed text-justify">
              The Shared Service Facilities (SSF) Monitoring System is an
              initiative of the Department of Trade and Industry to support the
              development and sustainability of Shared Service Facilities across
              the Davao Region and empower Filipino MSMEs.
            </p>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="w-px bg-[#D4E1FF] flex-shrink-0 self-stretch"></div>

        {/* CENTER COLUMN - Addresses (35%) */}
        <div
          className="flex flex-col items-start gap-6 flex-shrink-0"
          style={{ width: "35%" }}
        >
          {/* Address Header Row - Icon and Text Side-by-Side */}
          <div className="flex items-center gap-3">
            <div className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-[#D4E1FF] text-[#182286]">
              <HiLocationMarker size={18} />
            </div>
            <h4 className="m-0 text-xs font-bold uppercase tracking-wider text-[#182286]">
              ADDRESS
            </h4>
          </div>

          {/* Primary Address */}
          <p className="m-0 text-xs text-[#002075] leading-relaxed">
            Mintrade Building Monteverde Avenue, Corner Sales St, Poblacion
            District, Davao City, 8000 Davao and Philippines
          </p>

          {/* Davao City Field Office Section */}
          <div className="flex flex-col gap-2">
            <h4 className="m-0 text-xs font-bold uppercase tracking-wider text-[#182286]">
              DAVAO CITY FIELD OFFICE
            </h4>
            <p className="m-0 text-xs text-[#002075] leading-relaxed">
              Upper Ground Floor, Al Fresco Area, Felcris Centrale, Quimpo Blvd.
              Brgy. 40-D, Davao City, Philippines
            </p>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="w-px bg-[#D4E1FF] flex-shrink-0 self-stretch"></div>

        {/* RIGHT COLUMN - Contact Information */}
        <div className="flex flex-col gap-6 items-start flex-shrink-0 w-fit">
          {/* Phone Row */}
          <div className="flex items-start gap-3 w-fit">
            <div className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-[#D4E1FF] text-[#182286]">
              <HiPhone size={16} />
            </div>
            <div className="flex flex-col gap-0.5">
              <h4 className="m-0 text-xs font-bold uppercase tracking-wider text-[#182286]">
                PHONE
              </h4>
              <p className="m-0 text-xs text-[#002075] font-medium break-words">
                +63 82 224 0511
              </p>
            </div>
          </div>

          {/* Email Row */}
          <div className="flex items-start gap-3 w-fit">
            <div className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-[#D4E1FF] text-[#182286]">
              <HiMail size={16} />
            </div>
            <div className="flex flex-col gap-0.5">
              <h4 className="m-0 text-xs font-bold uppercase tracking-wider text-[#182286]">
                EMAIL
              </h4>
              <p className="m-0 text-xs text-[#002075] font-medium break-words">
                n1@dti.gov.ph
              </p>
            </div>
          </div>

          {/* Website Row */}
          <div className="flex items-start gap-3 w-fit">
            <div className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-[#D4E1FF] text-[#182286]">
              <HiLocationMarker size={16} />
            </div>
            <div className="flex flex-col gap-0.5">
              <h4 className="m-0 text-xs font-bold uppercase tracking-wider text-[#182286]">
                WEBSITE
              </h4>
              <p className="m-0 text-xs text-[#002075] font-medium break-words">
                dti.gov.ph/region11
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
