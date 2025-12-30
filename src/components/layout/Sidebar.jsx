"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu as MenuIcon, X } from "lucide-react";
import Menu from "./Menu";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  // زر الموبايل يختفي عند النزول ويظهر عند الصعود
  const [showMobileBtn, setShowMobileBtn] = useState(true);
  const lastYRef = useRef(0);
  const tickingRef = useRef(false);

  // ✅ Scroll Lock قوي (يمنع سكرول الصفحة 100%)
  useEffect(() => {
    if (!sidebarOpen) return;

    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";

      window.scrollTo(0, scrollY);
    };
  }, [sidebarOpen]);

  // ✅ scroll listener لزر فتح السايدبار بالموبايل
  useEffect(() => {
    if (typeof window === "undefined") return;

    lastYRef.current = window.scrollY;

    const onScroll = () => {
      if (tickingRef.current) return;

      tickingRef.current = true;
      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const diff = currentY - lastYRef.current;
        const TH = 10;

        if (diff > TH) {
          setShowMobileBtn(false);
          lastYRef.current = currentY;
        } else if (diff < -TH) {
          setShowMobileBtn(true);
          lastYRef.current = currentY;
        }

        if (currentY < 30) setShowMobileBtn(true);
        tickingRef.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* زر فتح القائمة للموبايل */}
      <button
        onClick={() => setSidebarOpen(true)}
        className={`
          xl:hidden fixed top-3 right-3 z-50 p-2 rounded-xl bg-[#6F013F] shadow
          transition-all duration-300
          ${sidebarOpen ? "opacity-0 pointer-events-none" : ""}
          ${
            showMobileBtn
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-6 pointer-events-none"
          }
        `}
        aria-label="افتح القائمة"
      >
        <MenuIcon className="w-6 h-6 text-white" />
      </button>

      {/* ===== السايدبار الثابت (ديسكتوب) ===== */}
      <aside
        className="
          relative hidden xl:flex xl:flex-col shrink-0
          bg-[#F2F2F3]
          w-[250px] 2xl:w-[300px]
          h-screen
          overflow-hidden
          shadow-[inset_-4px_0_8px_-2px_rgba(0,0,0,0.2)]
          transition-all duration-300
        "
      >
        {/* شعار */}
        <div className="flex items-center justify-center gap-2 px-5 py-2">
          <Image src="/logo.svg" alt="logo" width={45} height={45} />
          <Link
            href="/"
            className="flex items-center gap-2 text-[#6F013F] font-semibold
                       text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px]"
          >
            معهد العلماء
          </Link>
        </div>

        {/* ✅ هون منخلي المحتوى يتمدد + Menu يعمل سكرول داخلي */}
        <div className="flex-1 min-h-0 p-4">
          <Menu />
        </div>
      </aside>

      {/* خلفية معتمة للموبايل */}
      <div
        className={`xl:hidden fixed inset-0 z-40 bg-black/40 transition-opacity ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ===== السايدبار المنزلق (موبايل) ===== */}
      <aside
        className={`
          xl:hidden fixed inset-y-0 right-0 z-50
          w-[80%] max-w-[320px]
          bg-[#F2F2F3]
          h-screen
          overflow-hidden
          flex flex-col
          shadow-[inset_-4px_0_8px_-2px_rgba(0,0,0,0.25)]
          border-l transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
        `}
        aria-hidden={!sidebarOpen}
      >
        {/* رأس */}
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

        {/* ✅ محتوى قابل للسكرول داخلياً فقط */}
        <div className="flex-1 min-h-0 p-4">
          <Menu />
        </div>
      </aside>
    </>
  );
}
