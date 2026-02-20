"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";
import { useForm, Controller } from "react-hook-form";

import InputField from "@/components/common/InputField";
import SearchableSelect from "@/components/common/SearchableSelect";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";

import {
  useGetRecordQuery,
  useUpdateRecordMutation,
} from "@/store/services/academicRecordsApi";

const RECORD_TYPES = [
  { key: "ninth_grade", value: "ninth_grade", label: "ناجح تاسع" },
  { key: "bac_passed", value: "bac_passed", label: "ناجح بكالوريا" },
  { key: "bac_failed", value: "bac_failed", label: "راسب بكالوريا" },
];

export default function EditAcademicRecordModal({
  open,
  onClose,
  recordId,
  onSaved,
}) {
  const { data, isFetching } = useGetRecordQuery(recordId, {
    skip: !open || !recordId,
  });

  const record = data?.data;

  const [updateRecord, { isLoading }] = useUpdateRecordMutation();

  const form = useForm({ mode: "onTouched" });
  const { control, register, reset, trigger, getValues, formState } = form;
  const { errors } = formState;

  /* ✅ هون السر */
  useEffect(() => {
    if (!record) return;

    reset({
      record_type: record.record_type ?? "",
      total_score: record.total_score ? Number(record.total_score) : "",
      year: record.year ?? "",
      description: record.description ?? "",
    });
  }, [record, reset]);

  if (!open) return null;

  const handleSave = async () => {
    const ok = await trigger(["record_type", "total_score", "year"]);
    if (!ok) return;

    try {
      const v = getValues();

      await updateRecord({
        id: recordId,
        record_type: v.record_type,
        total_score: v.total_score,
        year: v.year,
        description: v.description || null,
      }).unwrap();

      notify.success("تم تعديل السجل الأكاديمي");
      onSaved?.();
      onClose?.();
    } catch (e) {
      notify.error("فشل تعديل السجل الأكاديمي");
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-start">
      <div className="w-[520px] bg-white h-full p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between mb-4">
          <h2 className="text-[#6F013F] font-semibold">
            تعديل السجل الأكاديمي
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {isFetching ? (
          <div className="py-10 text-center text-gray-400">جارٍ التحميل...</div>
        ) : (
          <div className="space-y-4">
            {/* record_type */}
            <Controller
              control={control}
              name="record_type"
              rules={{ required: "نوع السجل مطلوب" }}
              render={({ field }) => (
                <SearchableSelect
                  label="نوع السجل الأكاديمي"
                  required
                  value={field.value || ""}
                  onChange={field.onChange}
                  options={RECORD_TYPES}
                  placeholder="اختر نوع السجل"
                  allowClear
                />
              )}
            />
            <p className="text-xs text-red-500">
              {errors.record_type?.message}
            </p>

            <InputField
              label="المجموع"
              type="number"
              required
              register={register("total_score", {
                required: "المجموع مطلوب",
                valueAsNumber: true,
              })}
              error={errors.total_score?.message}
            />

            <InputField
              label="السنة"
              type="number"
              required
              register={register("year", {
                required: "السنة مطلوبة",
                valueAsNumber: true,
                min: { value: 1900, message: "السنة غير صحيحة" },
                max: {
                  value: new Date().getFullYear() + 1,
                  message: "السنة غير صحيحة",
                },
                onChange: (e) => {
                  e.target.value = String(e.target.value)
                    .replace(/\D/g, "")
                    .slice(0, 4);
                },
              })}
              error={errors.year?.message}
            />

            <textarea
              rows={3}
              {...register("description")}
              placeholder="الوصف (اختياري)"
              className="rounded-xl p-2 text-sm w-full border border-gray-200 outline-none"
            />

            <StepButtonsSmart
              step={1}
              total={1}
              onNext={handleSave}
              loading={isLoading}
              submitLabel="حفظ"
            />
          </div>
        )}
      </div>
    </div>
  );
}
