"use client";

import { X, Loader2 } from "lucide-react";

export default function ChipsList({
  items = [],
  getLabel,
  onRemove,
  canRemove = () => true,
  loadingId = null,
  className = "",
}) {
  if (!items.length) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((item) => {
        const removable = canRemove(item);

        return (
          <div
            key={item.id}
            className="
              flex items-center gap-2
              px-3 py-1
              rounded-lg
              border border-gray-300
              text-sm
              bg-white
            "
          >
            <span>{getLabel(item)}</span>

            {removable && (
              <button
                onClick={() => onRemove(item)}
                disabled={loadingId === item.id}
                className="
                  text-gray-400 hover:text-red-500
                  transition disabled:opacity-50
                "
              >
                {loadingId === item.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <X size={14} />
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
