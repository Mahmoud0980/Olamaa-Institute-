"use client";

import InputField from "@/components/common/InputField";
import SearchableSelect from "@/components/common/SearchableSelect";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import DatePickerSmart from "@/components/common/DatePickerSmart";
import { Controller } from "react-hook-form";

import { useGetCitiesQuery } from "@/store/services/citiesApi";
import { useGetStudentStatusesQuery } from "@/store/services/studentStatusesApi";
import { useGetBusesQuery } from "@/store/services/busesApi";
import { useGetKnowWaysQuery } from "@/store/services/knowWaysApi";

/* helpers */
const fileRequired = (files) => {
  if (!files) return "حقل الصورة مطلوب";
  if (files instanceof FileList) return files.length > 0 || "حقل الصورة مطلوب";
  if (Array.isArray(files)) return files.length > 0 || "حقل الصورة مطلوب";
  return "حقل الصورة مطلوب";
};

export default function Step2StudentExtra({
  control,
  register,
  errors,
  watch,
  onNext,
  onBack,
}) {
  /* data */
  const { data: citiesRes } = useGetCitiesQuery();
  const { data: statusesRes } = useGetStudentStatusesQuery();
  const { data: busesRes } = useGetBusesQuery();
  const { data: knowWaysRes } = useGetKnowWaysQuery();

  const enrollmentDate = watch("enrollment_date");

  const cities = citiesRes?.data || [];
  const statuses = statusesRes?.data || [];
  const buses = busesRes?.data || [];
  const knowWays = knowWaysRes?.data || [];

  return (
    <div className="flex flex-col h-full">
      {/* ===== Header ثابت (اختياري) ===== */}
      <div className="shrink-0 bg-white/90 backdrop-blur border-b border-gray-100 px-1 pb-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-[#6F013F] font-semibold text-sm">
            بيانات إضافية
          </h3>
          {/* <span className="text-[11px] text-gray-400">الخطوة 2</span> */}
        </div>
      </div>

      {/* ===== Body (سكرول على الحقول فقط) ===== */}
      <div className="flex-1 min-h-0 overflow-y-auto px-1 py-4">
        <div className="space-y-4">
          {/* enrollment_date (DatePickerSmart) */}
          <Controller
            control={control}
            name="enrollment_date"
            rules={{ required: "تاريخ التسجيل مطلوب" }}
            render={({ field }) => (
              <div className="space-y-1">
                <DatePickerSmart
                  label="تاريخ التسجيل"
                  required
                  value={field.value || ""}
                  onChange={(iso) => field.onChange(iso || "")}
                  format="DD/MM/YYYY"
                  allowClear
                />
                {!!errors?.enrollment_date?.message && (
                  <p className="text-[12px] text-red-600">
                    {errors.enrollment_date.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* start_attendance_date (اختياري) */}
          <Controller
            control={control}
            name="start_attendance_date"
            rules={{
              validate: (value) => {
                if (!value || !enrollmentDate) return true;
                return (
                  value >= enrollmentDate ||
                  "تاريخ بدء الحضور يجب أن يكون بعد أو يساوي تاريخ التسجيل"
                );
              },
            }}
            render={({ field }) => (
              <div className="space-y-1">
                <DatePickerSmart
                  label="تاريخ بدء الحضور (اختياري)"
                  value={field.value || ""}
                  onChange={(iso) => field.onChange(iso || "")}
                  format="DD/MM/YYYY"
                  allowClear
                />
                {!!errors?.start_attendance_date?.message && (
                  <p className="text-[12px] text-red-600">
                    {errors.start_attendance_date.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* gender */}
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <SearchableSelect
                label="الجنس"
                value={field.value ? String(field.value) : null}
                onChange={(v) => {
                  const val = typeof v === "object" ? v?.value : v;
                  field.onChange(val ? String(val) : null);
                }}
                options={[
                  { value: "male", label: "ذكر" },
                  { value: "female", label: "أنثى" },
                ]}
                placeholder="اختر الجنس"
                allowClear
              />
            )}
          />

          {/* previous_school_name */}
          <Controller
            control={control}
            name="previous_school_name"
            render={({ field }) => (
              <SearchableSelect
                label="المدرسة السابقة"
                value={field.value ? String(field.value) : null}
                onChange={(v) => {
                  const val = typeof v === "object" ? v?.value : v;
                  field.onChange(val ? String(val) : null);
                }}
                options={[
                  { value: "حكومي", label: "حكومي" },
                  { value: "خاص", label: "خاص" },
                ]}
                placeholder="اختر المدرسة"
                allowClear
              />
            )}
          />

          {/* how_know_institute */}
          <Controller
            control={control}
            name="how_know_institute"
            render={({ field }) => (
              <SearchableSelect
                label="كيف عرفت بالمعهد؟"
                value={field.value ? String(field.value) : null}
                onChange={(v) => {
                  const val = typeof v === "object" ? v?.value : v;
                  field.onChange(val ? String(val) : null);
                }}
                options={knowWays.map((k) => ({
                  value: String(k.name),
                  label: k.name,
                }))}
                placeholder="اختر الطريقة"
                allowClear
              />
            )}
          />

          {/* city_id */}
          <Controller
            control={control}
            name="city_id"
            render={({ field }) => (
              <SearchableSelect
                label="المدينة"
                value={field.value ? String(field.value) : null}
                onChange={(v) => {
                  const val = typeof v === "object" ? v?.value : v;
                  field.onChange(val ? String(val) : null);
                }}
                options={cities.map((c) => ({
                  value: String(c.id),
                  label: c.name,
                }))}
                placeholder="اختر المدينة"
                allowClear
              />
            )}
          />

          {/* status_id */}
          <Controller
            control={control}
            name="status_id"
            render={({ field }) => (
              <SearchableSelect
                label="حالة الطالب"
                value={field.value ? String(field.value) : null}
                onChange={(v) => {
                  const val = typeof v === "object" ? v?.value : v;
                  field.onChange(val ? String(val) : null);
                }}
                options={statuses.map((s) => ({
                  value: String(s.id),
                  label: s.name,
                }))}
                placeholder="اختر الحالة"
                allowClear
              />
            )}
          />

          {/* bus_id */}
          <Controller
            control={control}
            name="bus_id"
            render={({ field }) => (
              <SearchableSelect
                label="الحافلة"
                value={field.value ? String(field.value) : null}
                onChange={(v) => {
                  const val = typeof v === "object" ? v?.value : v;
                  field.onChange(val ? String(val) : null);
                }}
                options={buses.map((b) => ({
                  value: String(b.id),
                  label: b.name || b.code || `Bus #${b.id}`,
                }))}
                placeholder="اختر الحافلة"
                allowClear
              />
            )}
          />

          {/* health_status */}
          <InputField
            label="الحالة الصحية"
            register={register("health_status", {
              maxLength: { value: 200, message: "الحد الأقصى 200 محرف" },
            })}
            error={errors?.health_status?.message}
          />

          {/* psychological_status */}
          <InputField
            label="الحالة النفسية"
            register={register("psychological_status", {
              maxLength: { value: 200, message: "الحد الأقصى 200 محرف" },
            })}
            error={errors?.psychological_status?.message}
          />

          {/* notes */}
          <InputField
            label="ملاحظات"
            register={register("notes", {
              maxLength: { value: 200, message: "الحد الأقصى 200 محرف" },
            })}
            error={errors?.notes?.message}
          />

          {/* files */}
          <div className="space-y-3 border border-gray-200 rounded-xl p-4 bg-white">
            <p className="text-sm font-medium text-gray-700">الملفات</p>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">صورة شخصية</label>
              <input
                type="file"
                accept="image/*"
                className="text-sm"
                // {...register("profile_photo", { validate: fileRequired })}
              />
              {!!errors?.profile_photo?.message && (
                <p className="text-[12px] text-red-600">
                  {errors.profile_photo.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">صورة بطاقة الهوية</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="text-sm"
                // {...register("id_card_photo", { validate: fileRequired })}
              />
              {!!errors?.id_card_photo?.message && (
                <p className="text-[12px] text-red-600">
                  {errors.id_card_photo.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Footer ثابت (الأزرار) ===== */}
      <div className="shrink-0 bg-white/90 backdrop-blur border-t border-gray-100 px-1 pt-3 pb-2">
        <StepButtonsSmart step={2} total={6} onNext={onNext} onBack={onBack} />
      </div>
    </div>
  );
}
