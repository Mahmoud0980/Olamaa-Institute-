"use client";

import { X, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { notify } from "@/lib/helpers/toastify";

import ChipsList from "@/components/common/ChipsList";
import SearchableSelect from "@/components/common/SearchableSelect";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";

import {
  useAssignEmployeeToBatchMutation,
  useGetEmployeesWithBatchesQuery,
  useRemoveEmployeeAssignmentMutation,
} from "@/store/services/employeesApi";

import { useGetBatchesQuery } from "@/store/services/batchesApi";

export default function AssignBatchModal({ isOpen, onClose, employee }) {
  const [assignToBatch, { isLoading }] = useAssignEmployeeToBatchMutation();
  const [removeAssignment, { isLoading: isRemoving }] =
    useRemoveEmployeeAssignmentMutation();

  const { data: batchesData } = useGetBatchesQuery();
  const batches = batchesData?.data || [];

  const { data: employeesData } = useGetEmployeesWithBatchesQuery();
  const employees = employeesData?.data || [];

  // ⭐ state محلي للتعيينات
  const [assignments, setAssignments] = useState([]);

  const [selectedBatch, setSelectedBatch] = useState("");
  const [error, setError] = useState("");

  // حذف
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);

  /* -------------------------
      عند فتح المودال
  -------------------------- */
  useEffect(() => {
    if (!isOpen || !employee) return;

    const currentAssignments = employee.batch_assignments || [];
    setAssignments(currentAssignments);

    const active = currentAssignments.find((a) => a.is_active);
    setSelectedBatch(active?.batch?.id ? String(active.batch.id) : "");
    setError("");
  }, [isOpen, employee]);

  /* -------------------------
      اختيار دورة (SearchableSelect)
  -------------------------- */
  const handleSelect = (val) => {
    const batchId = Number(val);

    if (!batchId) {
      setSelectedBatch("");
      setError("");
      return;
    }

    // ❌ لا أكثر من دورة نشطة لنفس الموظف
    const hasOtherActive = assignments.some(
      (a) => a.is_active && a.batch?.id !== batchId,
    );

    if (hasOtherActive) {
      setError("لا يمكن للمشرف الإشراف على أكثر من دورة واحدة");
      return;
    }

    // ❌ الدورة مشرف عليها موظف آخر
    const usedByOther = employees.find(
      (emp) =>
        emp.id !== employee.id &&
        emp.batch_assignments?.some(
          (a) => a.is_active && a.batch?.id === batchId,
        ),
    );

    if (usedByOther) {
      setError(
        `هذه الدورة مشرف عليها الموظف: ${usedByOther.first_name} ${usedByOther.last_name}`,
      );
      return;
    }

    setError("");
    setSelectedBatch(String(batchId));
  };

  /* -------------------------
      حفظ تعيين
  -------------------------- */
  const handleSubmit = async () => {
    if (!selectedBatch) {
      setError("يجب اختيار دورة");
      return;
    }

    try {
      await assignToBatch({
        id: employee.id,
        batch_id: Number(selectedBatch),
      }).unwrap();

      notify.success("تم تعيين الدورة بنجاح");
      onClose();
    } catch {
      notify.error("خطأ أثناء التعيين");
    }
  };

  /* -------------------------
      طلب حذف (فتح مودال)
  -------------------------- */
  const requestRemoveAssignment = (item) => {
    setAssignmentToDelete(item);
    setIsDeleteOpen(true);
  };

  /* -------------------------
      تأكيد حذف
  -------------------------- */
  const confirmRemoveAssignment = async () => {
    if (!assignmentToDelete) return;

    try {
      await removeAssignment({
        employeeId: employee.id,
        batchId: assignmentToDelete.batch.id,
      }).unwrap();

      notify.success("تم إزالة الإشراف بنجاح");

      // ✅ تحديث ChipsList فورًا
      setAssignments((prev) =>
        prev.filter((a) => a.batch.id !== assignmentToDelete.batch.id),
      );

      // ✅ إذا انحذفت الدورة المختارة (أو كانت النشطة)، صفّر السلكت
      if (String(assignmentToDelete.batch.id) === String(selectedBatch)) {
        setSelectedBatch("");
      }

      setIsDeleteOpen(false);
      setAssignmentToDelete(null);
      setError("");
    } catch {
      notify.error("فشل في إزالة الإشراف");
    }
  };

  if (!isOpen || !employee) return null;

  const hasActiveAssignment = assignments.some((a) => a.is_active);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 flex justify-start">
        <div className="w-full sm:w-[430px] bg-white h-full p-6 shadow-xl overflow-y-auto">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#6F013F]">
              تعيين دورة للموظف
            </h2>
            <button onClick={onClose}>
              <X className="text-gray-600 hover:text-gray-800" />
            </button>
          </div>

          {/* تحذير */}
          {hasActiveAssignment && (
            <div className="flex gap-3 items-start p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              <AlertTriangle className="w-5 h-5 mt-0.5" />
              <p>لا يمكن حذف الموظف قبل إزالة إشرافه عن الدورات.</p>
            </div>
          )}

          {/* ✅ SEARCHABLE SELECT */}
          <div className="space-y-1">
            <SearchableSelect
              label="الدورة"
              required
              value={selectedBatch}
              onChange={handleSelect}
              placeholder="اختر الدورة..."
              options={batches.map((b, idx) => ({
                key: b.id ?? `${b.name}-${idx}`,
                value: b.id,
                label: b.name,
              }))}
              allowClear
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          {/* CHIPS */}
          <ChipsList
            items={assignments}
            getLabel={(item) => item.batch?.name}
            canRemove={() => true}
            onRemove={requestRemoveAssignment}
            className="mt-4"
          />

          {/* ACTIONS */}
          <div className="mt-6 flex justify-end">
            <div className="scale-90">
              <StepButtonsSmart
                step={1}
                total={1}
                isEdit
                loading={isLoading}
                onNext={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRM DELETE MODAL */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        loading={isRemoving}
        title="إزالة إشراف"
        description={`هل أنت متأكد من إزالة إشراف الموظف عن دورة "${assignmentToDelete?.batch?.name}"؟`}
        onClose={() => {
          setIsDeleteOpen(false);
          setAssignmentToDelete(null);
        }}
        onConfirm={confirmRemoveAssignment}
      />
    </>
  );
}
