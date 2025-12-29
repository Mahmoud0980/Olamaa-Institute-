"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import SelectInput from "@/components/common/SelectInput";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";

import { useAssignTeacherToSubjectMutation } from "@/store/services/subjectsTeachersApi";
import { useGetTeacherBatchesDetailsQuery } from "@/store/services/teachersApi";
import { useGetSubjectsQuery } from "@/store/services/subjectsApi";

/* ================= Helpers ================= */
function getAcademicBranchName(obj) {
  if (!obj) return "—";

  // الأكتر شيوعاً: { academic_branch: { name } }
  if (obj.academic_branch?.name) return obj.academic_branch.name;

  // احتمال: academic_branch يكون string
  if (typeof obj.academic_branch === "string") return obj.academic_branch;

  // احتمالات ثانية حسب APIs
  if (obj.academic_branch_name) return obj.academic_branch_name;
  if (obj.academicBranch?.name) return obj.academicBranch.name;

  return "—";
}

export default function EditTeacherSubjectsModal({ isOpen, onClose, teacher }) {
  const teacherId = teacher?.id;

  /* ================= API ================= */
  const [assign, { isLoading: isAssigning }] =
    useAssignTeacherToSubjectMutation();

  // 🔹 جميع المواد (مع الفرع الأكاديمي) — عندك transformResponse بيرجع Array مباشرة
  const { data: subjectsRes, isLoading: subjectsLoading } = useGetSubjectsQuery(
    undefined,
    { skip: !isOpen }
  );

  const allSubjects = useMemo(() => {
    if (Array.isArray(subjectsRes)) return subjectsRes; // ✅ الشكل الصحيح عندك
    if (Array.isArray(subjectsRes?.data)) return subjectsRes.data; // احتياط
    return [];
  }, [subjectsRes]);

  // خريطة: subjectId -> academicBranchName (لنستخدمها إذا linkedRes ما فيه فرع)
  const subjectIdToBranchName = useMemo(() => {
    const m = new Map();
    for (const s of allSubjects) {
      m.set(s.id, getAcademicBranchName(s));
    }
    return m;
  }, [allSubjects]);

  // 🔹 المواد المرتبطة بالأستاذ
  const {
    data: linkedRes,
    isLoading: linkedLoading,
    isFetching: linkedFetching,
    refetch,
  } = useGetTeacherBatchesDetailsQuery(
    teacherId ? { id: teacherId, type: "subjects" } : undefined,
    { skip: !isOpen || !teacherId }
  );

  /* ================= STATE ================= */
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setSelectedSubject("");
  }, [isOpen, teacherId]);

  /* ================= DATA NORMALIZE ================= */
  const linkedSubjects = useMemo(() => linkedRes?.data ?? [], [linkedRes]);

  // ملاحظة: التحقق لازم يكون على subject.id لأنو الآن كل فرع إلو subject_id مختلف
  const linkedSubjectIds = useMemo(
    () => new Set(linkedSubjects.map((x) => x?.subject?.id).filter(Boolean)),
    [linkedSubjects]
  );

  const loadingLinked = linkedLoading || linkedFetching;

  /* ================= HANDLERS ================= */
  const handleAdd = async () => {
    if (!selectedSubject) return toast.error("اختر مادة");

    const subjectId = Number(selectedSubject);

    if (linkedSubjectIds.has(subjectId)) {
      return toast.error("هذه المادة مختارة مسبقاً");
    }

    try {
      await assign({
        subject_id: subjectId,
        instructor_id: teacherId,
      }).unwrap();

      toast.success("تم ربط المادة بالأستاذ");
      setSelectedSubject("");
      refetch();
    } catch (e) {
      toast.error(e?.data?.message || "فشل ربط المادة");
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
          <button onClick={onClose}>
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

                // أحياناً linkedRes ما فيه academic_branch داخل subject
                const branchName =
                  getAcademicBranchName(x?.subject) !== "—"
                    ? getAcademicBranchName(x?.subject)
                    : subjectIdToBranchName.get(subjectId) || "—";

                return (
                  <span
                    key={x.instructor_subject_id}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700"
                    title={branchName}
                  >
                    {subjectName} — {branchName}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= Select Subject ================= */}
        <SelectInput
          label="المادة"
          value={selectedSubject}
          options={allSubjects.map((s) => {
            const branchName = getAcademicBranchName(s);
            return {
              value: String(s.id),
              label: `${s.name} — ${branchName}`,
            };
          })}
          onChange={(e) => setSelectedSubject(e.target.value)}
        />

        {/* Loading hint */}
        {subjectsLoading && (
          <p className="text-xs text-gray-500 mt-2">جاري تحميل المواد...</p>
        )}

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
      </div>
    </div>
  );
}
