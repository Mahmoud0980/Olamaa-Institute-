"use client";

import { useEffect, useMemo, useState } from "react";
import { notify } from "@/lib/helpers/toastify";

import SearchableSelect from "@/components/common/SearchableSelect";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";

import { useAssignTeacherToSubjectMutation } from "@/store/services/subjectsTeachersApi";
import { useGetTeacherBatchesDetailsQuery } from "@/store/services/teachersApi";
import { useGetSubjectsQuery } from "@/store/services/subjectsApi";

/* Helpers */
function getAcademicBranchName(obj) {
  if (!obj) return "—";
  if (obj.academic_branch?.name) return obj.academic_branch.name;
  if (typeof obj.academic_branch === "string") return obj.academic_branch;
  if (obj.academic_branch_name) return obj.academic_branch_name;
  if (obj.academicBranch?.name) return obj.academicBranch.name;
  return "—";
}

export default function TeacherSubjectsStep({ teacher }) {
  const teacherId = teacher?.id;

  const [assign, { isLoading: isAssigning }] =
    useAssignTeacherToSubjectMutation();

  const { data: subjectsRes, isLoading: subjectsLoading } = useGetSubjectsQuery(
    undefined,
    { skip: !teacherId },
  );

  const allSubjects = useMemo(() => {
    if (Array.isArray(subjectsRes)) return subjectsRes;
    if (Array.isArray(subjectsRes?.data)) return subjectsRes.data;
    return [];
  }, [subjectsRes]);

  const subjectIdToBranchName = useMemo(() => {
    const m = new Map();
    for (const s of allSubjects) m.set(s.id, getAcademicBranchName(s));
    return m;
  }, [allSubjects]);

  const {
    data: linkedRes,
    isLoading: linkedLoading,
    isFetching: linkedFetching,
    refetch,
  } = useGetTeacherBatchesDetailsQuery(
    teacherId ? { id: teacherId, type: "subjects" } : undefined,
    { skip: !teacherId, refetchOnMountOrArgChange: true },
  );

  const linkedSubjects = useMemo(() => linkedRes?.data ?? [], [linkedRes]);
  const linkedSubjectIds = useMemo(
    () => new Set(linkedSubjects.map((x) => x?.subject?.id).filter(Boolean)),
    [linkedSubjects],
  );

  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    setSelectedSubject("");
  }, [teacherId]);

  const handleAdd = async () => {
    if (!teacherId) return notify.error("لا يوجد Teacher ID");
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

  const loadingLinked = linkedLoading || linkedFetching;

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="p-3 bg-pink-50 font-medium text-sm">
        الخطوة 2: ربط مواد للأستاذ ({teacher?.name})
      </div>

      <div className="p-4">
        {/* Linked */}
        <div className="mb-5">
          <p className="text-sm font-medium mb-2 text-gray-700">
            المواد المرتبطة
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

        {/* Select Subject */}
        <SearchableSelect
          label="المادة"
          required
          value={selectedSubject}
          options={allSubjects.map((s, idx) => ({
            value: String(s.id),
            label: `${s.name} — ${getAcademicBranchName(s)}`,
            key: `subopt-${s.id}-${idx}`,
          }))}
          placeholder={
            subjectsLoading ? "جاري تحميل المواد..." : "اختر مادة..."
          }
          disabled={subjectsLoading}
          onChange={(val) => setSelectedSubject(val)}
        />

        {selectedSubject && linkedSubjectIds.has(Number(selectedSubject)) && (
          <p className="text-xs text-red-500 mt-2">هذه المادة مختارة مسبقاً</p>
        )}

        <div className="mt-4">
          <StepButtonsSmart
            step={1}
            total={1}
            submitLabel="حفظ"
            loading={isAssigning}
            onNext={handleAdd}
          />
        </div>
      </div>
    </div>
  );
}
