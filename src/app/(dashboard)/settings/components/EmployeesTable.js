"use client";

import { useMemo, useState, useEffect } from "react";
import DataTable from "@/components/common/DataTable";
import { ChevronDown } from "lucide-react";

export default function EmployeesTable({
  employees = [],
  isLoading = false,
  selectedIds = [],
  onSelectChange,
  onToggleAccount,
  onViewCredentials,
}) {
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const columns = useMemo(
    () => [
      {
        header: "الاسم",
        key: "name",
        render: (val, row) => (
          <div className="flex items-center gap-3">
            <img
              src={row.avatar}
              alt={val}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex flex-col text-right">
              <span className="font-medium text-gray-700">{val}</span>
              <span className="text-xs text-gray-400">{row.email}</span>
            </div>
          </div>
        ),
      },
      {
        header: "الدور",
        key: "roleLabel",
        render: (val, row) => (
          <span className={`px-3 py-1 text-xs rounded-xl ${row.roleClass}`}>
            {val}
          </span>
        ),
      },
      {
        header: "حالة الحساب",
        key: "isActive",
        render: (val, row) =>
          row.accountType === "toggle" ? (
            <AccountSwitch
              checked={val}
              onChange={() => onToggleAccount?.(row.id)}
            />
          ) : (
            <button
              type="button"
              className="text-2xl text-gray-600 font-light"
            >
              +
            </button>
          ),
      },
      {
        header: "كلمة السر",
        key: "id",
        render: (_, row) => (
          <button
            type="button"
            onClick={() => onViewCredentials?.(row)}
            className="flex items-center gap-3 text-gray-700 hover:opacity-70"
          >
            <span className="tracking-[0.3em]">*******</span>
            <EyeSlashIcon />
          </button>
        ),
      },
    ],
    [onToggleAccount, onViewCredentials],
  );

  const renderActions = (employee) => (
    <div
      className="relative inline-block text-right"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpenDropdownId((prev) => (prev === employee.id ? null : employee.id));
        }}
        className="inline-flex items-center gap-2 rounded-lg bg-[#F4E8FA] px-4 py-2 text-xs font-medium text-[#6F013F] hover:opacity-90"
      >
        Edit Role
        <ChevronDown size={14} />
      </button>

      {/* Dropdown */}
      {openDropdownId === employee.id && (
        <div className="absolute left-0 mt-2 w-[160px] bg-[#F4E8FA] rounded-xl shadow-lg border border-[#EADCF3] overflow-hidden z-50">
          {["محاسب", "مشرف", "إداري", "مدخل بيانات"].map((role) => (
            <button
              key={role}
              onClick={() => {
                console.log("selected role:", role);
                setOpenDropdownId(null);
              }}
              className="w-full text-right px-4 py-2 text-sm text-[#6F013F] hover:bg-[#EADCF3] transition"
            >
              {role}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <DataTable
      data={employees}
      columns={columns}
      isLoading={isLoading}
      selectedIds={selectedIds}
      onSelectChange={onSelectChange}
      renderActions={renderActions}
      pageSize={6}
      emptyMessage="لا توجد بيانات."
    />
  );
}

function AccountSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition ${
        checked ? "bg-[#6F013F]" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
          checked ? "right-1" : "left-1"
        }`}
      />
    </button>
  );
}

function EyeSlashIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.58 10.58a2 2 0 1 0 2.83 2.83" />
      <path d="M9.88 5.09A10.94 10.94 0 0 1 12 4.91c5 0 9.27 3.11 11 7.5a10.49 10.49 0 0 1-4.05 5.07" />
      <path d="M6.61 6.61A10.98 10.98 0 0 0 1 12.41c1.73 4.39 6 7.5 11 7.5 1.75 0 3.41-.38 4.9-1.05" />
      <path d="M3 3l18 18" />
    </svg>
  );
}

