"use client";
import { useState, useEffect } from "react";
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
        className="md:hidden fixed top-3 right-3 z-50 p-2 rounded-xl bg-[#6F013F] shadow"
        aria-label="افتح القائمة"
      >
        <MenuIcon className="w-6 h-6 text-white" />
      </button>

      {/* السايدبار الثابت للشاشات الكبيرة */}
      <aside className="hidden md:flex md:flex-col w-56 lg:w-60 xl:w-64 shrink-0 bg-[#F2F2F3]">
        <div className="p-4 flex">
          <Image src={"/logo.svg"} width={50} height={50} alt="logo" />
          <Link
            href="/"
            className="flex items-center justify-center lg:justify-center gap-2 text-lg md:text-3xl text-[#6F013F]"
          >
            <span className="lg:block font-semibold">معهد العلماء</span>
          </Link>
        </div>
        <div className="p-4">
          <Menu />
        </div>
      </aside>

      {/* خلفية معتمة عند فتح السايدبار على الموبايل */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/40 transition-opacity ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* السايدبار المنزلق للموبايل */}
      <aside
        className={`md:hidden fixed inset-y-0 right-0 z-50 w-[76%] max-w-[300px]
                    bg-[#F2F2F3] shadow-xl border-l transition-transform duration-300 overflow-y-auto
                    ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
        aria-hidden={!sidebarOpen}
      >
        <div className="flex items-center justify-between p-3">
          <Link href="/" className="font-semibold">
            معهد العلماء
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="أغلق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <Menu />
        </div>
      </aside>
    </>
  );
}
