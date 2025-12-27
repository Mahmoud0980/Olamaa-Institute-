"use client";

import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useGetTeacherBatchesDetailsQuery } from "@/store/services/teachersApi";
import { useDeleteBatchSubjectMutation } from "@/store/services/batcheSubjectsApi";

const PAGE_SIZE = 4;

// =======================
// MAIN COMPONENT
// =======================
export default function CoursesTable({ selectedTeacher }) {
  const teacherId = selectedTeacher?.id;

  const { data, isLoading } = useGetTeacherBatchesDetailsQuery(teacherId, {
    skip: !teacherId,
  });

  const batches = data?.data || [];

  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [remove, { isLoading: isDeleting }] = useDeleteBatchSubjectMutation();

  // =======================
  // FLATTEN DATA
  // =======================
  const rows = useMemo(() => {
    let index = 1;

    return batches.flatMap((batch) =>
      batch.subjects.map((sub) => ({
        index: index++,
        batch_id: batch.batch_id,
        batch_name: batch.batch_name,
        class_room: batch.class_room?.name || "—",
        subject_id: sub.subject_id,
        subject_name: sub.subject_name,
      }))
    );
  }, [batches]);

  // =======================
  // PAGINATION
  // =======================
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  const paginatedRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // reset page when teacher changes
  useState(() => {
    setPage(1);
  }, [teacherId]);

  if (!selectedTeacher) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-semibold mb-4">الدورات</h3>
        <p className="text-gray-500">يرجى اختيار مدرس لعرض الدورات</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5">
        <p className="text-gray-500">جارٍ تحميل الدورات...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h3 className="font-semibold mb-4">الدورات</h3>

      {/* TABLE */}
      <div className="max-h-[450px] overflow-y-auto">
        <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
          <thead className="sticky top-0 bg-pink-50 z-10">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">الدورة</th>
              <th className="p-3">القاعة</th>
              <th className="p-3">المادة</th>
            </tr>
          </thead>

          <tbody>
            {paginatedRows.map((row) => (
              <tr
                key={`${row.batch_id}-${row.subject_id}`}
                className="hover:bg-pink-50"
              >
                <td className="p-3">{row.index}</td>
                <td className="p-3">{row.batch_name}</td>
                <td className="p-3">{row.class_room}</td>
                <td className="p-3">{row.subject_name}</td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  لا يوجد مواد مرتبطة بهذا المدرس
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-4 mt-6">
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
      {/* DELETE MODAL */}
    </div>
  );
}
