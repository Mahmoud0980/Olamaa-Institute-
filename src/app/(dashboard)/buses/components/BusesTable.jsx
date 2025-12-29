"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import BusesTableSkeleton from "./BusesTableSkeleton";
import Pagination from "@/components/common/Pagination";

export default function BusesTable({
  buses = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onEdit,
  onDelete,
}) {
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const safeBuses = Array.isArray(buses) ? buses : [];

  // ===== Pagination =====
  const totalPages = Math.ceil(safeBuses.length / pageSize) || 1;

  const paginated = useMemo(() => {
    return safeBuses.slice((page - 1) * pageSize, page * pageSize);
  }, [safeBuses, page]);

  // رجّع للصفحة الأولى عند تغيير الداتا (مثل صفحة الشعب)
  useEffect(() => {
    setPage(1);
  }, [safeBuses]);

  // حماية إذا الصفحة الحالية صارت خارج المدى بعد فلترة/حذف
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  // ===== Checkbox =====
  const toggleSelect = (bus) => {
    const exists = selectedIds.includes(bus.id);

    const updated = exists
      ? selectedIds.filter((id) => id !== bus.id)
      : [...selectedIds, bus.id];

    onSelectChange?.(updated);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 w-full">
      {isLoading ? (
        <div className="text-center text-gray-500">
          <BusesTableSkeleton />
        </div>
      ) : safeBuses.length === 0 ? (
        <div className="py-10 text-center text-gray-400">لا توجد بيانات.</div>
      ) : (
        <>
          {/* ================= DESKTOP TABLE ================= */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-pink-50 text-gray-700">
                  <th className="p-3 text-center rounded-r-xl">#</th>
                  <th className="p-3">اسم الباص</th>
                  <th className="p-3">السعة</th>
                  <th className="p-3">اسم السائق</th>
                  <th className="p-3">وصف الطريق</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3 text-center rounded-l-xl">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((bus, index) => (
                  <tr
                    key={bus.id}
                    className="bg-white hover:bg-pink-50 transition"
                  >
                    {/* checkbox + index */}
                    <td className="p-3 text-center rounded-r-xl">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[#6F013F]"
                          checked={selectedIds.includes(bus.id)}
                          onChange={() => toggleSelect(bus)}
                        />
                        <span>{(page - 1) * pageSize + index + 1}</span>
                      </div>
                    </td>

                    <td className="p-3 font-medium">{bus.name}</td>
                    <td className="p-3">{bus.capacity}</td>
                    <td className="p-3">{bus.driver_name || "—"}</td>
                    <td className="p-3">{bus.route_description || "—"}</td>

                    <td className="p-3">
                      {bus.is_active ? (
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
                        <button onClick={() => onDelete?.(bus)}>
                          <Image
                            src="/icons/Trash.png"
                            width={18}
                            height={18}
                            alt="Trash"
                          />
                        </button>
                        <button onClick={() => onEdit?.(bus.id)}>
                          <Image
                            src="/icons/Edit.png"
                            width={18}
                            height={18}
                            alt="Edit"
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
          <div className="md:hidden space-y-4">
            {paginated.map((bus, index) => (
              <div
                key={bus.id}
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
                      checked={selectedIds.includes(bus.id)}
                      onChange={() => toggleSelect(bus)}
                    />
                  </div>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">اسم الباص:</span>
                  <span className="font-semibold">{bus.name}</span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">السعة:</span>
                  <span className="font-semibold">{bus.capacity}</span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">السائق:</span>
                  <span>{bus.driver_name || "—"}</span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">الطريق:</span>
                  <span>{bus.route_description || "—"}</span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">الحالة:</span>
                  {bus.is_active ? (
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
                  <button onClick={() => onEdit?.(bus.id)}>
                    <Image
                      src="/icons/Edit.png"
                      width={20}
                      height={20}
                      alt="editBus"
                    />
                  </button>

                  <button onClick={() => onDelete?.(bus)}>
                    <Image
                      src="/icons/Trash.png"
                      width={20}
                      height={20}
                      alt="deleteBus"
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ================= PAGINATION ================= */}
          {safeBuses.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
