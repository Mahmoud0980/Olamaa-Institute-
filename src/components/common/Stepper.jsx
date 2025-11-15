"use client";

export default function Stepper({ current = 1, total = 4 }) {
  return (
    <div
      dir="rtl"
      className="w-full relative flex justify-between items-center"
    >
      {/* الخط الخلفي */}
      <div className="absolute top-1/2 right-0 w-full h-[3px] bg-gray-200 rounded-full -translate-y-1/2" />

      {/* الخط الملوّن */}
      <div
        className="absolute top-1/2 right-0 h-[3px] bg-[#6F013F] rounded-full -translate-y-1/2 transition-all duration-300"
        style={{
          width: `${((current - 1) / (total - 1)) * 100}%`,
        }}
      />

      {/* النقاط */}
      {Array.from({ length: total }).map((_, i) => {
        const index = i + 1;
        const active = index <= current;

        return (
          <div
            key={index}
            className={`relative z-10 w-[16px] h-[16px] rounded-full border-2 transition-all duration-300 ${
              active
                ? "bg-[#6F013F] border-[#6F013F]"
                : "bg-white border-gray-300"
            }`}
          />
        );
      })}
    </div>
  );
}
