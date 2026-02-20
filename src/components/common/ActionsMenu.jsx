// "use client";

// import { useRef, useState } from "react";
// import { createPortal } from "react-dom";
// import { MoreVertical } from "lucide-react";

// export default function ActionsMenu({
//   menuId,
//   openMenuId,
//   setOpenMenuId,
//   triggerIcon: TriggerIcon = MoreVertical,
//   items = [],
// }) {
//   const buttonRef = useRef(null);
//   const [pos, setPos] = useState({ top: 0, left: 0 });

//   const isOpen = openMenuId === menuId;

//   const handleToggle = (e) => {
//     e.stopPropagation();

//     if (!buttonRef.current) return;

//     // إذا نفس القائمة مفتوحة → سكّرها
//     if (isOpen) {
//       setOpenMenuId(null);
//       return;
//     }

//     const rect = buttonRef.current.getBoundingClientRect();

//     const menuHeight = 220;
//     const menuWidth = 220;
//     const margin = 12;

//     const spaceBelow = window.innerHeight - rect.bottom;
//     const spaceAbove = rect.top;

//     const top =
//       spaceBelow < menuHeight && spaceAbove > spaceBelow
//         ? rect.top - menuHeight - 8
//         : rect.bottom + 8;

//     // RTL
//     let left = rect.right - menuWidth;
//     if (left < margin) left = margin;
//     if (left + menuWidth > window.innerWidth - margin) {
//       left = window.innerWidth - menuWidth - margin;
//     }

//     setPos({ top, left });
//     setOpenMenuId(menuId);
//   };

//   return (
//     <>
//       {/* Trigger */}
//       <button
//         ref={buttonRef}
//         onClick={handleToggle}
//         className="
//           w-8 h-8 flex items-center justify-center
//           rounded-md
//           text-gray-600
//           hover:bg-gray-100
//           focus:outline-none
//         "
//       >
//         <TriggerIcon className="w-5 h-5" />
//       </button>

//       {/* Menu */}
//       {/* Menu */}
//       {isOpen &&
//         createPortal(
//           <>
//             {/* Backdrop: click anywhere to close */}
//             <div
//               className="fixed inset-0 z-[9998]"
//               onClick={() => setOpenMenuId(null)}
//             />

//             {/* The menu itself */}
//             <div
//               style={{
//                 position: "fixed",
//                 top: pos.top,
//                 left: pos.left,
//                 zIndex: 9999,
//               }}
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="w-56 bg-white shadow-xl border border-gray-200 rounded-lg py-2">
//                 {items.map((item, index) => (
//                   <button
//                     key={index}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       item.onClick?.();
//                       setOpenMenuId(null);
//                     }}
//                     className={`w-full px-3 py-2 text-sm flex items-center gap-2 transition
//                 ${
//                   item.danger
//                     ? "text-red-600 hover:bg-red-50"
//                     : "hover:bg-gray-50"
//                 }`}
//                   >
//                     {item.icon && <item.icon size={16} />}
//                     {item.label}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </>,
//           document.body
//         )}
//     </>
//   );
// }
"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function ActionsMenu({
  menuId,
  openMenuId,
  setOpenMenuId,
  triggerIcon: TriggerIcon = MoreVertical,
  items = [],
  offset = 8, // مسافة بين الزر والقائمة
  margin = 12, // مسافة عن حواف الشاشة
}) {
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const isOpen = openMenuId === menuId;

  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [ready, setReady] = useState(false);

  const getIsRTL = () => {
    // ياخد RTL من document.dir أو من الـ html dir
    const dir =
      document?.documentElement?.getAttribute("dir") ||
      document?.body?.getAttribute("dir") ||
      "ltr";
    return dir.toLowerCase() === "rtl";
  };

  const computeAndSetPosition = useCallback(() => {
    const btn = buttonRef.current;
    const menu = menuRef.current;
    if (!btn || !menu) return;

    const rect = btn.getBoundingClientRect();

    // قياس حقيقي لحجم القائمة
    const menuRect = menu.getBoundingClientRect();
    const menuW = menuRect.width;
    const menuH = menuRect.height;

    const isRTL = getIsRTL();

    // ==== Top: افتراضي تحت، إذا ما في مساحة اقلب لفوق ====
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let top = rect.bottom + offset;
    const wouldOverflowBottom = top + menuH > window.innerHeight - margin;

    if (wouldOverflowBottom && spaceAbove > spaceBelow) {
      top = rect.top - menuH - offset; // flip up
    }

    top = clamp(top, margin, window.innerHeight - menuH - margin);

    // ==== Left: حسب RTL/LTR وبشكل ذكي ====
    let left;

    if (isRTL) {
      // RTL: افتراضي خلي يمين القائمة عند يمين الزر
      left = rect.right - menuW;
    } else {
      // LTR: افتراضي خلي يسار القائمة عند يسار الزر
      left = rect.left;
    }

    // إذا طلع برا يمين الشاشة
    if (left + menuW > window.innerWidth - margin) {
      left = window.innerWidth - menuW - margin;
    }

    // إذا طلع برا يسار الشاشة
    if (left < margin) {
      left = margin;
    }

    setPos({ top, left });
    setReady(true);
  }, [offset, margin]);

  const handleToggle = (e) => {
    e.stopPropagation();

    if (!buttonRef.current) return;

    if (isOpen) {
      setOpenMenuId(null);
      return;
    }

    setReady(false); // رح نحددها true بعد القياس
    setOpenMenuId(menuId);
  };

  // أول ما تفتح القائمة: اعمل قياس وتموضع بعد ما تنرسم
  useLayoutEffect(() => {
    if (!isOpen) return;

    // requestAnimationFrame حتى نتأكد أنها انرسمت بالـ DOM
    const raf = requestAnimationFrame(() => {
      computeAndSetPosition();
    });

    return () => cancelAnimationFrame(raf);
  }, [isOpen, computeAndSetPosition]);

  // إذا المستخدم عمل scroll/resize والقائمة مفتوحة: رجّع احسب مكانها
  useEffect(() => {
    if (!isOpen) return;

    const onReflow = () => computeAndSetPosition();

    window.addEventListener("resize", onReflow);

    // scroll ممكن يصير على window أو على container (capture=true)
    window.addEventListener("scroll", onReflow, true);

    return () => {
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true);
    };
  }, [isOpen, computeAndSetPosition]);

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
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setOpenMenuId(null)}
            />

            {/* Menu container */}
            <div
              ref={menuRef}
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                zIndex: 9999,
                // نخفيها لحظياً لحد ما نحسب مكانها الحقيقي (حتى ما "تنط")
                opacity: ready ? 1 : 0,
                pointerEvents: ready ? "auto" : "none",
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
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
