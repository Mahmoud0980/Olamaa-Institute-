"use client";

import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";

import SearchableSelect from "@/components/common/SearchableSelect";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";

import { useGetBatchesQuery } from "@/store/services/batchesApi";
import {
  useAddBatchStudentMutation,
  useRemoveBatchStudentMutation,
} from "@/store/services/batchStudentsApi";

export default function AddStudentToBatchModal({
  open,
  onClose,
  student,
  onUpdated,
}) {
  const { control, handleSubmit } = useForm();

  const { data: batchesRes } = useGetBatchesQuery();
  const [addBatchStudent, { isLoading }] = useAddBatchStudentMutation();
  const [removeBatchStudent, { isLoading: removing }] =
    useRemoveBatchStudentMutation();

  if (!open || !student) return null;

  // ⛔ إخفاء الشعبة الحالية من القائمة
  const batches = (batchesRes?.data || []).filter(
    (b) => b.id !== student?.batch?.id
  );

  /* ================= submit ================= */
  const onSubmit = async (values) => {
    // حماية إضافية (حتى لو رجعت تظهر)
    if (student?.batch?.id === Number(values.batch_id)) {
      toast.error("الطالب موجود بالفعل في هذه الشعبة");
      return;
    }

    try {
      await addBatchStudent({
        student_id: student.id,
        batch_id: values.batch_id,
      }).unwrap();

      toast.success("تمت إضافة الطالب إلى الشعبة");
      onUpdated?.();
      onClose();
    } catch (e) {
      toast.error(e?.data?.message || "فشل إضافة الطالب إلى الشعبة");
    }
  };

  /* ================= remove ================= */
  const handleRemove = async () => {
    try {
      await removeBatchStudent({
        student_id: student.id,
      }).unwrap();

      toast.success("تمت إزالة الطالب من الشعبة");
      onUpdated?.();
      onClose();
    } catch (e) {
      toast.error(e?.data?.message || "فشل إزالة الطالب من الشعبة");
    }
  };

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
                  options={batches.map((b) => ({
                    key: b.id,
                    value: String(b.id),
                    label: b.name,
                  }))}
                  placeholder="اختر الشعبة"
                  allowClear
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
            onBack={onClose}
          />
        </form>
      </div>
    </div>
  );
}
