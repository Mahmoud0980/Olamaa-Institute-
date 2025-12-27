"use client";

import { useEffect, useState } from "react";

export default function Avatar({ fullName, image }) {
  const [imgOk, setImgOk] = useState(!!image);

  useEffect(() => {
    setImgOk(!!image);
  }, [image]);

  // ✅ أول حرف من الاسم الأول + أول حرف من الاسم الثاني
  const parts = (fullName || "").trim().split(/\s+/);
  const firstInitial = parts[0]?.charAt(0)?.toUpperCase() || "";
  const secondInitial = parts[1]?.charAt(0)?.toUpperCase() || "";

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
      {image && imgOk ? (
        <img
          src={image}
          alt="student"
          className="w-full h-full object-cover"
          onError={() => setImgOk(false)}
        />
      ) : (
        <span>
          {firstInitial}
          {secondInitial}
        </span>
      )}
    </div>
  );
}
