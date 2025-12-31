"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import SelectInput from "@/components/common/SelectInput";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";

import { useGetBatchesQuery } from "@/store/services/batchesApi";
import { useGetTeacherBatchesDetailsQuery } from "@/store/services/teachersApi";
import {
  useAssignInstructorSubjectToBatchMutation,
  useDeleteBatchSubjectMutation,
} from "@/store/services/batcheSubjectsApi";

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

export default function TeacherBatchesStep({ teacher }) {
  const teacherId = teacher?.id;

  const { data: batchesRes, isFetching: fetchingBatches } = useGetBatchesQuery(
    undefined,
    {
      skip: !teacherId,
      refetchOnMountOrArgChange: true,
    }
  );
  const batches = batchesRes?.data || [];

  // teacher subjects => instructor_subject_id + subject
  const {
    data: teacherSubjectsRes,
    isFetching: fetchingTeacherSubjects,
    refetch: refetchTeacherSubjects,
  } = useGetTeacherBatchesDetailsQuery(
    teacherId ? { id: teacherId, type: "subjects" } : undefined,
    { skip: !teacherId, refetchOnMountOrArgChange: true }
  );

  const teacherSubjects = useMemo(
    () => teacherSubjectsRes?.data || [],
    [teacherSubjectsRes]
  );

  // teacher all data => batches with subjects[] incl batch_subject_id
  const {
    data: teacherAllRes,
    isFetching: fetchingTeacherAll,
    refetch: refetchTeacherAll,
  } = useGetTeacherBatchesDetailsQuery(
    teacherId ? { id: teacherId, type: "all" } : undefined,
    { skip: !teacherId, refetchOnMountOrArgChange: true }
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

  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    if (!teacherId) return;
    setForm({ batch_id: "", instructor_subject_id: "", notes: "" });
    setToDelete(null);
    refetchTeacherAll();
    refetchTeacherSubjects();
  }, [teacherId, refetchTeacherAll, refetchTeacherSubjects]);

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

    const targetBatch = teacherAll.find((b) => b.batch_id === batchId);
    if (!targetBatch) return false;

    return (targetBatch.subjects || []).some((s) => s.subject_id === subjectId);
  }, [
    form.batch_id,
    form.instructor_subject_id,
    teacherAll,
    instructorSubjectIdToSubjectId,
  ]);

  const handleAssign = async () => {
    if (!form.batch_id) return toast.error("اختر الشعبة");
    if (!form.instructor_subject_id)
      return toast.error("اختر مادة من مواد الأستاذ");

    if (teacherSubjects.length === 0) {
      return toast.error("لا توجد مواد مرتبطة بالأستاذ. اربط مادة أولاً.");
    }

    if (isDuplicate) return toast.error("هذه المادة مخصصة مسبقاً لهذه الشعبة");

    try {
      await assign({
        batch_id: Number(form.batch_id),
        instructor_subject_id: Number(form.instructor_subject_id),
        notes: form.notes || "",
      }).unwrap();

      toast.success("تم تخصيص المادة للشعبة بنجاح");
      setForm({ batch_id: "", instructor_subject_id: "", notes: "" });

      refetchTeacherAll();
      refetchTeacherSubjects();
    } catch (e) {
      toast.error(e?.data?.message || "فشل التخصيص");
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteBatchSubject(toDelete.batch_subject_id).unwrap();
      toast.success("تم حذف التخصيص");
      setToDelete(null);
      refetchTeacherAll();
      refetchTeacherSubjects();
    } catch (e) {
      toast.error(e?.data?.message || "فشل الحذف");
    }
  };

  const loadingNow =
    fetchingBatches || fetchingTeacherAll || fetchingTeacherSubjects;

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="p-3 bg-pink-50 font-medium text-sm">
        الخطوة 3: تخصيص المواد للشُّعب ({teacher?.name})
      </div>

      <div className="p-4 space-y-4">
        <SelectInput
          label="الشعبة"
          value={form.batch_id}
          options={batches.map((b) => ({ value: b.id, label: b.name }))}
          onChange={(e) => setForm((p) => ({ ...p, batch_id: e.target.value }))}
        />

        <SelectInput
          label="مادة من مواد الأستاذ"
          value={form.instructor_subject_id}
          options={teacherSubjects.map((x) => ({
            value: x.instructor_subject_id,
            label: x?.subject?.name,
          }))}
          onChange={(e) =>
            setForm((p) => ({ ...p, instructor_subject_id: e.target.value }))
          }
        />

        <FormInput
          label="ملاحظات"
          value={form.notes}
          register={{
            onChange: (e) => setForm((p) => ({ ...p, notes: e.target.value })),
          }}
        />

        <StepButtonsSmart
          step={1}
          total={1}
          submitLabel="حفظ"
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
            لا توجد مواد مرتبطة بالأستاذ. اربط مادة أولاً من الخطوة السابقة.
          </p>
        )}

        {/* Existing assignments */}
        <div className="bg-white rounded-xl border border-gray-100 mt-4">
          <div className="p-3 bg-pink-50 font-medium text-sm">
            التخصيصات الحالية
          </div>

          {loadingNow ? (
            <div className="p-4 text-sm text-gray-500">جارٍ التحميل...</div>
          ) : (
            <table className="min-w-full text-sm text-right">
              <thead>
                <tr className="border-b">
                  <th className="p-3">الشعبة</th>
                  <th className="p-3">المادة</th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {teacherAll.flatMap((b) =>
                  (b.subjects || []).map((s) => (
                    <tr
                      key={`as-${b.batch_id}-${s.batch_subject_id}`}
                      className="border-b last:border-b-0"
                    >
                      <td className="p-3">{b.batch_name}</td>
                      <td className="p-3">{s.subject_name}</td>
                      <td className="p-3">
                        <div className="flex justify-center">
                          <DeleteIconButton
                            title="حذف تخصيص"
                            onClick={() =>
                              setToDelete({
                                batch_subject_id: s.batch_subject_id,
                              })
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}

                {teacherAll.length === 0 ||
                teacherAll.every((b) => (b.subjects || []).length === 0) ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-500">
                      لا يوجد تخصيصات حالياً
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          )}
        </div>
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
  );
}
