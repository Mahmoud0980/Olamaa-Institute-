"use client";

import { useEffect, useMemo, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import EmployeesTable from "./components/EmployeesTable.js";
import CredentialsModal from "./components/CredentialsModal";

const tabs = [
  { key: "all", label: "الكل" },
  { key: "admin", label: "الإدارة" },
  { key: "accountant", label: "المحاسبون" },
  { key: "supervisor", label: "المشرفون" },
];

const mockEmployees = [
  {
    id: 1,
    name: "راما الأحمد",
    email: "rama55@gmail.com",
    username: "ramaqiduj",
    password: "98836678-09",
    avatar: "https://i.pravatar.cc/100?img=12",
    section: "supervisor",
    roleLabel: "مشرف",
    roleClass: "bg-[#FFF1DE] text-[#F49A1A]",
    accountType: "toggle",
    isActive: true,
  },
  {
    id: 2,
    name: "راما الأحمد",
    email: "rama55@gmail.com",
    username: "ramaadmin",
    password: "98836678-10",
    avatar: "https://i.pravatar.cc/100?img=32",
    section: "admin",
    roleLabel: "إداري",
    roleClass: "bg-green-100 text-green-700",
    accountType: "toggle",
    isActive: true,
  },
  {
    id: 3,
    name: "راما الأحمد",
    email: "rama55@gmail.com",
    username: "ramaacc01",
    password: "98836678-11",
    avatar: "https://i.pravatar.cc/100?img=47",
    section: "accountant",
    roleLabel: "محاسب",
    roleClass: "bg-orange-100 text-orange-700",
    accountType: "create",
    isActive: false,
  },
  {
    id: 4,
    name: "راما الأحمد",
    email: "rama55@gmail.com",
    username: "ramaacc02",
    password: "98836678-12",
    avatar: "https://i.pravatar.cc/100?img=24",
    section: "accountant",
    roleLabel: "محاسب",
    roleClass: "bg-orange-100 text-orange-700",
    accountType: "toggle",
    isActive: true,
  },
  {
    id: 5,
    name: "راما الأحمد",
    email: "rama55@gmail.com",
    username: "ramaacc03",
    password: "98836678-13",
    avatar: "https://i.pravatar.cc/100?img=19",
    section: "accountant",
    roleLabel: "محاسب",
    roleClass: "bg-orange-100 text-orange-700",
    accountType: "create",
    isActive: false,
  },
  {
    id: 6,
    name: "راما الأحمد",
    email: "rama55@gmail.com",
    username: "ramaacc04",
    password: "98836678-14",
    avatar: "https://i.pravatar.cc/100?img=60",
    section: "accountant",
    roleLabel: "محاسب",
    roleClass: "bg-orange-100 text-orange-700",
    accountType: "toggle",
    isActive: true,
  },
  {
    id: 7,
    name: "راما الأحمد",
    email: "rama55@gmail.com",
    username: "ramasup02",
    password: "98836678-15",
    avatar: "https://i.pravatar.cc/100?img=41",
    section: "supervisor",
    roleLabel: "مشرف",
    roleClass: "bg-[#FFF1DE] text-[#F49A1A]",
    accountType: "toggle",
    isActive: true,
  },
];

export default function SettingsPage() {
  const [systemStopped, setSystemStopped] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [employees, setEmployees] = useState(mockEmployees);
  const [credentialsEmployee, setCredentialsEmployee] = useState(null);

  const filteredEmployees = useMemo(() => {
    if (activeTab === "all") return employees;
    return employees.filter((employee) => employee.section === activeTab);
  }, [employees, activeTab]);

  useEffect(() => {
    setSelectedIds([]);
  }, [activeTab]);

  const handleToggleAccount = (id) => {
    setEmployees((prev) =>
      prev.map((employee) =>
        employee.id === id
          ? { ...employee, isActive: !employee.isActive }
          : employee,
      ),
    );
  };

  return (
    <div dir="rtl" className="w-full h-full p-6 flex flex-col gap-6">
      {/* HEADER */}
      <div className="w-full flex flex-col gap-5 items-start">
        <div className="flex flex-col text-right">
          <Breadcrumb />
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-500">
            ايقاف النظام بشكل كامل
          </span>

          <button
            type="button"
            onClick={() => setSystemStopped((prev) => !prev)}
            className={`relative w-14 h-7 rounded-full transition ${
              systemStopped ? "bg-[#6F013F]" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
                systemStopped ? "right-1" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* TABS + TABLE */}
      <div className="w-full">
        <ul className="flex flex-wrap w-full text-sm font-medium text-center mr-10 ">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <li key={tab.key} className="me-2">
                <button
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-block px-12 py-4 rounded-t-xl transition ${
                    isActive
                      ? " bg-white text-black border-x border-t border-gray-200"
                      : "text-[#6F013F] bg-pink-50 mx-2"
                  }`}
                >
                  {tab.label}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="-mt-[1px]">
          <EmployeesTable
            employees={filteredEmployees}
            isLoading={false}
            selectedIds={selectedIds}
            onSelectChange={setSelectedIds}
            onToggleAccount={handleToggleAccount}
            onViewCredentials={setCredentialsEmployee}
          />
        </div>
      </div>

      <CredentialsModal
        employee={credentialsEmployee}
        onClose={() => setCredentialsEmployee(null)}
      />
    </div>
  );
}
