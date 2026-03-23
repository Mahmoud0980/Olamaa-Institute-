"use client";

import InputField from "@/components/common/InputField";
import SearchableSelect from "@/components/common/SearchableSelect";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import DatePickerSmart from "@/components/common/DatePickerSmart";
import { Controller } from "react-hook-form";

import { useGetAcademicBranchesQuery } from "@/store/services/academicBranchesApi";
import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

/* helpers */
const currentYear = new Date().getFullYear();

export default function Step1Student({
  control,
  register,
  errors,
  onNext,
  onBack,
}) {
  /* data */
  const { data: branchesRes } = useGetAcademicBranchesQuery();
  const { data: institutesRes } = useGetInstituteBranchesQuery();

  const branches = branchesRes?.data || [];
  const institutes = institutesRes?.data || [];

  return (
    <div className="flex flex-col h-full">
      {/* ===== Header ثابت ===== */}
      <div className="shrink-0 bg-white/90 backdrop-blur border-b border-gray-100 px-1 pb-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-[#6F013F] font-semibold text-sm">
            بيانات الطالب
          </h3>
          {/* <span className="text-[11px] text-gray-400">الخطوة 1</span> */}
        </div>
      </div>

      {/* ===== Body (السكرول هون فقط) ===== */}
      <div className="flex-1 min-h-0 overflow-y-auto px-1 py-4">
        <div className="space-y-4">
          {/* first name */}
          <InputField
            label="اسم الطالب"
            required
            placeholder="أدخل الاسم"
            register={register("first_name", {
              required: "الاسم مطلوب",
              minLength: { value: 2, message: "الاسم لا يجب أن يقل عن حرفين" },
              maxLength: {
                value: 50,
                message: "الاسم لا يجب أن يتجاوز 50 محرف",
              },
            })}
            error={errors?.first_name?.message}
          />

          {/* last name */}
          <InputField
            label="كنية الطالب"
            required
            placeholder="أدخل الكنية"
            register={register("last_name", {
              required: "الكنية مطلوبة",
              minLength: { value: 2, message: "الكنية لا يجب أن تقل عن حرفين" },
              maxLength: {
                value: 50,
                message: "الكنية لا يجب أن تتجاوز 50 محرف",
              },
            })}
            error={errors?.last_name?.message}
          />

          {/* birth place (اختياري) */}
          <InputField
            label="مكان الولادة (اختياري)"
            placeholder="مثال: دمشق"
            register={register("birth_place", {
              minLength: {
                value: 2,
                message: "مكان الولادة لا يجب أن يقل عن حرفين",
              },
              maxLength: {
                value: 50,
                message: "مكان الولادة لا يجب أن يتجاوز 50 محرف",
              },
            })}
            error={errors?.birth_place?.message}
          />

          {/* date of birth (DatePickerSmart) */}
          <Controller
            control={control}
            name="date_of_birth"
            rules={{
              validate: (value) => {
                if (!value) return true; // اختياري

                const d = new Date(`${value}T00:00:00`);
                if (Number.isNaN(d.getTime())) return "تاريخ الولادة غير صالح";

                const today = new Date();
                const today0 = new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate(),
                );

                // إذا كان نفس اليوم أو بعده
                if (d.getTime() === today0.getTime()) {
                  return "لا يجوز اختيار تاريخ اليوم كتاريخ ميلاد";
                }

                if (d > today0) {
                  return "تاريخ الميلاد غير صالح";
                }

                if (d.getFullYear() < 1900) {
                  return "تاريخ الميلاد غير صالح";
                }

                return true;
              },
            }}
            render={({ field }) => (
              <div className="space-y-1">
                <DatePickerSmart
                  label="تاريخ الولادة (اختياري)"
                  value={field.value || ""}
                  onChange={(iso) => field.onChange(iso || "")}
                  placeholder="dd/mm/yyyy"
                  format="DD/MM/YYYY"
                  allowClear
                />
                {!!errors?.date_of_birth?.message && (
                  <p className="text-[12px] text-red-600">
                    {errors.date_of_birth.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* national id */}
          <InputField
            label="الرقم الوطني (اختياري)"
            type="text"
            placeholder="10 أرقام فقط"
            register={register("national_id", {
              setValueAs: (v) =>
                String(v ?? "")
                  .replace(/\D/g, "")
                  .slice(0, 10),
              validate: (v) => {
                const digits = String(v ?? "").replace(/\D/g, "");
                if (digits.length === 0) return true;
                return digits.length === 10 || "يجب إدخال 10 أرقام فقط";
              },
              onChange: (e) => {
                e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
              },
            })}
            error={errors?.national_id?.message}
          />

          {/* academic branch */}
          <Controller
            control={control}
            name="branch_id"
            render={({ field }) => (
              <SearchableSelect
                label="الفرع الدراسي"
                value={field.value ? String(field.value) : null}
                onChange={(v) => {
                  const val = typeof v === "object" ? v?.value : v;
                  field.onChange(val ? String(val) : null);
                }}
                options={branches.map((b) => ({
                  value: String(b.id),
                  label: b.name,
                }))}
                placeholder="اختر الفرع"
                allowClear
              />
            )}
          />

          {/* institute branch */}
          <Controller
            control={control}
            name="institute_branch_id"
            render={({ field }) => (
              <SearchableSelect
                label="فرع المعهد"
                value={field.value ? String(field.value) : null}
                onChange={(v) => {
                  const val = typeof v === "object" ? v?.value : v;
                  field.onChange(val ? String(val) : null);
                }}
                options={institutes.map((i) => ({
                  value: String(i.id),
                  label: i.name,
                }))}
                placeholder="اختر فرع المعهد"
                allowClear
              />
            )}
          />
        </div>
      </div>

      {/* ===== Footer ثابت (الأزرار) ===== */}
      <div className="shrink-0 bg-white/90 backdrop-blur border-t border-gray-100 px-1 pt-3 pb-2">
        <StepButtonsSmart step={1} total={6} onNext={onNext} onBack={onBack} />
      </div>
    </div>
  );
}
