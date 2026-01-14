"use client";

import InputField from "@/components/common/InputField";
import SearchableSelect from "@/components/common/SearchableSelect";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import { Controller } from "react-hook-form";

import { useGetCitiesQuery } from "@/store/services/citiesApi";
import { useGetStudentStatusesQuery } from "@/store/services/studentStatusesApi";
import { useGetBusesQuery } from "@/store/services/busesApi";
import { useGetKnowWaysQuery } from "@/store/services/knowWaysApi";

export default function Step2StudentExtra({
  control,
  register,
  errors,
  watch,
  onNext,
  onBack,
}) {
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
    <div className="space-y-4">
      {/* enrollment_date */}
      <InputField
        label="تاريخ التسجيل"
        type="date"
        required
        register={register("enrollment_date", {
          required: "تاريخ التسجيل مطلوب",
        })}
        error={errors.enrollment_date?.message}
      />

      {/* start_attendance_date */}
      <InputField
        label="تاريخ بدء الحضور"
        type="date"
        register={register("start_attendance_date", {
          validate: (value) => {
            if (!value || !enrollmentDate) return true;
            return (
              value >= enrollmentDate ||
              "تاريخ بدء الحضور يجب أن يكون بعد أو يساوي تاريخ التسجيل"
            );
          },
        })}
        error={errors.start_attendance_date?.message}
      />

      {/* gender */}
      <Controller
        control={control}
        name="gender"
        rules={{ required: "الجنس مطلوب" }}
        render={({ field }) => (
          <SearchableSelect
            label="الجنس"
            value={field.value || ""}
            onChange={field.onChange}
            options={[
              { key: "male", value: "male", label: "ذكر" },
              { key: "female", value: "female", label: "أنثى" },
            ]}
            placeholder="اختر الجنس"
          />
        )}
      />
      <p className="text-xs text-red-500">{errors.gender?.message}</p>

      {/* previous_school_name */}
      <Controller
        control={control}
        name="previous_school_name"
        render={({ field }) => (
          <SearchableSelect
            label="المدرسة السابقة"
            value={field.value || ""}
            onChange={field.onChange}
            options={[
              { key: "public", value: "حكومي", label: "حكومي" },
              { key: "private", value: "خاص", label: "خاص" },
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
            value={field.value || ""}
            onChange={field.onChange}
            options={knowWays.map((k, idx) => ({
              key: `${k.id ?? idx}`,
              value: k.name,
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
            value={field.value || ""}
            onChange={field.onChange}
            options={cities.map((c) => ({
              key: c.id,
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
            value={field.value || ""}
            onChange={field.onChange}
            options={statuses.map((s) => ({
              key: s.id,
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
            value={field.value || ""}
            onChange={field.onChange}
            options={buses.map((b) => ({
              key: b.id,
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
        register={register("health_status")}
        error={errors.health_status?.message}
      />

      {/* psychological_status */}
      <InputField
        label="الحالة النفسية"
        register={register("psychological_status")}
        error={errors.psychological_status?.message}
      />

      {/* notes */}
      <InputField
        label="ملاحظات"
        register={register("notes")}
        error={errors.notes?.message}
      />

      {/* files */}
      <div className="space-y-3 border border-gray-200 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-700">الملفات</p>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">صورة شخصية</label>
          <input
            type="file"
            accept="image/*"
            className="text-sm"
            {...register("profile_photo")}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">صورة بطاقة الهوية</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            className="text-sm"
            {...register("id_card_photo")}
          />
        </div>
      </div>

      <StepButtonsSmart step={2} total={6} onNext={onNext} onBack={onBack} />
    </div>
  );
}
