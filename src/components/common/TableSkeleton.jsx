"use client";

import Skeleton from "@/components/common/Skeleton";

export default function TableSkeleton({
  headers = [],
  rows = 5,
  mobileFields = 4,
  actionCount = 2,
  showCheckbox = true,
  showStatus = false,
  showPagination = true,
  cardCount = 4,
  containerClassName = "",
}) {
  return (
    <div
      className={`bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full ${containerClassName}`}
    >
      {/* Mobile */}
      <div className="md:hidden space-y-4 mt-4">
        {Array.from({ length: cardCount }).map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Skeleton width="14px" height="14px" />
                <Skeleton width="24px" height="16px" />
                {showCheckbox && (
                  <Skeleton width="16px" height="16px" className="rounded-sm" />
                )}
              </div>

              <div className="flex items-center gap-2">
                {showStatus && (
                  <Skeleton
                    width="78px"
                    height="24px"
                    className="rounded-full"
                  />
                )}

                {Array.from({ length: actionCount }).map((_, actionIndex) => (
                  <Skeleton key={actionIndex} width="18px" height="18px" />
                ))}
              </div>
            </div>

            {Array.from({ length: mobileFields }).map((_, fieldIndex) => (
              <InfoSkeleton key={fieldIndex} />
            ))}
          </div>
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-pink-50 text-gray-700">
              {headers.map((header, i) => {
                const isFirst = i === 0;
                const isLast = i === headers.length - 1;

                return (
                  <th
                    key={i}
                    className={`p-3 ${
                      isFirst ? "rounded-r-xl" : ""
                    } ${isLast ? "rounded-l-xl" : ""} ${
                      i === 0 || isLast ? "text-center" : ""
                    }`}
                  >
                    {header}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="bg-white">
                {headers.map((_, colIndex) => {
                  const isFirst = colIndex === 0;
                  const isLast = colIndex === headers.length - 1;

                  // أول عمود (#)
                  if (isFirst) {
                    return (
                      <td
                        key={colIndex}
                        className="p-3 text-center rounded-r-xl"
                      >
                        <div className="flex items-center justify-center gap-2">
                          {showCheckbox && (
                            <Skeleton
                              width="16px"
                              height="16px"
                              className="rounded-sm"
                            />
                          )}
                          <Skeleton width="20px" height="14px" />
                        </div>
                      </td>
                    );
                  }

                  // آخر عمود (إجراءات)
                  if (isLast) {
                    return (
                      <td
                        key={colIndex}
                        className="p-3 text-center rounded-l-xl"
                      >
                        <div className="flex items-center justify-center gap-3">
                          {showStatus && (
                            <Skeleton
                              width="78px"
                              height="22px"
                              className="rounded-full"
                            />
                          )}

                          {Array.from({ length: actionCount }).map(
                            (_, actionIndex) => (
                              <Skeleton
                                key={actionIndex}
                                width="18px"
                                height="18px"
                              />
                            ),
                          )}
                        </div>
                      </td>
                    );
                  }

                  // أعمدة عادية
                  return (
                    <td key={colIndex} className="p-3">
                      <CellSkeleton colIndex={colIndex} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-center gap-2 mt-5">
          <Skeleton width="32px" height="32px" className="rounded-lg" />
          <Skeleton width="32px" height="32px" className="rounded-lg" />
          <Skeleton width="32px" height="32px" className="rounded-lg" />
        </div>
      )}
    </div>
  );
}

function InfoSkeleton() {
  return (
    <div className="flex justify-between mb-2">
      <Skeleton width="80px" height="14px" />
      <Skeleton width="110px" height="14px" />
    </div>
  );
}

function CellSkeleton({ colIndex }) {
  const widths = [
    "60px",
    "90px",
    "110px",
    "130px",
    "80px",
    "100px",
    "50px",
    "70px",
    "120px",
  ];

  return <Skeleton width={widths[colIndex] || "100px"} height="14px" />;
}
