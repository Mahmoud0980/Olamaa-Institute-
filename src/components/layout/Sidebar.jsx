"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu as MenuIcon, X } from "lucide-react";
import Menu from "./Menu";

const BALL_SIZE = 52;
const MARGIN = 12;
const PEEK = 14; // قديش يضل ظاهر من الكرة (لسان صغير)
const CLOSED_Y = 18; // لما السايدبار مسكّر (فوق)
const OPEN_Y = 18; // لما السايدبار مفتوح (فوق)

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function getBounds() {
  const maxX = window.innerWidth - BALL_SIZE - MARGIN;
  const maxY = window.innerHeight - BALL_SIZE - MARGIN;
  return { maxX, maxY };
}

function revealX(side) {
  const { maxX } = getBounds();
  return side === "left" ? MARGIN : maxX;
}

function peekX(side) {
  return side === "left" ? -(BALL_SIZE - PEEK) : window.innerWidth - PEEK;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const [showMobileBtn, setShowMobileBtn] = useState(true);

  const [dockSide, setDockSide] = useState("right"); // "left" | "right"
  const [peeked, setPeeked] = useState(true);

  // ✅ منع فلاش الريفرش: بلّشها برا الشاشة
  const [ballPos, setBallPos] = useState(() => ({ x: -9999, y: CLOSED_Y }));

  // ✅ hydration fix
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);

  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const startRef = useRef({ px: 0, py: 0, x: 0, y: 0 });

  // ===== Scroll lock =====
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

  // ===== hide/show on scroll =====
  useEffect(() => {
    if (typeof window === "undefined") return;

    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (draggingRef.current) return;
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const diff = currentY - lastY;
        const TH = 10;

        if (diff > TH) {
          setShowMobileBtn(false);
          lastY = currentY;
        } else if (diff < -TH) {
          setShowMobileBtn(true);
          lastY = currentY;
        }

        if (currentY < 30) setShowMobileBtn(true);
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ init position (بدون فلاش)
  useEffect(() => {
    if (typeof window === "undefined") return;

    setMounted(true);

    setDockSide("right");
    setPeeked(true);

    // حطها مباشرة بالمكان الصحيح
    setBallPos({ x: peekX("right"), y: CLOSED_Y });

    // فعّل الأنيميشن بعد أول frame (حتى ما يصير قفزة)
    requestAnimationFrame(() => setReady(true));
  }, []);

  // ===== resize: keep y in bounds + update peek x =====
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onResize = () => {
      const { maxY } = getBounds();
      setBallPos((p) => {
        const y = clamp(p.y, MARGIN, maxY);
        const x = peeked ? peekX(dockSide) : revealX(dockSide);
        return { x, y };
      });
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [peeked, dockSide]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((v) => !v);
  }, [setSidebarOpen]);

  // ===== لما يفتح/يسكر السايدبار: Reveal/Peek =====
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!mounted) return;

    if (sidebarOpen) {
      setPeeked(false);
      setBallPos({
        x: revealX(dockSide),
        y: OPEN_Y, // ✅ لفوق
      });
    } else {
      const t = setTimeout(() => {
        setPeeked(true);
        setBallPos({
          x: peekX(dockSide),
          y: CLOSED_Y, // ✅ لفوق
        });
      }, 140);
      return () => clearTimeout(t);
    }
  }, [sidebarOpen, dockSide, mounted]);

  // ===== drag =====
  const onPointerDown = (e) => {
    e.preventDefault();

    if (peeked && !sidebarOpen) {
      setPeeked(false);
      setBallPos((p) => ({ ...p, x: revealX(dockSide) }));
    }

    draggingRef.current = true;
    movedRef.current = false;

    const currentX = peeked ? revealX(dockSide) : ballPos.x;

    startRef.current = {
      px: e.clientX,
      py: e.clientY,
      x: currentX,
      y: ballPos.y,
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    const onMove = (ev) => {
      if (!draggingRef.current) return;

      const dx = ev.clientX - startRef.current.px;
      const dy = ev.clientY - startRef.current.py;

      if (Math.abs(dx) + Math.abs(dy) > 6) movedRef.current = true;

      const { maxX, maxY } = getBounds();
      const x = clamp(startRef.current.x + dx, MARGIN, maxX);
      const y = clamp(startRef.current.y + dy, MARGIN, maxY);

      setBallPos({ x, y });
      setDockSide(x + BALL_SIZE / 2 < window.innerWidth / 2 ? "left" : "right");
    };

    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;

      setBallPos((p) => {
        const side =
          p.x + BALL_SIZE / 2 < window.innerWidth / 2 ? "left" : "right";
        setDockSide(side);

        const x = sidebarOpen ? revealX(side) : peekX(side);
        return { x, y: p.y };
      });

      if (!movedRef.current) toggleSidebar();

      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  return (
    <>
      {/* ===== Quick Ball (موبايل) ===== */}
      <button
        onPointerDown={onPointerDown}
        className={`
          xl:hidden fixed z-[60]
          rounded-full shadow-lg
          bg-[#6F013F] text-white
          flex items-center justify-center
          ${ready ? "transition-all duration-300" : ""}
          ${mounted ? "" : "opacity-0 pointer-events-none"}
          ${
            showMobileBtn
              ? "opacity-100 scale-100"
              : "opacity-0 scale-90 pointer-events-none"
          }
        `}
        style={{
          width: BALL_SIZE,
          height: BALL_SIZE,
          left: ballPos.x,
          top: ballPos.y,
          touchAction: "none",
        }}
        aria-label={sidebarOpen ? "إغلاق القائمة" : "فتح القائمة"}
      >
        {sidebarOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MenuIcon className="w-6 h-6" />
        )}
      </button>

      {/* ===== Desktop Sidebar ===== */}
      <aside
        className="
          relative hidden xl:flex xl:flex-col shrink-0
          bg-[#F2F2F3]
          w-[250px] 2xl:w-[300px]
          h-screen overflow-hidden
          shadow-[inset_-4px_0_8px_-2px_rgba(0,0,0,0.2)]
          transition-all duration-300
        "
      >
        <div className="flex items-center gap-2 px-6 py-2">
          <Image src="/logo.svg" alt="logo" width={40} height={40} />
          <Link
            href="/"
            className="flex items-center gap-2 text-[#6F013F] font-semibold
                       text-[15px] sm:text-[16px] md:text-[17px]"
          >
            معهد العلماء
          </Link>
        </div>

        <div className="flex-1 min-h-0 px-3 pb-3">
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

      {/* ===== Mobile Sidebar ===== */}
      <aside
        className={`
          xl:hidden fixed inset-y-0 right-0 z-50
          w-[80%] max-w-[320px]
          bg-[#F2F2F3]
          h-screen overflow-hidden flex flex-col
          shadow-[inset_-4px_0_8px_-2px_rgba(0,0,0,0.25)]
          border-l transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
        `}
        aria-hidden={!sidebarOpen}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e0e0e0]">
          <Link href="/" className="font-semibold text-[#6F013F] text-[16px]">
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

        <div className="flex-1 min-h-0 px-3 pb-3">
          <Menu />
        </div>
      </aside>
    </>
  );
}
