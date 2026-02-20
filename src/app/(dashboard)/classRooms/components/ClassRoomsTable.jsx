"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import ClassRoomsTableSkeleton from "./ClassRoomsTableSkeleton";
import Pagination from "@/components/common/Pagination";

export default function ClassRoomsTable({
  data = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onEdit,
  onDelete,
}) {
  // ===== Pagination =====
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const paginated = data.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [data]);

  // ===== Checkbox =====
  const toggleSelect = (item) => {
    const exists = selectedIds.includes(item.id);
    const updated = exists
      ? selectedIds.filter((id) => id !== item.id)
      : [...selectedIds, item.id];

    onSelectChange?.(updated);
  };

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
      {isLoading ? (
        <ClassRoomsTableSkeleton />
      ) : !paginated.length ? (
        <div className="py-10 text-center text-gray-400">لا توجد بيانات.</div>
      ) : (
        <>
          {/* ================= DESKTOP ================= */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-pink-50 text-gray-700">
                  <th className="p-3 text-center rounded-r-xl">#</th>
                  <th className="p-3">اسم القاعة</th>
                  <th className="p-3">الكود</th>
                  <th className="p-3 text-center">السعة</th>
                  <th className="p-3">ملاحظات</th>
                  <th className="p-3 text-center rounded-l-xl">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((room, index) => (
                  <tr
                    key={room.id}
                    className="bg-white hover:bg-pink-50 transition"
                  >
                    <td className="p-3 text-center rounded-r-xl">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[#6F013F]"
                          checked={selectedIds.includes(room.id)}
                          onChange={() => toggleSelect(room)}
                        />
                        <span>{(page - 1) * pageSize + index + 1}</span>
                      </div>
                    </td>

                    <td className="p-3 font-medium">{room.name}</td>
                    <td className="p-3">{room.code || "—"}</td>
                    <td className="p-3 text-center">{room.capacity}</td>
                    <td className="p-3">{room.notes || "—"}</td>

                    <td className="p-3 text-center rounded-l-xl">
                      <div className="flex justify-center gap-4">
                        <button onClick={() => onEdit?.(room)}>
                          <Image
                            src="/icons/Edit.png"
                            alt="edit"
                            width={18}
                            height={18}
                          />
                        </button>
                        <button onClick={() => onDelete?.(room)}>
                          <Image
                            src="/icons/Trash.png"
                            alt="delete"
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

          {/* ================= MOBILE ================= */}
          <div className="md:hidden space-y-4 mt-4">
            {paginated.map((room, index) => (
              <div
                key={room.id}
                className="border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">#</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {(page - 1) * pageSize + index + 1}
                    </span>
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#6F013F]"
                      checked={selectedIds.includes(room.id)}
                      onChange={() => toggleSelect(room)}
                    />
                  </div>
                </div>

                <Info label="اسم القاعة" value={room.name} />
                <Info label="الكود" value={room.code} />
                <Info label="السعة" value={room.capacity} />
                <Info label="ملاحظات" value={room.notes} />

                <div className="flex justify-center gap-6 mt-3">
                  <button onClick={() => onEdit?.(room)}>
                    <Image
                      src="/icons/Edit.png"
                      alt="edit"
                      width={20}
                      height={20}
                    />
                  </button>
                  <button onClick={() => onDelete?.(room)}>
                    <Image
                      src="/icons/Trash.png"
                      alt="delete"
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

function Info({ label, value }) {
  return (
    <div className="flex justify-between mb-2">
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}
