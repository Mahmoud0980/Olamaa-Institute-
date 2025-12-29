"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";

export default function ActionsMenu({
  menuId,
  openMenuId,
  setOpenMenuId,
  triggerIcon: TriggerIcon = MoreVertical,
  items = [],
}) {
  const buttonRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const isOpen = openMenuId === menuId;

  const handleToggle = (e) => {
    e.stopPropagation();

    if (!buttonRef.current) return;

    // إذا نفس القائمة مفتوحة → سكّرها
    if (isOpen) {
      setOpenMenuId(null);
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();

    const menuHeight = 220;
    const menuWidth = 220;
    const margin = 12;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const top =
      spaceBelow < menuHeight && spaceAbove > spaceBelow
        ? rect.top - menuHeight - 8
        : rect.bottom + 8;

    // RTL
    let left = rect.right - menuWidth;
    if (left < margin) left = margin;
    if (left + menuWidth > window.innerWidth - margin) {
      left = window.innerWidth - menuWidth - margin;
    }

    setPos({ top, left });
    setOpenMenuId(menuId);
  };

  return (
    <>
      {/* Trigger */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="
          w-8 h-8 flex items-center justify-center
          rounded-md
          text-gray-600
          hover:bg-gray-100
          focus:outline-none
        "
      >
        <TriggerIcon className="w-5 h-5" />
      </button>

      {/* Menu */}
      {isOpen &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-56 bg-white shadow-xl border border-gray-200 rounded-lg py-2">
              {items.map((item, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    item.onClick?.();
                    setOpenMenuId(null);
                  }}
                  className={`w-full px-3 py-2 text-sm flex items-center gap-2 transition
                    ${
                      item.danger
                        ? "text-red-600 hover:bg-red-50"
                        : "hover:bg-gray-50"
                    }`}
                >
                  {item.icon && <item.icon size={16} />}
                  {item.label}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
