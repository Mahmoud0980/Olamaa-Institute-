export default function UniversalSkeleton({ rows = 6 }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm w-full animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded w-full mb-4"></div>
      ))}
    </div>
  );
}
