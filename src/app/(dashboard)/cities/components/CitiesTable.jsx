"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import CitiesTableSkeleton from "./CitiesTableSkeleton";

export default function CitiesTable({
  cities,
  isLoading,
  search,
  onEdit,
  onDelete,
}) {
  const [page, setPage] = useState(1);
  const pageSize = 6;

  /* --------------------------
      الفلترة
  --------------------------- */
  const filtered = cities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  /* --------------------------
      Pagination
  --------------------------- */
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const truncate = (txt, len = 25) =>
    txt?.length > len ? txt.substring(0, len) + "..." : txt;

  /* -------------------------------------------------
      نفس منطق صفحة الباصات و الشعب 100%
      Adjust page when items deleted or filtered
  -------------------------------------------------- */
  useEffect(() => {
    // 1) إذا الصفحة الحالية أكبر من عدد الصفحات الجديد → روح لآخر صفحة
    if (page > totalPages) {
      setPage(totalPages);
      return;
    }

    // 2) إذا الصفحة الحالية صارت فاضية بعد الحذف → ارجع صفحة
    if (paginated.length === 0 && page > 1) {
      setPage(page - 1);
    }
  }, [filtered.length, totalPages, paginated.length, page]);

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 mt-6 w-full">
      {/* حالة التحميل */}
      {isLoading ? (
        <CitiesTableSkeleton />
      ) : !paginated.length ? (
        <div className="py-10 text-center text-gray-400">لا توجد بيانات.</div>
      ) : (
        <>
          {/* ------------------ TABLE (for desktop) ------------------ */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-pink-50 text-gray-700">
                  <th className="p-3 rounded-r-xl">#</th>
                  <th className="p-3">اسم المدينة</th>
                  <th className="p-3">الوصف</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3 text-center rounded-l-xl">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((city, index) => (
                  <tr
                    key={city.id}
                    className="bg-white hover:bg-pink-50 transition"
                  >
                    <td className="p-3 rounded-r-xl">
                      {(page - 1) * pageSize + index + 1}
                    </td>

                    <td className="p-3 font-medium">{city.name}</td>

                    <td className="p-3" title={city.description}>
                      {truncate(city.description || "—")}
                    </td>

                    <td className="p-3">
                      {city.is_active ? (
                        <span className="px-3 py-1 text-xs rounded-xl bg-green-100 text-green-700">
                          نشط
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs rounded-xl bg-red-100 text-red-700">
                          غير نشط
                        </span>
                      )}
                    </td>

                    <td className="p-3 rounded-l-xl text-center">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => onEdit(city.id)}
                          className="cursor-pointer"
                        >
                          <Image
                            src={"/icons/Edit.png"}
                            alt="edit"
                            width={18}
                            height={18}
                          />
                        </button>

                        <button
                          onClick={() => onDelete(city.id)}
                          className="cursor-pointer"
                        >
                          <Image
                            src={"/icons/Trash.png"}
                            alt="trash"
                            width={18}
                            height={18}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ------------------ CARD VIEW (for mobile) ------------------ */}
          <div className="md:hidden space-y-4">
            {paginated.map((city, index) => (
              <div
                key={city.id}
                className="border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">#</span>
                  <span className="font-semibold">
                    {(page - 1) * pageSize + index + 1}
                  </span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">اسم المدينة:</span>
                  <span className="font-semibold">{city.name}</span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">الوصف:</span>
                  <span className="text-gray-700" title={city.description}>
                    {truncate(city.description || "—")}
                  </span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">الحالة:</span>
                  {city.is_active ? (
                    <span className="px-3 py-1 text-xs rounded-xl bg-green-100 text-green-700">
                      نشط
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs rounded-xl bg-red-100 text-red-700">
                      غير نشط
                    </span>
                  )}
                </div>

                <div className="flex justify-center gap-6 mt-3">
                  <button
                    onClick={() => onEdit(city.id)}
                    className="cursor-pointer"
                  >
                    <Image
                      src={"/icons/Edit.png"}
                      alt="edit"
                      width={20}
                      height={20}
                    />
                  </button>

                  <button
                    onClick={() => onDelete(city.id)}
                    className="cursor-pointer"
                  >
                    <Image
                      src={"/icons/Trash.png"}
                      alt="trash"
                      width={20}
                      height={20}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ------------------ Pagination ------------------ */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 border rounded-md bg-white disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>

            <span className="text-gray-600 text-sm">
              صفحة {page} من {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 border rounded-md bg-white disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
