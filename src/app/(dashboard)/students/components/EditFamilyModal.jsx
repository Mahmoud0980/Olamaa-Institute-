"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";
import { useForm } from "react-hook-form";

import InputField from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";

import { useUpdateGuardianMutation } from "@/store/services/guardiansApi";

export default function EditFamilyModal({ open, onClose, student, onSaved }) {
  const guardians = student?.family?.guardians || [];

  const father = useMemo(
    () => guardians.find((g) => g.relationship === "father"),
    [guardians],
  );

  const mother = useMemo(
    () => guardians.find((g) => g.relationship === "mother"),
    [guardians],
  );

  const [step, setStep] = useState(1);
  const [updateGuardian, { isLoading }] = useUpdateGuardianMutation();

  const form = useForm({ mode: "onTouched" });
  const { register, reset, trigger, getValues, formState } = form;
  const { errors } = formState;

  /* ================= init ================= */
  useEffect(() => {
    if (!open) return;

    setStep(1);

    reset({
      father_first_name: father?.first_name ?? "",
      father_last_name: father?.last_name ?? "",
      father_national_id: father?.national_id ?? "",

      mother_first_name: mother?.first_name ?? "",
      mother_last_name: mother?.last_name ?? "",
      mother_national_id: mother?.national_id ?? "",
    });
  }, [open, reset, father, mother]);

  if (!open) return null;

  /* ================= toast helper ================= */
  const showFirstErrorToast = (fields) => {
    for (const name of fields) {
      const msg = errors?.[name]?.message;
      if (msg) {
        notify.error(msg);
        return;
      }
    }
    notify.error("يرجى التحقق من الحقول المطلوبة");
  };

  /* ================= steps ================= */
  const handleNext = async () => {
    const fieldsStep1 = [
      "father_first_name",
      "father_last_name",
      "father_national_id",
    ];
    const fieldsStep2 = [
      "mother_first_name",
      "mother_last_name",
      "mother_national_id",
    ];

    const fields = step === 1 ? fieldsStep1 : fieldsStep2;
    const ok = await trigger(fields);

    if (!ok) {
      showFirstErrorToast(fields);
      return;
    }

    setStep((s) => Math.min(2, s + 1));
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  /* ================= SAVE (FIXED PAYLOAD) ================= */
  const handleSave = async () => {
    try {
      const allFields = [
        "father_first_name",
        "father_last_name",
        "father_national_id",
        "mother_first_name",
        "mother_last_name",
        "mother_national_id",
      ];

      const okAll = await trigger(allFields);
      if (!okAll) {
        showFirstErrorToast(allFields);
        return;
      }

      const v = getValues();

      // ===== تحديث الأب =====
      if (father?.id) {
        const payloadFather = {
          id: father.id,
          family_id: father.family_id,
          relationship: "father",
          first_name: v.father_first_name,
          last_name: v.father_last_name,
          national_id: v.father_national_id,
          is_primary_contact: father.is_primary_contact ?? false,
          occupation: father.occupation ?? null,
          address: father.address ?? null,
        };

        console.log("📦 UPDATE FATHER PAYLOAD", payloadFather);

        await updateGuardian(payloadFather).unwrap();
      }

      // ===== تحديث الأم =====
      if (mother?.id) {
        const payloadMother = {
          id: mother.id,
          family_id: mother.family_id,
          relationship: "mother",
          first_name: v.mother_first_name,
          last_name: v.mother_last_name,
          national_id: v.mother_national_id,
          is_primary_contact: mother.is_primary_contact ?? false,
          occupation: mother.occupation ?? null,
          address: mother.address ?? null,
        };

        console.log("📦 UPDATE MOTHER PAYLOAD", payloadMother);

        await updateGuardian(payloadMother).unwrap();
      }

      notify.success("تم حفظ بيانات العائلة");
      onSaved?.();
      onClose?.();
    } catch (e) {
      console.error("❌ UPDATE GUARDIAN ERROR", e);
      notify.error(e?.data?.message || "فشل حفظ بيانات العائلة");
    }
  };

  /* ================= render ================= */
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-start">
      <div className="w-[520px] bg-white h-full flex flex-col">
        {/* ===== Header ===== */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-[#6F013F] font-semibold text-lg">
              تعديل بيانات العائلة
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {student?.full_name ?? ""}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            <X />
          </button>
        </div>

        {/* ===== Body ===== */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {step === 1 && (
            <>
              <div className="text-[#6F013F] font-semibold text-sm mb-2">
                بيانات الأب
              </div>

              <InputField
                label="الاسم"
                required
                register={register("father_first_name", {
                  required: "اسم الأب مطلوب",
                  minLength: { value: 2, message: "اسم الأب قصير جدًا" },
                })}
              />

              <InputField
                label="الكنية"
                required
                register={register("father_last_name", {
                  required: "كنية الأب مطلوبة",
                  minLength: { value: 2, message: "كنية الأب قصيرة جدًا" },
                })}
              />

              <InputField
                label="الرقم الوطني"
                placeholder="10 أرقام فقط"
                register={register("father_national_id", {
                  required: "الرقم الوطني للأب مطلوب",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "الرقم الوطني للأب يجب أن يكون 10 أرقام",
                  },
                  onChange: (e) => {
                    e.target.value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                  },
                })}
              />
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-[#6F013F] font-semibold text-sm mb-2">
                بيانات الأم
              </div>

              <InputField
                label="الاسم"
                required
                register={register("mother_first_name", {
                  required: "اسم الأم مطلوب",
                  minLength: { value: 2, message: "اسم الأم قصير جدًا" },
                })}
              />

              <InputField
                label="الكنية"
                required
                register={register("mother_last_name", {
                  required: "كنية الأم مطلوبة",
                  minLength: { value: 2, message: "كنية الأم قصيرة جدًا" },
                })}
              />

              <InputField
                label="الرقم الوطني"
                placeholder="10 أرقام فقط"
                register={register("mother_national_id", {
                  required: "الرقم الوطني للأم مطلوب",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "الرقم الوطني للأم يجب أن يكون 10 أرقام",
                  },
                  onChange: (e) => {
                    e.target.value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                  },
                })}
              />
            </>
          )}
        </div>

        {/* ===== Footer ===== */}
        <div className=" px-6 py-4">
          <StepButtonsSmart
            step={step}
            total={2}
            onBack={step === 1 ? onClose : handleBack}
            onNext={step === 2 ? handleSave : handleNext}
            loading={isLoading}
            nextLabel={step === 2 ? "حفظ" : "التالي"}
          />
        </div>
      </div>
    </div>
  );
}
