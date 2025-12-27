"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";

export default function ActionsMenu({
  triggerIcon: TriggerIcon = MoreVertical,
  items = [],
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);

  // close on outside click
  //   useEffect(() => {
  //     const handler = (e) => {
  //       if (
  //         wrapperRef.current &&
  //         !wrapperRef.current.contains(e.target) &&
  //         !menuRef.current?.contains(e.target)
  //       ) {
  //         setOpen(false);
  //       }
  //     };
  //     document.addEventListener("mousedown", handler);
  //     return () => document.removeEventListener("mousedown", handler);
  //   }, []);

  const handleToggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();

      const menuHeight = 220;
      const menuWidth = 220;

      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // 👇 اتجاه ذكي (آخر صف = لفوق)
      const top =
        spaceBelow < menuHeight && spaceAbove > spaceBelow
          ? rect.top - menuHeight - 8
          : rect.bottom + 8;

      // 👇 منع الخروج من الشاشة أفقياً
      const left = Math.min(rect.left, window.innerWidth - menuWidth - 12);

      setPos({ top, left });
    }
    setOpen((p) => !p);
  };

  const menuContent = (
    <div className="w-56 bg-white shadow-xl border border-gray-200 rounded-lg py-2">
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            item.onClick?.();
            setOpen(false);
          }}
          className={`w-full px-3 py-2 text-sm flex items-center gap-2
            ${
              item.danger ? "text-red-600 hover:bg-red-50" : "hover:bg-gray-50"
            }`}
        >
          {item.icon && <item.icon size={16} />}
          {item.label}
        </button>
      ))}
    </div>
  );

  return (
    <div ref={wrapperRef} className="inline-block">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="
          w-8 h-8 flex items-center justify-center
          rounded-md
          text-gray-600
          hover:bg-gray-100
          focus:outline-none
          focus:ring-0
        "
      >
        <TriggerIcon className="w-5 h-5" />
      </button>

      {open &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              zIndex: 9999,
            }}
          >
            {menuContent}
          </div>,
          document.body
        )}
    </div>
  );
}
