"use client";

const getHeaders = (tab) => {
  if (tab === "batches") return ["#", "الشعبة", "من", "إلى", "الإجراءات"];
  if (tab === "subjects") return ["#", "المادة", "الشعبة", "الإجراءات"];
  // all
  return ["#", "الشعبة", "القاعة", "المواد", "الفترة"];
};

export default function CoursesTableSkeleton({ tab = "all", rows = 5 }) {
  const headers = getHeaders(tab);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
      <div className="max-h-[450px] overflow-y-auto">
        <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
          <thead className="sticky top-0 bg-pink-50 z-10">
            <tr>
              {headers.map((h, i) => (
                <th key={`${tab}-h-${i}`} className="p-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={`${tab}-r-${r}`} className="bg-white">
                {headers.map((_, c) => (
                  <td key={`${tab}-c-${r}-${c}`} className="p-3">
                    <div className="h-4 w-full rounded bg-gray-200" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
