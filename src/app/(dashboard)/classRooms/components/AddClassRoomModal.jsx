"use client";

import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";

import {
  useAddClassRoomMutation,
  useUpdateClassRoomMutation,
} from "@/store/services/classRoomsApi";

import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";

// ✅ توليد الكود التالي بناءً على أكبر رقم موجود
function getNextRoomCode(rooms = []) {
  let max = 0;

  for (const r of rooms) {
    const code = String(r?.code || "");
    const matches = code.match(/\d+/g);
    const num = matches?.length ? Number(matches[matches.length - 1]) : 0;
    if (!Number.isNaN(num)) max = Math.max(max, num);
  }

  return `CR-${max + 1}`;
}

export default function AddClassRoomModal({
  isOpen,
  onClose,
  item,
  rooms = [],
}) {
  const [addRoom] = useAddClassRoomMutation();
  const [updateRoom] = useUpdateClassRoomMutation();

  const nextAutoCode = useMemo(() => getNextRoomCode(rooms), [rooms]);

  const [form, setForm] = useState({
    name: "",
    code: "",
    capacity: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  // ✅ أخطاء لحظية
  const [capacityError, setCapacityError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    // تنظيف أي notify قديم متعلق بالسعة

    if (item) {
      setForm({
        name: item.name || "",
        code: item.code || "",
        capacity: item.capacity ?? "",
        notes: item.notes || "",
      });
      setCapacityError("");
    } else {
      setForm({
        name: "",
        code: nextAutoCode,
        capacity: "",
        notes: "",
      });
      setCapacityError("");
    }
  }, [isOpen, item, nextAutoCode]);

  // إذا كانت القاعات تأخرت بالتحميل وفتحنا المودال، حدّث الكود تلقائيًا
  useEffect(() => {
    if (!isOpen) return;
    if (item) return;

    setForm((prev) => ({
      ...prev,
      code: nextAutoCode,
    }));
  }, [isOpen, item, nextAutoCode]);

  // ✅ فحص السعة أثناء الإدخال
  const handleCapacityChange = (e) => {
    const v = e.target.value;

    setForm((prev) => ({ ...prev, capacity: v }));

    // السماح بالفراغ أثناء الكتابة
    if (v === "") {
      setCapacityError("");
      notify.dismiss("capacity");
      return;
    }

    const num = Number(v);

    if (Number.isNaN(num)) {
      setCapacityError("السعة يجب أن تكون رقم");
      notify.error("السعة يجب أن تكون رقم", { id: "capacity" });
      return;
    }

    if (num <= 0) {
      setCapacityError("السعة يجب أن تكون أكبر من 0");
      notify.error("السعة يجب أن تكون أكبر من 0", { id: "capacity" });
      return;
    }

    if (num > 40) {
      setCapacityError("السعة لا يمكن أن تكون أكثر من 40");
      notify.error("السعة لا يمكن أن تكون أكثر من 40", { id: "capacity" });
      return;
    }

    // ✅ صالح
    setCapacityError("");
    notify.dismiss("capacity");
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return notify.error("اسم القاعة مطلوب");
    if (form.capacity === "" || form.capacity === null)
      return notify.error("السعة مطلوبة");

    const capNum = Number(form.capacity);

    if (Number.isNaN(capNum) || capNum <= 0)
      return notify.error("السعة يجب أن تكون رقم صحيح أكبر من 0");

    if (capNum > 40) return notify.error("السعة لا يمكن أن تكون أكثر من 40");

    // ✅ منع الحفظ إذا كان في خطأ لحظي
    if (capacityError) return notify.error(capacityError);

    try {
      setLoading(true);

      const payload = {
        name: form.name.trim(),
        code: item ? form.code : nextAutoCode,
        capacity: capNum,
        notes: form.notes || "",
      };

      if (item) {
        await updateRoom({ id: item.id, ...payload }).unwrap();
        notify.success("تم تعديل القاعة بنجاح");
      } else {
        await addRoom(payload).unwrap();
        notify.success("تمت إضافة القاعة بنجاح");
      }

      onClose();
    } catch {
      notify.error("حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-start">
      <div className="w-full sm:w-[400px] bg-white h-full shadow-xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#6F013F] font-semibold">
            {item ? "تعديل قاعة" : "إضافة قاعة جديدة"}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-5">
          <FormInput
            label="اسم القاعة"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          {/* ✅ الكود ممنوع إدخاله */}
          <FormInput label="الكود" value={form.code} readOnly disabled />

          <div>
            <FormInput
              type="number"
              label="السعة"
              required
              value={form.capacity}
              onChange={handleCapacityChange}
              min={1}
              max={40}
              step={1}
            />

            {/* ✅ رسالة تحت الحقل */}
            {capacityError && (
              <p className="mt-1 text-sm text-red-600">{capacityError}</p>
            )}
          </div>

          <FormInput
            label="ملاحظات"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <StepButtonsSmart
            step={1}
            total={1}
            isEdit={!!item}
            loading={loading}
            onNext={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
