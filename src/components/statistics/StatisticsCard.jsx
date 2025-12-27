"use client";

export default function StatisticsCard({
  title,
  value,
  max,
  color = "#C2185B",
}) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;

  // عدد الشرائح في الـ Gauge
  const segments = 12;

  // تحديد أي شريحة يجب أن تكون ملوّنة
  const activeSegments = Math.round((percentage / 100) * segments);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full flex flex-col items-center">
      <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>

      {/* SVG GAUGE */}
      <svg width="180" height="110" viewBox="0 0 180 110">
        {Array.from({ length: segments }).map((_, i) => {
          const startAngle = (-90 + (i * 180) / segments) * (Math.PI / 180);
          const endAngle = (-90 + ((i + 1) * 180) / segments) * (Math.PI / 180);

          const x1 = 90 + 60 * Math.cos(startAngle);
          const y1 = 100 + 60 * Math.sin(startAngle);
          const x2 = 90 + 60 * Math.cos(endAngle);
          const y2 = 100 + 60 * Math.sin(endAngle);

          const filled = i < activeSegments;

          return (
            <path
              key={i}
              d={`M ${x1} ${y1} A 60 60 0 0 1 ${x2} ${y2}`}
              stroke={filled ? color : "#f3d4e8"}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* نسبة مئوية */}
      <div className="text-xl font-bold -mt-6">{percentage}%</div>

      {/* القيمة النصية */}
      <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
        {value} مادة
        <span
          className="w-3 h-3 rounded-full inline-block"
          style={{ backgroundColor: color }}
        ></span>
      </div>
    </div>
  );
}
