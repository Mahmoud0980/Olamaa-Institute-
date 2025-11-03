"use client";

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gray-200 ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.2s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent)]" />
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

export function SkeletonText({ lines = 1, className = "" }) {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${
            i === lines - 1 ? "w-1/2" : "w-full"
          } mb-2 last:mb-0`}
        />
      ))}
    </div>
  );
}

export function SkeletonCircle({ size = 48, className = "" }) {
  return (
    <Skeleton
      className={`rounded-full`}
      style={{ width: size, height: size }}
    />
  );
}
