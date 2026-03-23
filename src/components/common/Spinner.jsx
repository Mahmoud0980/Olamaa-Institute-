"use client";

export default function Spinner({ className = "" }) {
  return (
    <div 
      className={`rounded-full border-4 border-gray-200 border-t-[#6F013F] animate-spin ${className}`} 
      style={{ width: "24px", height: "24px", ...(!className.includes("w-") && { width: "24px", height: "24px" }) }}
    />
  );
}

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
      <Spinner className="w-10 h-10" />
    </div>
  );
}
