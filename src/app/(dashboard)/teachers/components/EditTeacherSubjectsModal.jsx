"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { notify } from "@/lib/helpers/toastify";

import SearchableSelect from "@/components/common/SearchableSelect";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";

import {
  useAssignTeacherToSubjectMutation,
  useDeleteTeacherSubjectMutation,
} from "@/store/services/subjectsTeachersApi";
import { useGetTeacherBatchesDetailsQuery } from "@/store/services/teachersApi";
import { useGetSubjectsQuery } from "@/store/services/subjectsApi";

/* ================= Helpers ================= */
function getAcademicBranchName(obj) {
  if (!obj) return "—";

  if (obj.academic_branch?.name) return obj.academic_branch.name;
  if (typeof obj.academic_branch === "string") return obj.academic_branch;

  if (obj.academic_branch_name) return obj.academic_branch_name;
  if (obj.academicBranch?.name) return obj.academicBranch.name;

  return "—";
}

export default function EditTeacherSubjectsModal({ isOpen, onClose, teacher }) {
  const teacherId = teacher?.id;

  /* ================= API ================= */
  const [assign, { isLoading: isAssigning }] =
    useAssignTeacherToSubjectMutation();

  const [deleteTeacherSubject, { isLoading: isDeleting }] =
    useDeleteTeacherSubjectMutation();

  const { data: subjectsRes, isLoading: subjectsLoading } = useGetSubjectsQuery(
    undefined,
    { skip: !isOpen },
  );

  const allSubjects = useMemo(() => {
    if (Array.isArray(subjectsRes)) return subjectsRes;
    if (Array.isArray(subjectsRes?.data)) return subjectsRes.data;
    return [];
  }, [subjectsRes]);

  const subjectIdToBranchName = useMemo(() => {
    const m = new Map();
    for (const s of allSubjects) {
      m.set(s.id, getAcademicBranchName(s));
    }
    return m;
  }, [allSubjects]);

  const {
    data: linkedRes,
    isLoading: linkedLoading,
    isFetching: linkedFetching,
    refetch,
  } = useGetTeacherBatchesDetailsQuery(
    teacherId ? { id: teacherId, type: "subjects" } : undefined,
    { skip: !isOpen || !teacherId, refetchOnMountOrArgChange: true },
  );

  /* ================= STATE ================= */
  const [selectedSubject, setSelectedSubject] = useState("");

  // delete modal state
  const [toDelete, setToDelete] = useState(null); // { instructor_subject_id, subject_name, branch_name }

  useEffect(() => {
    if (!isOpen) return;
    setSelectedSubject("");
    setToDelete(null);
  }, [isOpen, teacherId]);

  /* ================= DATA NORMALIZE ================= */
  const linkedSubjects = useMemo(() => linkedRes?.data ?? [], [linkedRes]);

  const linkedSubjectIds = useMemo(
    () => new Set(linkedSubjects.map((x) => x?.subject?.id).filter(Boolean)),
    [linkedSubjects],
  );

  const loadingLinked = linkedLoading || linkedFetching;

  /* ================= HANDLERS ================= */
  const handleAdd = async () => {
    if (!selectedSubject) return notify.error("اختر مادة");

    const subjectId = Number(selectedSubject);

    if (linkedSubjectIds.has(subjectId)) {
      return notify.error("هذه المادة مختارة مسبقاً");
    }

    try {
      await assign({
        subject_id: subjectId,
        instructor_id: teacherId,
      }).unwrap();

      notify.success("تم ربط المادة بالأستاذ");
      setSelectedSubject("");
      refetch();
    } catch (e) {
      notify.error(e?.data?.message || "فشل ربط المادة");
    }
  };

  const confirmDelete = async () => {
    if (!toDelete?.instructor_subject_id) return;

    try {
      await deleteTeacherSubject(toDelete.instructor_subject_id).unwrap();
      notify.success("تم حذف ربط المادة");
      setToDelete(null);
      refetch();
    } catch (e) {
      notify.error(e?.data?.message || "فشل حذف ربط المادة");
    }
  };

  if (!isOpen || !teacher) return null;

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-start">
      <div className="w-full sm:w-[420px] bg-white h-full p-6 shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between mb-4">
          <h2 className="text-[#6F013F] font-semibold">ربط الأستاذ بمادة</h2>
          <button onClick={onClose} type="button">
            <X />
          </button>
        </div>

        {/* ================= Linked Subjects ================= */}
        <div className="mb-5">
          <p className="text-sm font-medium mb-2 text-gray-700">
            المواد المرتبطة بالأستاذ
          </p>

          {loadingLinked ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-24 rounded-lg bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : linkedSubjects.length === 0 ? (
            <p className="text-sm text-gray-500">لا يوجد مواد مرتبطة</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {linkedSubjects.map((x) => {
                const subjectId = x?.subject?.id;
                const subjectName = x?.subject?.name || "—";

                const branchName =
                  getAcademicBranchName(x?.subject) !== "—"
                    ? getAcademicBranchName(x?.subject)
                    : subjectIdToBranchName.get(subjectId) || "—";

                const linkId = x?.instructor_subject_id;

                return (
                  <div
                    key={linkId}
                    className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700"
                    title={branchName}
                  >
                    <span className="whitespace-nowrap">
                      {subjectName} — {branchName}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setToDelete({
                          instructor_subject_id: linkId,
                          subject_name: subjectName,
                          branch_name: branchName,
                        })
                      }
                      className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-gray-400 hover:text-red-600 transition"
                      title="حذف"
                      disabled={isDeleting}
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= Select Subject ================= */}
        <SearchableSelect
          label="المادة"
          value={selectedSubject}
          required
          options={allSubjects.map((s, idx) => {
            const branchName = getAcademicBranchName(s);
            return {
              value: String(s.id),
              label: `${s.name} — ${branchName}`,
              key: `subopt-${s.id}-${idx}`,
            };
          })}
          placeholder={
            subjectsLoading ? "جاري تحميل المواد..." : "اختر مادة..."
          }
          disabled={subjectsLoading}
          onChange={(val) => setSelectedSubject(val)}
        />

        {/* Duplicate warning */}
        {selectedSubject && linkedSubjectIds.has(Number(selectedSubject)) && (
          <p className="text-xs text-red-500 mt-2">هذه المادة مختارة مسبقاً</p>
        )}

        {/* ================= Action ================= */}
        <div className="mt-4">
          <StepButtonsSmart
            step={1}
            total={1}
            isEdit
            loading={isAssigning}
            onNext={handleAdd}
          />
        </div>

        {/* ================= Delete Confirm Modal ================= */}
        <DeleteConfirmModal
          isOpen={!!toDelete}
          loading={isDeleting}
          title="حذف مادة من الأستاذ"
          description={`هل أنت متأكد من حذف "${toDelete?.subject_name}" — ${toDelete?.branch_name} من الأستاذ؟`}
          onClose={() => setToDelete(null)}
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
}
