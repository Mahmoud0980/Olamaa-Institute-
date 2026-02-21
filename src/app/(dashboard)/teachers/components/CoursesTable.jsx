"use client";

import { Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { notify } from "@/lib/helpers/toastify";

import CoursesTableSkeleton from "./CoursesTableSkeleton";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import Pagination from "@/components/common/Pagination";

import { useGetTeacherBatchesDetailsQuery } from "@/store/services/teachersApi";
import { useDeleteTeacherSubjectByIdsMutation } from "@/store/services/subjectsTeachersApi";
import { useDeleteBatchSubjectMutation } from "@/store/services/batcheSubjectsApi";

const TABS = [
  { key: "all", label: "الكل" },
  { key: "batches", label: "الشعب" },
  { key: "subjects", label: "المواد" },
];

const PAGE_SIZE = 4;

function DeleteIconButton({ onClick, title = "حذف" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="hover:opacity-80 text-red-600"
    >
      <Trash2 size={18} />
    </button>
  );
}

function InfoRow({ label, value, strong }) {
  return (
    <div className="flex justify-between gap-3 mb-2">
      <span className="text-gray-500 shrink-0">{label}:</span>
      <span className={`text-right ${strong ? "font-semibold" : ""}`}>
        {value}
      </span>
    </div>
  );
}

export default function CoursesTable({ selectedTeacher, onBack }) {
  const teacherId = selectedTeacher?.id;

  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);

  // delete modals state
  const [toDeleteSubject, setToDeleteSubject] = useState(null);
  const [toDeleteBatchSubject, setToDeleteBatchSubject] = useState(null);

  const [deleteByIds, { isLoading: isDeletingSubject }] =
    useDeleteTeacherSubjectByIdsMutation();

  const [deleteBatchSubject, { isLoading: isDeletingBatchSubject }] =
    useDeleteBatchSubjectMutation();

  useEffect(() => {
    setTab("all");
    setPage(1);
  }, [teacherId]);

  useEffect(() => {
    setPage(1);
  }, [tab]);

  // ===== Query 1: ALL (for all + batches + mapping) =====
  const {
    data: allData,
    isLoading: allLoading,
    isFetching: allFetching,
    refetch: refetchAll,
  } = useGetTeacherBatchesDetailsQuery(
    teacherId ? { id: teacherId, type: "all" } : undefined,
    { skip: !teacherId, refetchOnMountOrArgChange: true },
  );

  const allBatches = Array.isArray(allData?.data)
    ? allData.data
    : Array.isArray(allData)
      ? allData
      : [];

  // ===== Build subject -> batches map (to show batches in Subjects tab) =====
  const subjectToBatchesMap = useMemo(() => {
    const map = new Map(); // subject_id -> Set(batch_name)

    for (const b of allBatches) {
      const batchName = b?.batch_name || b?.name || "—";
      const subjects = b?.subjects || [];
      for (const s of subjects) {
        const sid = s?.subject_id;
        if (!sid) continue;
        if (!map.has(sid)) map.set(sid, new Set());
        map.get(sid).add(batchName);
      }
    }

    return map;
  }, [allBatches]);

  // ===== Query 2: SUBJECTS (teacher subjects list) =====
  const {
    data: subjectsData,
    isLoading: subjectsLoading,
    isFetching: subjectsFetching,
    refetch: refetchSubjects,
  } = useGetTeacherBatchesDetailsQuery(
    teacherId ? { id: teacherId, type: "subjects" } : undefined,
    {
      skip: !teacherId || tab !== "subjects",
      refetchOnMountOrArgChange: true,
    },
  );

  const teacherSubjects = Array.isArray(subjectsData?.data)
    ? subjectsData.data
    : Array.isArray(subjectsData)
      ? subjectsData
      : [];

  // ===== Derived lists per tab =====
  const batchesList = useMemo(() => {
    return allBatches.map((b) => ({
      batch_id: b?.batch_id,
      batch_name: b?.batch_name || b?.name || "—",
      start_date: b?.start_date,
      end_date: b?.end_date,
      subjects: b?.subjects || [],
    }));
  }, [allBatches]);

  const listForPaging = useMemo(() => {
    if (tab === "all") return allBatches;
    if (tab === "batches") return batchesList;
    return teacherSubjects;
  }, [tab, allBatches, batchesList, teacherSubjects]);

  const totalPages = Math.max(1, Math.ceil(listForPaging.length / PAGE_SIZE));
  const paginated = listForPaging.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  // ===== Loading UI =====
  const loadingNow =
    !teacherId ||
    allLoading ||
    allFetching ||
    (tab === "subjects" && (subjectsLoading || subjectsFetching));

  if (!selectedTeacher) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-semibold mb-4">تفاصيل المدرّس</h3>
        <p className="text-gray-500">يرجى اختيار مدرس لعرض البيانات</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 relative">
      <button
        type="button"
        onClick={onBack}
        className="absolute top-3 left-3 w-9 h-9 rounded-full  text-gray-700 inline-flex items-center justify-center"
        title="اغلاق"
      >
        <X size={18} />
      </button>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">تفاصيل {selectedTeacher?.name}</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 justify-start">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm border transition ${
              tab === t.key
                ? "bg-pink-50 border-pink-200 text-[#6F013F]"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Skeleton */}
      {loadingNow ? (
        <CoursesTableSkeleton tab={tab} />
      ) : (
        <>
          {/* ================= ALL ================= */}
          {tab === "all" && (
            <>
              {/* Desktop */}
              <div className="hidden md:block max-h-[450px] overflow-y-auto overflow-x-auto">
                <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
                  <thead className="sticky top-0 bg-pink-50 z-10">
                    <tr>
                      <th className="p-3 rounded-r-xl">#</th>
                      <th className="p-3">الشعبة</th>
                      <th className="p-3">القاعة</th>
                      <th className="p-3">المواد</th>
                      <th className="p-3 rounded-l-xl">الفترة</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginated.map((b, idx) => {
                      const rowIndex = (page - 1) * PAGE_SIZE + idx + 1;
                      const subjectsText =
                        b?.subjects?.length > 0
                          ? b.subjects.map((s) => s.subject_name).join("، ")
                          : "—";

                      return (
                        <tr
                          key={`all-${b?.batch_id}-${
                            b?.class_room?.id ?? "no"
                          }`}
                          className="hover:bg-pink-50"
                        >
                          <td className="p-3 rounded-r-xl">{rowIndex}</td>
                          <td className="p-3">{b?.batch_name || "—"}</td>
                          <td className="p-3">{b?.class_room?.name || "—"}</td>
                          <td className="p-3">{subjectsText}</td>
                          <td className="p-3 text-gray-600 text-xs rounded-l-xl">
                            {b?.start_date || "—"} → {b?.end_date || "—"}
                          </td>
                        </tr>
                      );
                    })}

                    {listForPaging.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-4 text-center text-gray-500"
                        >
                          لا يوجد بيانات مرتبطة بهذا المدرس
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="md:hidden space-y-4">
                {paginated.map((b, idx) => {
                  const rowIndex = (page - 1) * PAGE_SIZE + idx + 1;
                  const subjectsText =
                    b?.subjects?.length > 0
                      ? b.subjects.map((s) => s.subject_name).join("، ")
                      : "—";

                  return (
                    <div
                      key={`all-m-${b?.batch_id}-${b?.class_room?.id ?? "no"}`}
                      className="border border-gray-200 rounded-xl p-4 shadow-sm"
                    >
                      <InfoRow label="#" value={rowIndex} strong />
                      <InfoRow label="الشعبة" value={b?.batch_name || "—"} />
                      <InfoRow
                        label="القاعة"
                        value={b?.class_room?.name || "—"}
                      />
                      <InfoRow label="المواد" value={subjectsText} />
                      <InfoRow
                        label="الفترة"
                        value={`${b?.start_date || "—"} → ${
                          b?.end_date || "—"
                        }`}
                      />
                    </div>
                  );
                })}

                {listForPaging.length === 0 && (
                  <div className="py-10 text-center text-gray-400">
                    لا يوجد بيانات مرتبطة بهذا المدرس
                  </div>
                )}
              </div>
            </>
          )}

          {/* ================= BATCHES ================= */}
          {tab === "batches" && (
            <>
              {/* Desktop */}
              <div className="hidden md:block max-h-[450px] overflow-y-auto overflow-x-auto">
                <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
                  <thead className="sticky top-0 bg-pink-50 z-10">
                    <tr>
                      <th className="p-3 rounded-r-xl">#</th>
                      <th className="p-3">الشعبة</th>
                      <th className="p-3">من</th>
                      <th className="p-3">إلى</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginated.map((b, idx) => {
                      const rowIndex = (page - 1) * PAGE_SIZE + idx + 1;

                      return (
                        <tr
                          key={`batch-${b?.batch_id ?? rowIndex}`}
                          className="hover:bg-pink-50"
                        >
                          <td className="p-3 rounded-r-xl">{rowIndex}</td>
                          <td className="p-3">{b?.batch_name || "—"}</td>
                          <td className="p-3">{b?.start_date || "—"}</td>
                          <td className="p-3">{b?.end_date || "—"}</td>
                        </tr>
                      );
                    })}

                    {listForPaging.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-4 text-center text-gray-500"
                        >
                          لا يوجد شعب مرتبطة بهذا المدرس
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="md:hidden space-y-4">
                {paginated.map((b, idx) => {
                  const rowIndex = (page - 1) * PAGE_SIZE + idx + 1;

                  return (
                    <div
                      key={`batch-m-${b?.batch_id ?? rowIndex}`}
                      className="border border-gray-200 rounded-xl p-4 shadow-sm"
                    >
                      <InfoRow label="#" value={rowIndex} strong />
                      <InfoRow label="الشعبة" value={b?.batch_name || "—"} />
                      <InfoRow label="من" value={b?.start_date || "—"} />
                      <InfoRow label="إلى" value={b?.end_date || "—"} />
                    </div>
                  );
                })}

                {listForPaging.length === 0 && (
                  <div className="py-10 text-center text-gray-400">
                    لا يوجد شعب مرتبطة بهذا المدرس
                  </div>
                )}
              </div>
            </>
          )}

          {/* ================= SUBJECTS ================= */}
          {tab === "subjects" && (
            <>
              {/* Desktop */}
              <div className="hidden md:block max-h-[450px] overflow-y-auto overflow-x-auto">
                <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
                  <thead className="sticky top-0 bg-pink-50 z-10">
                    <tr>
                      <th className="p-3 rounded-r-xl">#</th>
                      <th className="p-3">المادة</th>
                      <th className="p-3">الشُّعب</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginated.map((row, idx) => {
                      const rowIndex = (page - 1) * PAGE_SIZE + idx + 1;

                      const instructorSubjectId = row?.instructor_subject_id;
                      const subjectId = row?.subject?.id;
                      const subjectName = row?.subject?.name || "—";

                      const batchesForSubject = subjectId
                        ? Array.from(subjectToBatchesMap.get(subjectId) || [])
                        : [];

                      return (
                        <tr
                          key={`sub-${
                            instructorSubjectId ?? subjectId ?? rowIndex
                          }`}
                          className="hover:bg-pink-50"
                        >
                          <td className="p-3 rounded-r-xl">{rowIndex}</td>
                          <td className="p-3">{subjectName}</td>
                          <td className="p-3">
                            {batchesForSubject.length > 0
                              ? batchesForSubject.join(" / ")
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}

                    {listForPaging.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-4 text-center text-gray-500"
                        >
                          لا يوجد مواد مرتبطة بهذا المدرس
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="md:hidden space-y-4">
                {paginated.map((row, idx) => {
                  const rowIndex = (page - 1) * PAGE_SIZE + idx + 1;

                  const instructorSubjectId = row?.instructor_subject_id;
                  const subjectId = row?.subject?.id;
                  const subjectName = row?.subject?.name || "—";

                  const batchesForSubject = subjectId
                    ? Array.from(subjectToBatchesMap.get(subjectId) || [])
                    : [];

                  return (
                    <div
                      key={`sub-m-${
                        instructorSubjectId ?? subjectId ?? rowIndex
                      }`}
                      className="border border-gray-200 rounded-xl p-4 shadow-sm"
                    >
                      <InfoRow label="#" value={rowIndex} strong />
                      <InfoRow label="المادة" value={subjectName} strong />
                      <InfoRow
                        label="الشُّعب"
                        value={
                          batchesForSubject.length > 0
                            ? batchesForSubject.join(" / ")
                            : "—"
                        }
                      />
                    </div>
                  );
                })}

                {listForPaging.length === 0 && (
                  <div className="py-10 text-center text-gray-400">
                    لا يوجد مواد مرتبطة بهذا المدرس
                  </div>
                )}
              </div>
            </>
          )}

          {/* Pagination */}
          {listForPaging.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* ================= DELETE MODALS ================= */}
      <DeleteConfirmModal
        isOpen={!!toDeleteSubject}
        loading={isDeletingSubject}
        title="حذف مادة"
        description={`هل أنت متأكد من حذف مادة "${toDeleteSubject?.subject_name}" من الأستاذ؟`}
        onClose={() => setToDeleteSubject(null)}
        onConfirm={async () => {
          try {
            await deleteByIds({
              instructor_id: toDeleteSubject.instructor_id,
              subject_id: toDeleteSubject.subject_id,
            }).unwrap();

            notify.success("تم حذف المادة");
            setToDeleteSubject(null);

            refetchAll();
            refetchSubjects();
          } catch (e) {
            const msg = e?.data?.message || "";

            // ✅ MySQL FK constraint (foreign key)
            const isFK =
              msg.includes("SQLSTATE[23000]") ||
              msg.includes("Integrity constraint violation") ||
              msg.includes("Cannot delete or update a parent row") ||
              msg.includes("foreign key constraint");

            if (isFK) {
              notify.error(
                msg ||
                  "لا يمكن حذف هذه المادة لأنها مربوطة بشُعب/تخصيصات. احذف التخصيصات أولاً.",
              );
            } else {
              notify.error(msg || "فشل حذف المادة");
            }
          }
        }}
      />

      <DeleteConfirmModal
        isOpen={!!toDeleteBatchSubject}
        loading={isDeletingBatchSubject}
        title="حذف تخصيص"
        description="هل أنت متأكد؟"
        onClose={() => setToDeleteBatchSubject(null)}
        onConfirm={async () => {
          try {
            await deleteBatchSubject(toDeleteBatchSubject?.id).unwrap();
            notify.success("تم الحذف");
            setToDeleteBatchSubject(null);
            refetchAll();
          } catch (e) {
            notify.error(e?.data?.message || "فشل الحذف");
          }
        }}
      />
    </div>
  );
}
