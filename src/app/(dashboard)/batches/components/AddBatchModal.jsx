"use client";

import { useEffect, useState, useMemo } from "react";
import { X } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import SearchableSelect from "@/components/common/SearchableSelect";
import BulkStudentAssignStep from "./BulkStudentAssignStep";

// ===== APIs =====
import {
  useAddBatchMutation,
  useUpdateBatchMutation,
} from "@/store/services/batchesApi";

import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";
import { useGetAcademicBranchesQuery } from "@/store/services/academicBranchesApi";
import { useGetClassRoomsQuery } from "@/store/services/classRoomsApi";
import DatePickerSmart from "@/components/common/DatePickerSmart";

export default function AddBatchModal({ isOpen, onClose, batch }) {
  const [addBatch] = useAddBatchMutation();
  const [updateBatch] = useUpdateBatchMutation();

  const { data: branchesData } = useGetInstituteBranchesQuery();
  const branches = branchesData?.data || [];

  const { data: academicData } = useGetAcademicBranchesQuery();
  const academicBranches = academicData?.data || [];

  const { data: roomsData } = useGetClassRoomsQuery();
  const classRooms = roomsData?.data || [];

  const [loading, setLoading] = useState(false);

  // ===== مودال إضافة = خطوتين / تعديل = خطوة واحدة =====
  const isEdit = !!batch;
  const total = isEdit ? 1 : 2;
  const [step, setStep] = useState(1);
  const [newBatchId, setNewBatchId] = useState(null);
  const [newBatchName, setNewBatchName] = useState("");

  // ===== Form =====
  const initialForm = {
    name: "",
    institute_branch_id: "",
    academic_branch_id: "",
    class_room_id: "",
    gender_type: "",
    start_date: "",
    end_date: "",
    is_archived: "false",
    is_hidden: "false",
    is_completed: "false",
  };

  const [form, setForm] = useState(initialForm);

  // ===== options (memo) =====
  const branchOptions = useMemo(
    () =>
      branches.map((b, idx) => ({
        value: b.id,
        label: b.name,
        key: b.id ?? `branch-${idx}`,
      })),
    [branches],
  );

  const academicOptions = useMemo(
    () =>
      academicBranches.map((a, idx) => ({
        value: a.id,
        label: a.name,
        key: a.id ?? `academic-${idx}`,
      })),
    [academicBranches],
  );

  const roomOptions = useMemo(
    () =>
      classRooms.map((r, idx) => ({
        value: r.id,
        label: r.name,
        key: r.id ?? `room-${idx}`,
      })),
    [classRooms],
  );

  const genderOptions = useMemo(
    () => [
      { value: "male", label: "ذكور", key: "male" },
      { value: "female", label: "إناث", key: "female" },
    ],
    [],
  );

  const yesNoOptions = useMemo(
    () => [
      { value: "false", label: "لا", key: "no" },
      { value: "true", label: "نعم", key: "yes" },
    ],
    [],
  );

  // ===== Fill form on edit / reset on open =====
  useEffect(() => {
    if (!isOpen) return;

    // Reset step on open
    setStep(1);
    setNewBatchId(null);
    setNewBatchName("");

    if (batch) {
      setForm({
        name: batch.name ?? "",
        institute_branch_id: batch.institute_branch?.id?.toString() ?? "",
        academic_branch_id: batch.academic_branch?.id?.toString() ?? "",
        class_room_id: batch.class_room?.id?.toString() ?? "",
        gender_type: batch.gender_type ?? "",
        start_date: batch.start_date ?? "",
        end_date: batch.end_date ?? "",
        is_archived: batch.is_archived ? "true" : "false",
        is_hidden: batch.is_hidden ? "true" : "false",
        is_completed: batch.is_completed ? "true" : "false",
      });
    } else {
      setForm(initialForm);
    }
  }, [isOpen, batch]);

  // ===== Submit Step 1 =====
  const handleSubmitStep1 = async () => {
    // تحقق منطقي للتواريخ
    if (form.start_date && form.end_date) {
      const start = new Date(form.start_date);
      const end = new Date(form.end_date);
      if (end <= start)
        return notify.error("تاريخ النهاية يجب أن يكون بعد تاريخ البداية");
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        institute_branch_id: form.institute_branch_id
          ? Number(form.institute_branch_id)
          : null,
        academic_branch_id: form.academic_branch_id
          ? Number(form.academic_branch_id)
          : null,
        class_room_id: form.class_room_id ? Number(form.class_room_id) : null,
        gender_type: form.gender_type || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        is_archived: form.is_archived === "true",
        is_hidden: form.is_hidden === "true",
        is_completed: form.is_completed === "true",
      };

      // تنظيف: احذف القيم null
      Object.keys(payload).forEach(
        (k) => payload[k] == null && delete payload[k],
      );

      if (isEdit) {
        await updateBatch({ id: batch.id, ...payload }).unwrap();
        notify.success("تم تعديل الشعبة بنجاح");
        onClose?.();
      } else {
        // إضافة — حفظ الشعبة ثم الانتقال للخطوة 2
        const result = await addBatch(payload).unwrap();
        console.log("addBatch result:", JSON.stringify(result, null, 2));

        // الـ API يرجع: { status: true, data: { batch: { id, name, ... } } }
        const createdBatch = result?.data?.batch || result?.data;
        const batchId = createdBatch?.id;
        notify.success("تم إضافة الشعبة بنجاح");

        console.log(
          "Created batch ID:",
          batchId,
          "Name:",
          createdBatch?.name || form.name,
        );

        if (batchId) {
          setNewBatchId(batchId);
          setNewBatchName(createdBatch?.name || form.name);
          setStep(2);
        } else {
          // إذا لم نحصل على ID — نغلق المودال
          console.warn("Could not extract batch ID from response");
          onClose?.();
        }
      }
    } catch (err) {
      const errors = err?.data?.errors;
      if (errors) {
        const firstKey = Object.keys(errors)[0];
        const firstMsg = errors?.[firstKey]?.[0];
        if (firstMsg) return notify.error(firstMsg);
      }
      notify.error(err?.data?.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  // ===== Close handler =====
  const handleClose = () => {
    setStep(1);
    setNewBatchId(null);
    setNewBatchName("");
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-start">
      {/* Panel */}
      <div className="w-full sm:w-[500px] bg-white h-full shadow-xl flex flex-col">
        {/* ===== Header ثابت ===== */}
        <div className="sticky top-0 z-20 bg-white px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[#6F013F] font-semibold">
              {isEdit
                ? "تعديل شعبة"
                : step === 1
                  ? "إضافة شعبة جديدة"
                  : "إضافة طالب إلى دورة"}
            </h2>

            <button onClick={handleClose} type="button">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="mt-3">
            <Stepper current={step} total={total} />
          </div>
        </div>

        {/* ===== Body ===== */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 1 ? (
            /* ======= الخطوة 1: بيانات الدورة ======= */
            <div className="space-y-5">
              <FormInput
                label="اسم الشعبة"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <SearchableSelect
                label="الفرع"
                value={form.institute_branch_id}
                onChange={(val) =>
                  setForm({
                    ...form,
                    institute_branch_id: val,
                    class_room_id: "", // reset room
                  })
                }
                options={branchOptions}
                placeholder="اختر الفرع..."
                allowClear
              />

              <SearchableSelect
                label="الفرع الأكاديمي"
                value={form.academic_branch_id}
                onChange={(val) =>
                  setForm({ ...form, academic_branch_id: val })
                }
                options={academicOptions}
                placeholder="اختر الفرع الأكاديمي..."
                allowClear
              />

              <SearchableSelect
                label="القاعة"
                value={form.class_room_id}
                onChange={(val) => setForm({ ...form, class_room_id: val })}
                options={roomOptions}
                placeholder="اختر القاعة..."
                allowClear
              />

              <SearchableSelect
                label="الجنس"
                value={form.gender_type}
                onChange={(val) => setForm({ ...form, gender_type: val })}
                options={genderOptions}
                placeholder="اختر الجنس..."
                allowClear
              />

              <DatePickerSmart
                label="تاريخ البداية"
                value={form.start_date}
                onChange={(iso) => setForm({ ...form, start_date: iso })}
              />

              <DatePickerSmart
                label="تاريخ النهاية"
                value={form.end_date}
                onChange={(iso) => setForm({ ...form, end_date: iso })}
              />

              <SearchableSelect
                label="مؤرشفة؟"
                value={form.is_archived}
                onChange={(val) => setForm({ ...form, is_archived: val })}
                options={yesNoOptions}
                placeholder="اختر..."
                allowClear={false}
              />

              <SearchableSelect
                label="مخفية؟"
                value={form.is_hidden}
                onChange={(val) => setForm({ ...form, is_hidden: val })}
                options={yesNoOptions}
                placeholder="اختر..."
                allowClear={false}
              />

              <SearchableSelect
                label="مكتملة؟"
                value={form.is_completed}
                onChange={(val) => setForm({ ...form, is_completed: val })}
                options={yesNoOptions}
                placeholder="اختر..."
                allowClear={false}
              />
            </div>
          ) : (
            /* ======= الخطوة 2: إضافة طلاب جماعياً ======= */
            <BulkStudentAssignStep
              batchId={newBatchId}
              batchName={newBatchName}
              onDone={handleClose}
            />
          )}
        </div>

        {/* ===== Footer ثابت (الأزرار) — فقط في الخطوة 1 ===== */}
        {step === 1 && (
          <div className="sticky bottom-0 z-20 bg-white px-6 py-4">
            <StepButtonsSmart
              step={step}
              total={total}
              isEdit={isEdit}
              loading={loading}
              onNext={handleSubmitStep1}
            />
          </div>
        )}
      </div>
    </div>
  );
}
