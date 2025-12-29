// "use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import CitiesTableSkeleton from "./CitiesTableSkeleton";
import Pagination from "@/components/common/Pagination";

export default function CitiesTable({
  cities = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onEdit,
  onDelete,
}) {
  // ===== Pagination (مثل batches) =====
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const totalPages = Math.ceil(cities.length / pageSize) || 1;
  const paginated = cities.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [cities]);

  // ===== Checkbox =====
  const toggleSelect = (city) => {
    const exists = selectedIds.includes(city.id);

    const updated = exists
      ? selectedIds.filter((id) => id !== city.id)
      : [...selectedIds, city.id];

    onSelectChange?.(updated);
  };

  const truncate = (txt, len = 25) =>
    txt?.length > len ? txt.substring(0, len) + "..." : txt;

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
      {isLoading ? (
        <CitiesTableSkeleton />
      ) : !paginated.length ? (
        <div className="py-10 text-center text-gray-400">لا توجد بيانات.</div>
      ) : (
        <>
          {/* ================= DESKTOP TABLE ================= */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-pink-50 text-gray-700">
                  <th className="p-3 text-center rounded-r-xl">#</th>
                  <th className="p-3">اسم المدينة</th>
                  <th className="p-3">الوصف</th>
                  <th className="p-3 text-center">الحالة</th>
                  <th className="p-3 text-center rounded-l-xl">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((city, index) => (
                  <tr
                    key={city.id}
                    className="bg-white hover:bg-pink-50 transition"
                  >
                    <td className="p-3 text-center rounded-r-xl">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[#6F013F]"
                          checked={selectedIds.includes(city.id)}
                          onChange={() => toggleSelect(city)}
                        />
                        <span>{(page - 1) * pageSize + index + 1}</span>
                      </div>
                    </td>

                    <td className="p-3 font-medium">{city.name}</td>

                    <td className="p-3" title={city.description}>
                      {truncate(city.description || "—")}
                    </td>

                    <td className="p-3 text-center">
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

                    <td className="p-3 text-center rounded-l-xl">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => onDelete?.(city)}
                          className="cursor-pointer"
                        >
                          <Image
                            src={"/icons/Trash.png"}
                            alt="trash"
                            width={18}
                            height={18}
                          />
                        </button>
                        <button
                          onClick={() => onEdit?.(city.id)}
                          className="cursor-pointer"
                        >
                          <Image
                            src={"/icons/Edit.png"}
                            alt="edit"
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

          {/* ================= MOBILE CARDS ================= */}
          <div className="md:hidden space-y-4 mt-4">
            {paginated.map((city, index) => (
              <div
                key={city.id}
                className="border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                {/* checkbox + index */}
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">#</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {(page - 1) * pageSize + index + 1}
                    </span>
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#6F013F]"
                      checked={selectedIds.includes(city.id)}
                      onChange={() => toggleSelect(city)}
                    />
                  </div>
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
                    onClick={() => onDelete?.(city)}
                    className="cursor-pointer"
                  >
                    <Image
                      src={"/icons/Trash.png"}
                      alt="trash"
                      width={20}
                      height={20}
                    />
                  </button>
                  <button
                    onClick={() => onEdit?.(city.id)}
                    className="cursor-pointer"
                  >
                    <Image
                      src={"/icons/Edit.png"}
                      alt="edit"
                      width={20}
                      height={20}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ================= PAGINATION ================= */}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
