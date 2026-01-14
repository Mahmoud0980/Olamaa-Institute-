"use client";

import { useState } from "react";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import GradientButton from "@/components/common/GradientButton";
import AddPaymentModal from "../AddPaymentModal";

export default function Step7Payment({
  studentId,
  instituteBranchId,
  enrollmentContractId,
  onFinish,
  onBack,
}) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-[#6F013F] font-semibold">الدفعة الأولى</h3>

        <p className="text-sm text-gray-600">هل ترغب بإضافة دفعة أولى الآن؟</p>

        {/* ===== action buttons ===== */}
        <div className="flex gap-3">
          <GradientButton
            className="flex-1 justify-center"
            onClick={() => setShowPaymentModal(true)}
          >
            نعم، إضافة دفعة
          </GradientButton>

          <GradientButton
            className="flex-1 justify-center bg-gray-200 text-gray-700 from-gray-200 to-gray-200 hover:brightness-100"
            onClick={onFinish}
          >
            لاحقًا
          </GradientButton>
        </div>

        {/* ===== step navigation ===== */}
        <StepButtonsSmart
          step={7}
          total={7}
          onBack={onBack}
          onNext={onFinish}
        />
      </div>

      {/* ===== payment modal ===== */}
      <AddPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        studentId={studentId}
        instituteBranchId={instituteBranchId}
        enrollmentContractId={enrollmentContractId}
        remainingAmountUsd={remainingAmountUsd}
      />
    </>
  );
}
