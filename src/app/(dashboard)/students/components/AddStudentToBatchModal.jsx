"use client";

import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { notify } from "@/lib/helpers/toastify";

import SearchableSelect from "@/components/common/SearchableSelect";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";

import {
  useAddBatchStudentMutation,
  useRemoveBatchStudentMutation,
} from "@/store/services/batchStudentsApi";

export default function AddStudentToBatchModal({
  open,
  onClose,
  student,
  onUpdated,
  batchOptions = [],
  batchesLoading = false,
}) {
  // ✅ hooks لازم تناديهم دائماً
  const { control, handleSubmit, reset } = useForm();

  const [addBatchStudent, { isLoading }] = useAddBatchStudentMutation();
  const [removeBatchStudent, { isLoading: removing }] =
    useRemoveBatchStudentMutation();

  // ✅ useMemo دائماً ينادى (حتى لو student null)
  const options = useMemo(() => {
    const currentId = String(student?.batch?.id || "");
    return (batchOptions || []).filter((o) => o.value !== currentId);
  }, [batchOptions, student?.batch?.id]);

  /* ================= submit ================= */
  const onSubmit = async (values) => {
    if (!student?.id) return;

    if (
      student?.batch?.id &&
      String(student.batch.id) === String(values.batch_id)
    ) {
      notify.error("الطالب موجود بالفعل في هذه الشعبة");
      return;
    }

    try {
      await addBatchStudent({
        student_id: student.id,
        batch_id: values.batch_id,
      }).unwrap();

      notify.success("تمت إضافة الطالب إلى الشعبة");
      onUpdated?.();
      reset({ batch_id: "" });
      onClose?.();
    } catch (e) {
      notify.error(e?.data?.message || "فشل إضافة الطالب إلى الشعبة");
    }
  };

  /* ================= remove ================= */
  const handleRemove = async () => {
    if (!student?.id) return;

    try {
      await removeBatchStudent({
        student_id: student.id,
      }).unwrap();

      notify.success("تمت إزالة الطالب من الشعبة");
      onUpdated?.();
      onClose?.();
    } catch (e) {
      notify.error(e?.data?.message || "فشل إزالة الطالب من الشعبة");
    }
  };

  // ✅ شرط الإظهار بعد كل الـ hooks
  if (!open || !student) return null;

  /* ================= render ================= */
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex">
      <div className="w-[420px] bg-white h-full p-6 overflow-y-auto">
        {/* ===== header ===== */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[#6F013F] font-semibold">
            إضافة الطالب إلى شعبة
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {/* ===== current batch ===== */}
        {student?.batch && (
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">
                الشعبة الحالية: <b>{student.batch.name}</b>
              </span>

              <button
                type="button"
                disabled={removing}
                onClick={handleRemove}
                className="text-red-600 text-sm hover:underline disabled:opacity-50"
              >
                إزالة
              </button>
            </div>
          </div>
        )}

        {/* ===== form ===== */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={control}
            name="batch_id"
            rules={{ required: "الشعبة مطلوبة" }}
            render={({ field, fieldState }) => (
              <>
                <SearchableSelect
                  label="الشعبة"
                  required
                  value={field.value || ""}
                  onChange={field.onChange}
                  options={options}
                  placeholder={
                    batchesLoading ? "جاري التحميل..." : "اختر الشعبة"
                  }
                  allowClear
                  disabled={batchesLoading}
                />
                <p className="text-xs text-red-500">
                  {fieldState.error?.message}
                </p>
              </>
            )}
          />

          <StepButtonsSmart
            submitLabel="حفظ"
            loading={isLoading}
            onBack={() => {
              reset({ batch_id: "" });
              onClose?.();
            }}
          />
        </form>
      </div>
    </div>
  );
}
