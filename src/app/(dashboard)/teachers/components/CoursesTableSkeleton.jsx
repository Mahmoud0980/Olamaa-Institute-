"use client";

const getHeaders = (tab) => {
  if (tab === "batches") return ["#", "الشعبة", "من", "إلى", "الإجراءات"];
  if (tab === "subjects") return ["#", "المادة", "الشُّعب", "الإجراءات"];
  return ["#", "الشعبة", "القاعة", "المواد", "الفترة"];
};

export default function CoursesTableSkeleton({ tab = "all", rows = 4 }) {
  const headers = getHeaders(tab);
  const cols = headers.length;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      {/* ================= DESKTOP TABLE SKELETON ================= */}
      <div className="hidden md:block max-h-[450px] overflow-y-auto overflow-x-auto">
        <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
          <thead className="sticky top-0 bg-pink-50 z-10">
            <tr className="text-gray-700">
              {headers.map((h, i) => (
                <th
                  key={`${tab}-h-${i}`}
                  className={[
                    "p-3",
                    i === 0 ? "rounded-r-xl" : "",
                    i === cols - 1 ? "rounded-l-xl" : "",
                    tab !== "all" && i === cols - 1 ? "text-center" : "",
                  ].join(" ")}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={`${tab}-r-${r}`} className="bg-white">
                {headers.map((_, c) => (
                  <td
                    key={`${tab}-c-${r}-${c}`}
                    className={[
                      "p-3",
                      c === 0 ? "rounded-r-xl" : "",
                      c === cols - 1 ? "rounded-l-xl" : "",
                    ].join(" ")}
                  >
                    <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* empty state placeholder (اختياري) */}
      </div>

      {/* ================= MOBILE CARDS SKELETON ================= */}
      <div className="md:hidden space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={`${tab}-m-${i}`}
            className="border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            {/* rows like InfoRow */}
            <MobileRowSkeleton wide label />
            <MobileRowSkeleton label />
            <MobileRowSkeleton label />
            <MobileRowSkeleton label />
            <MobileRowSkeleton label />

            {/* actions (only for batches/subjects realistically, but ok for all) */}
            <div className="flex justify-center mt-3 animate-pulse">
              <div className="h-9 w-9 bg-gray-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* ================= PAGINATION SKELETON ================= */}
      <div className="flex justify-center items-center gap-4 mt-6 animate-pulse">
        <div className="w-8 h-8 bg-gray-200 rounded-md" />
        <div className="w-28 h-4 bg-gray-200 rounded" />
        <div className="w-8 h-8 bg-gray-200 rounded-md" />
      </div>
    </div>
  );
}

function MobileRowSkeleton({ wide = false, label = false }) {
  return (
    <div className="flex justify-between gap-3 mb-2 animate-pulse">
      <div className={`h-4 ${label ? "w-20" : "w-16"} bg-gray-200 rounded`} />
      <div className={`h-4 ${wide ? "w-40" : "w-28"} bg-gray-200 rounded`} />
    </div>
  );
}
