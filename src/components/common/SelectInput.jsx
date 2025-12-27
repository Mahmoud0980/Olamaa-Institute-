"use client";

export default function SelectInput({
  label,
  required,
  value,
  onChange,
  options = [],
  placeholder = "اختر...",
  error,
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-700 font-medium">
        {label}
        {required && <span className="text-pink-600">*</span>}
      </label>

      <select
        value={value}
        onChange={onChange}
        className={`
    w-full border border-gray-200 rounded-xl shadow-sm
    py-2.5 px-3 pl-10
    text-sm text-gray-700 outline-none transition
    focus:border-[#D40078] focus:ring-1 focus:ring-[#F3C3D9]
    bg-[position:0.75rem_center]
    ${error ? "border-red-400" : ""}
  `}
      >
        {/* Placeholder */}
        <option value="" disabled>
          {placeholder}
        </option>

        {/* Render dynamic options */}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
