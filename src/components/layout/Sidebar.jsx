"use client";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu as MenuIcon, X } from "lucide-react";
import Menu from "./Menu";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  // قفل السكرول عند فتح السايدبار على الموبايل
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <>
      {/* زر للموبايل */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="xl:hidden fixed top-3 right-3 z-50 p-2 rounded-xl bg-[#6F013F] shadow"
        aria-label="افتح القائمة"
      >
        <MenuIcon className="w-6 h-6 text-white" />
      </button>

      {/* السايدبار الثابت للشاشات الكبيرة فقط (xl وفوق) */}
      <aside
        className="
          hidden xl:flex xl:flex-col shrink-0
          bg-[#F2F2F3]
          w-[250px] 2xl:w-[300px]
          shadow-[inset_-4px_0_8px_-2px_rgba(0,0,0,0.2)]
          transition-all duration-300
        "
      >
        {/* ====== شعار المعهد ====== */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-[#e0e0e0]">
          <Image src="/logo.svg" alt="logo" width={45} height={45} />
          <Link
            href="/"
            className="flex items-center gap-2 text-[#6F013F] font-semibold 
                       text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px]"
          >
            معهد العلماء
          </Link>
        </div>

        {/* ====== القائمة ====== */}
        <div
          className="flex-1 overflow-y-auto p-4 
                     text-[14px] sm:text-[15px] md:text-[16px]
                     transition-all duration-300"
        >
          <Menu
            activeColor="#AD164C"
            onLinkClick={() => setSidebarOpen(false)}
          />
        </div>
      </aside>

      {/* الخلفية المعتمة عند فتح السايدبار على الموبايل */}
      <div
        className={`xl:hidden fixed inset-0 z-40 bg-black/40 transition-opacity ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* السايدبار المنزلق للموبايل */}
      <aside
        className={`
          xl:hidden fixed inset-y-0 right-0 z-50
          w-[80%] max-w-[320px]
          bg-[#F2F2F3]
          shadow-[inset_-4px_0_8px_-2px_rgba(0,0,0,0.25)]
          border-l transition-transform duration-300 overflow-y-auto
          ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
        `}
        aria-hidden={!sidebarOpen}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#e0e0e0]">
          <Link href="/" className="font-semibold text-[#6F013F] text-[18px]">
            معهد العلماء
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-full hover:bg-gray-200"
            aria-label="أغلق"
          >
            <X className="w-5 h-5 text-[#6F013F]" />
          </button>
        </div>
        <div className="p-4 text-[15px]">
          <Menu activeColor="#AD164C" />
        </div>
      </aside>
    </>
  );
}
