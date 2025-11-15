"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import BusesTableSkeleton from "./BusesTableSkeleton";

export default function BusesTable({
  buses,
  isLoading,
  search,
  onEdit,
  onDelete,
}) {
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = buses.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 mt-6 w-full">
      {isLoading ? (
        <div className="py-10 text-center text-gray-500">
          <BusesTableSkeleton />
        </div>
      ) : !paginated.length ? (
        <div className="py-10 text-center text-gray-400">لا توجد بيانات.</div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-pink-50 text-gray-700">
                  <th className="p-3 rounded-r-xl">#</th>
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
                    <td className="p-3 rounded-r-xl">
                      {(page - 1) * pageSize + index + 1}
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
                        <button onClick={() => onDelete(bus.id)}>
                          <Image
                            src="/icons/Trash.png"
                            width={18}
                            height={18}
                            alt="Trush"
                          />
                        </button>
                        <button onClick={() => onEdit(bus.id)}>
                          <Image
                            src="/icons/Edit.png"
                            width={18}
                            height={18}
                            alt="edit"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-4">
            {paginated.map((bus, index) => (
              <div
                key={bus.id}
                className="border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">#</span>
                  <span className="font-semibold">
                    {(page - 1) * pageSize + index + 1}
                  </span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">اسم الباص:</span>
                  <span className="font-semibold">{bus.name}</span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">السعة:</span>
                  <span className="font-semibold">{bus.capacity}</span>
                </div>

                <div className="flex justify-center gap-6 mt-3">
                  <button onClick={() => onEdit(bus.id)}>
                    <Image
                      src="/icons/Edit.png"
                      width={20}
                      height={20}
                      alt="editBus"
                    />
                  </button>

                  <button onClick={() => onDelete(bus.id)}>
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

          {/* Pagination */}
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
