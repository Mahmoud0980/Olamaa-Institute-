"use client";

import { X, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { notify } from "@/lib/helpers/toastify";

import SearchableSelect from "@/components/common/SearchableSelect";
import InputField from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";

import { useGetBatchesQuery } from "@/store/services/batchesApi";
import { useGetTeacherBatchesDetailsQuery } from "@/store/services/teachersApi";
import {
  useAssignInstructorSubjectToBatchMutation,
  useDeleteBatchSubjectMutation,
} from "@/store/services/batcheSubjectsApi";

export default function EditTeacherBatchesModal({ isOpen, onClose, teacher }) {
  const teacherId = teacher?.id;

  // ✅ all batches options
  const {
    data: batchesRes,
    isFetching: fetchingBatches,
    refetch: refetchBatches,
  } = useGetBatchesQuery(undefined, {
    skip: !isOpen,
    refetchOnMountOrArgChange: true,
  });

  const batches = batchesRes?.data || [];

  // ✅ teacher subjects => instructor_subject_id + subject
  const {
    data: teacherSubjectsRes,
    isFetching: fetchingTeacherSubjects,
    refetch: refetchTeacherSubjects,
  } = useGetTeacherBatchesDetailsQuery(
    teacherId ? { id: teacherId, type: "subjects" } : undefined,
    { skip: !isOpen || !teacherId, refetchOnMountOrArgChange: true },
  );

  const teacherSubjects = useMemo(
    () => teacherSubjectsRes?.data || [],
    [teacherSubjectsRes],
  );

  // ✅ teacher all data => batches with subjects[] incl batch_subject_id
  const {
    data: teacherAllRes,
    isFetching: fetchingTeacherAll,
    refetch: refetchTeacherAll,
  } = useGetTeacherBatchesDetailsQuery(
    teacherId ? { id: teacherId, type: "all" } : undefined,
    { skip: !isOpen || !teacherId, refetchOnMountOrArgChange: true },
  );

  const teacherAll = useMemo(() => teacherAllRes?.data || [], [teacherAllRes]);

  const [assign, { isLoading: assigning }] =
    useAssignInstructorSubjectToBatchMutation();

  const [deleteBatchSubject, { isLoading: deleting }] =
    useDeleteBatchSubjectMutation();

  const [form, setForm] = useState({
    batch_id: "",
    instructor_subject_id: "",
    notes: "",
  });

  const [toDelete, setToDelete] = useState(null); // {batch_subject_id}

  useEffect(() => {
    if (!isOpen) return;
    setForm({ batch_id: "", instructor_subject_id: "", notes: "" });
    setToDelete(null);

    // ✅ أول ما يفتح المودل جيب آخر نسخة
    if (teacherId) {
      refetchTeacherAll();
      refetchTeacherSubjects();
      refetchBatches?.();
    }
  }, [
    isOpen,
    teacherId,
    refetchTeacherAll,
    refetchTeacherSubjects,
    refetchBatches,
  ]);

  const instructorSubjectIdToSubjectId = useMemo(() => {
    const map = new Map();
    teacherSubjects.forEach((x) => {
      if (x?.instructor_subject_id && x?.subject?.id) {
        map.set(x.instructor_subject_id, x.subject.id);
      }
    });
    return map;
  }, [teacherSubjects]);

  const isDuplicate = useMemo(() => {
    const batchId = Number(form.batch_id);
    const insSubId = Number(form.instructor_subject_id);
    if (!batchId || !insSubId) return false;

    const subjectId = instructorSubjectIdToSubjectId.get(insSubId);
    if (!subjectId) return false;

    const targetBatch = teacherAll.find((b) => Number(b.batch_id) === batchId);
    if (!targetBatch) return false;

    return (targetBatch.subjects || []).some((s) => s.subject_id === subjectId);
  }, [
    form.batch_id,
    form.instructor_subject_id,
    teacherAll,
    instructorSubjectIdToSubjectId,
  ]);

  const handleAssign = async () => {
    if (!form.batch_id) return notify.error("اختر الشعبة");
    if (!form.instructor_subject_id)
      return notify.error("اختر مادة من مواد الأستاذ");

    if (teacherSubjects.length === 0) {
      return notify.error("لا توجد مواد مرتبطة بالأستاذ. اربط مادة أولاً.");
    }

    if (isDuplicate) {
      return notify.error("هذه المادة مخصصة مسبقاً لهذه الشعبة");
    }

    try {
      await assign({
        batch_id: Number(form.batch_id),
        instructor_subject_id: Number(form.instructor_subject_id),
        notes: form.notes || "",
      }).unwrap();

      notify.success("تم تخصيص المادة للشعبة بنجاح");
      setForm({ batch_id: "", instructor_subject_id: "", notes: "" });

      // ✅ تحديث مباشر
      refetchTeacherAll();
      refetchTeacherSubjects();
    } catch (e) {
      notify.error(e?.data?.message || "فشل التخصيص");
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteBatchSubject(toDelete.batch_subject_id).unwrap();
      notify.success("تم حذف التخصيص");
      setToDelete(null);

      // ✅ تحديث مباشر
      refetchTeacherAll();
      refetchTeacherSubjects();
    } catch (e) {
      notify.error(e?.data?.message || "فشل الحذف");
    }
  };

  if (!isOpen || !teacher) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-start">
      <div className="w-full sm:w-[520px] bg-white h-full p-6 shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between mb-4">
          <div>
            <h2 className="text-[#6F013F] font-semibold">ربط/تعديل الشعب</h2>
            <p className="text-xs text-gray-500 mt-1">
              الأستاذ: {teacher.name}
            </p>
          </div>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-6">
          <SearchableSelect
            label="الشعبة"
            value={form.batch_id}
            options={batches.map((b, idx) => ({
              value: b.id,
              label: b.name,
              key: `batch-${b.id}-${idx}`,
            }))}
            placeholder={fetchingBatches ? "جارٍ التحميل..." : "اختر الشعبة..."}
            disabled={fetchingBatches}
            onChange={(val) => setForm((p) => ({ ...p, batch_id: val }))}
          />

          <SearchableSelect
            label="مادة من مواد الأستاذ"
            value={form.instructor_subject_id}
            options={teacherSubjects.map((x, idx) => ({
              value: x.instructor_subject_id,
              label: x?.subject?.name,
              key: `sub-${x.instructor_subject_id}-${idx}`,
            }))}
            placeholder={
              fetchingTeacherSubjects
                ? "جارٍ التحميل..."
                : "اختر مادة من مواد الأستاذ..."
            }
            disabled={fetchingTeacherSubjects}
            onChange={(val) =>
              setForm((p) => ({ ...p, instructor_subject_id: val }))
            }
          />

          <InputField
            label="ملاحظات"
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          />

          <StepButtonsSmart
            step={1}
            total={1}
            isEdit
            loading={assigning}
            onNext={handleAssign}
          />

          {isDuplicate && (
            <p className="text-sm text-red-600">
              هذه المادة مخصصة مسبقاً لهذه الشعبة
            </p>
          )}

          {teacherSubjects.length === 0 && !fetchingTeacherSubjects && (
            <p className="text-sm text-gray-500">
              لا توجد مواد مرتبطة بالأستاذ. اربط مادة أولاً من "ربط/تعديل
              المواد".
            </p>
          )}
        </div>

        {/* Existing assignments table */}
        {/* Existing assignments table */}
        <div className="bg-white rounded-xl">
          <div className="p-3 bg-pink-50 font-medium text-sm rounded-xl">
            التخصيصات الحالية
          </div>

          {fetchingTeacherAll || fetchingTeacherSubjects ? (
            <div className="p-4 text-sm text-gray-500">جارٍ التحميل...</div>
          ) : (
            <div className="max-h-[320px] overflow-y-auto">
              <table className="min-w-full text-sm text-right">
                <thead className="sticky top-0 bg-white z-10">
                  <tr>
                    <th className="p-3 text-gray-600 font-medium">الشعبة</th>
                    <th className="p-3 text-gray-600 font-medium">المادة</th>
                    <th className="p-3 text-center text-gray-600 font-medium">
                      الإجراءات
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {teacherAll.flatMap((b) =>
                    (b.subjects || []).map((s) => (
                      <tr
                        key={`as-${b.batch_id}-${s.batch_subject_id}`}
                        className="hover:bg-pink-50/60 transition"
                      >
                        <td className="p-3">{b.batch_name}</td>
                        <td className="p-3">{s.subject_name}</td>
                        <td className="p-3">
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={() =>
                                setToDelete({
                                  batch_subject_id: s.batch_subject_id,
                                })
                              }
                              className="hover:opacity-80"
                              title="حذف تخصيص"
                            >
                              <Trash2 className="w-5 h-5 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )),
                  )}

                  {teacherAll.length === 0 ||
                  teacherAll.every((b) => (b.subjects || []).length === 0) ? (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-gray-500">
                        لا يوجد تخصيصات حالياً
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <DeleteConfirmModal
          isOpen={!!toDelete}
          loading={deleting}
          title="حذف تخصيص"
          description="هل أنت متأكد من حذف هذا التخصيص؟"
          onClose={() => setToDelete(null)}
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
}
