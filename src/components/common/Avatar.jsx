"use client";

import { useEffect, useMemo, useState } from "react";

function safeUrl(url) {
  if (!url) return "";

  return url;
}

export default function Avatar({ fullName, image }) {
  const src = useMemo(() => safeUrl(image), [image]);
  const [imgOk, setImgOk] = useState(!!src);

  useEffect(() => {
    setImgOk(!!src);
  }, [src]);

  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  const firstInitial = parts[0]?.[0]?.toUpperCase() || "";
  const secondInitial = parts[1]?.[0]?.toUpperCase() || "";

  return (
    <div
      className="
        w-12 h-12
        sm:w-14 sm:h-14
        md:w-16 md:h-16
        lg:w-20 lg:h-20
        rounded-full
        overflow-hidden
        bg-[#C61062]
        text-white
        flex items-center justify-center
        font-bold
        text-sm
        sm:text-base
        md:text-lg
        lg:text-2xl
        select-none
      "
    >
      {src && imgOk ? (
        <img
          key={src}
          src={src}
          alt={fullName || "student"}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImgOk(false)}
        />
      ) : (
        <span className="flex items-center gap-1">
          <span>{firstInitial}</span>
          <span>{secondInitial}</span>
        </span>
      )}
    </div>
  );
}
