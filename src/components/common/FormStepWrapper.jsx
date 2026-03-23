"use client";

import Stepper from "./Stepper";
import StepButtonsSmart from "./StepButtonsSmart";

/**
 * FormStepWrapper - A helper component for multi-step forms inside a Drawer/Modal.
 * 
 * @param {number} step - Current step index (1-based).
 * @param {number} total - Total number of steps.
 * @param {boolean} loading - Loading state for the action button.
 * @param {boolean} isEdit - Whether the form is in edit mode.
 * @param {function} onNext - Function to call for Next/Save.
 * @param {function} onBack - Function to call for Back.
 * @param {ReactNode} children - The form fields for the current step.
 * @param {boolean} showStepper - Hide stepper if only 1 step (default: true).
 */
export default function FormStepWrapper({
  step,
  total,
  loading,
  isEdit,
  onNext,
  onBack,
  children,
  showStepper = true,
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Stepper Area */}
      {showStepper && total > 1 && (
        <div className="mb-8 shrink-0">
          <Stepper current={step} total={total} />
        </div>
      )}

      {/* Form Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
        <div className="space-y-6">
          {children}
        </div>
      </div>

      {/* Sticky footer for buttons (will be handled by SideDrawer's footer prop but can be used here too if needed) */}
      {/* However, it's better to pass StepButtonsSmart directly to SideDrawer's footer to ensure it's always at the bottom */}
    </div>
  );
}

/**
 * Convenience component to render the standard SideDrawer footer with StepButtonsSmart.
 */
export function FormStepFooter({ step, total, loading, isEdit, onNext, onBack }) {
  return (
    <StepButtonsSmart
      step={step}
      total={total}
      loading={loading}
      isEdit={isEdit}
      onNext={onNext}
      onBack={onBack}
    />
  );
}
