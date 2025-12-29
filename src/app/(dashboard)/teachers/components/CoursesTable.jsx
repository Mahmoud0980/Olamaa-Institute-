"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

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
      onClick={onClick}
      title={title}
      className="hover:opacity-80 text-red-600"
    >
      <Trash2 size={18} />
    </button>
  );
}

export default function CoursesTable({ selectedTeacher }) {
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
    { skip: !teacherId, refetchOnMountOrArgChange: true }
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
    }
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
    page * PAGE_SIZE
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
    <div className="bg-white rounded-xl shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="font-semibold">تفاصيل {selectedTeacher?.name}</h3>
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
            <div className="max-h-[450px] overflow-y-auto">
              <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
                <thead className="sticky top-0 bg-pink-50 z-10">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">الشعبة</th>
                    <th className="p-3">القاعة</th>
                    <th className="p-3">المواد</th>
                    <th className="p-3">الفترة</th>
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
                        key={`all-${b?.batch_id}-${b?.class_room?.id ?? "no"}`}
                        className="hover:bg-pink-50"
                      >
                        <td className="p-3">{rowIndex}</td>
                        <td className="p-3">{b?.batch_name || "—"}</td>
                        <td className="p-3">{b?.class_room?.name || "—"}</td>
                        <td className="p-3">{subjectsText}</td>
                        <td className="p-3 text-gray-600 text-xs">
                          {b?.start_date} → {b?.end_date}
                        </td>
                      </tr>
                    );
                  })}

                  {listForPaging.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">
                        لا يوجد بيانات مرتبطة بهذا المدرس
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ================= BATCHES ================= */}
          {tab === "batches" && (
            <div className="max-h-[450px] overflow-y-auto">
              <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
                <thead className="sticky top-0 bg-pink-50 z-10">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">الشعبة</th>
                    <th className="p-3">من</th>
                    <th className="p-3">إلى</th>
                    <th className="p-3 text-center">الإجراءات</th>
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
                        <td className="p-3">{rowIndex}</td>
                        <td className="p-3">{b?.batch_name || "—"}</td>
                        <td className="p-3">{b?.start_date || "—"}</td>
                        <td className="p-3">{b?.end_date || "—"}</td>

                        <td className="p-3">
                          <div className="flex items-center justify-center">
                            <DeleteIconButton
                              onClick={() => {
                                if (b?.subjects?.length > 0) {
                                  return toast.error(
                                    "لا يمكن حذف الشعبة قبل حذف المواد المرتبطة بها أولاً."
                                  );
                                }
                                toast("لا يوجد مواد مرتبطة بهذه الشعبة.");
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {listForPaging.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">
                        لا يوجد شعب مرتبطة بهذا المدرس
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ================= SUBJECTS ================= */}
          {tab === "subjects" && (
            <div className="max-h-[450px] overflow-y-auto">
              <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
                <thead className="sticky top-0 bg-pink-50 z-10">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">المادة</th>
                    <th className="p-3">الشُّعب</th>
                    <th className="p-3 text-center">الإجراءات</th>
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
                        <td className="p-3">{rowIndex}</td>
                        <td className="p-3">{subjectName}</td>
                        <td className="p-3">
                          {batchesForSubject.length > 0
                            ? batchesForSubject.join(" / ")
                            : "—"}
                        </td>

                        <td className="p-3">
                          <div className="flex items-center justify-center">
                            <DeleteIconButton
                              onClick={() => {
                                if (!subjectId) return;
                                setToDeleteSubject({
                                  instructor_id: teacherId,
                                  subject_id: subjectId,
                                  subject_name: subjectName,
                                });
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {listForPaging.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-500">
                        لا يوجد مواد مرتبطة بهذا المدرس
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
            const res = await deleteByIds({
              instructor_id: toDeleteSubject.instructor_id,
              subject_id: toDeleteSubject.subject_id,
            }).unwrap();

            toast.success("تم حذف المادة");
            setToDeleteSubject(null);

            refetchAll();
            refetchSubjects();
          } catch (e) {
            toast.error(e?.data?.message || "فشل حذف المادة");
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
            toast.success("تم الحذف");
            setToDeleteBatchSubject(null);

            // ✅ بدون Refresh
            refetchAll();
          } catch (e) {
            toast.error(e?.data?.message || "فشل الحذف");
          }
        }}
      />
    </div>
  );
}
