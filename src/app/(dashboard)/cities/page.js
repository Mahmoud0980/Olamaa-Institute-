"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { notify } from "@/lib/helpers/toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ===== APIs =====
import {
  useGetCitiesQuery,
  useDeleteCityMutation,
} from "@/store/services/citiesApi";
import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

// ===== Components =====
import CitiesTable from "./components/CitiesTable";
import AddCityModal from "./components/AddCityModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import ActionsRow from "@/components/common/ActionsRow";
import PrintButton from "@/components/common/PrintButton";
import ExcelButton from "@/components/common/ExcelButton";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function CitiesPage() {
  // ===== Redux (بحث + فلترة فرع من Navbar) =====
  const search = useSelector((state) => state.search.values.cities);
  const branchId = useSelector((state) => state.search.values.branch);

  // ===== Data =====
  const { data, isLoading } = useGetCitiesQuery();
  const cities = data?.data || [];

  const [deleteCity, { isLoading: isDeleting }] = useDeleteCityMutation();

  // ===== Branches (للطباعة والاكسل) =====
  const { data: branchesData } = useGetInstituteBranchesQuery();
  const branches = branchesData?.data || [];

  const getBranchName = (id) =>
    branches.find((b) => Number(b.id) === Number(id))?.name || "-";

  const getCityBranchId = (c) =>
    c?.institute_branch_id ??
    c?.branch_id ??
    c?.instituteBranchId ??
    c?.institute_branch?.id ??
    null;

  const getStatusLabel = (c) => (c?.is_active ? "نشط" : "غير نشط");

  // ===== Filtering =====
  const filteredCities = useMemo(() => {
    return cities.filter((c) => {
      const matchSearch = (c?.name || "")
        .toLowerCase()
        .includes((search || "").toLowerCase());

      const cityBranchId = getCityBranchId(c);
      const matchBranch =
        !branchId ||
        cityBranchId == null ||
        Number(branchId) === Number(cityBranchId);

      return matchSearch && matchBranch;
    });
  }, [cities, search, branchId]);

  // ===== Selection =====
  const [selectedIds, setSelectedIds] = useState([]);

  const isAllSelected =
    filteredCities.length > 0 && selectedIds.length === filteredCities.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : filteredCities.map((c) => c.id));
  };

  // تفريغ التحديد عند تغيير البحث أو الفرع
  useEffect(() => {
    setSelectedIds([]);
  }, [search, branchId]);

  // تنظيف التحديد عند تغير البيانات
  useEffect(() => {
    setSelectedIds((prev) => {
      const validIds = prev.filter((id) =>
        filteredCities.some((c) => c.id === id),
      );

      // ✅ إذا ما تغير شي، لا تعمل setState
      if (validIds.length === prev.length) {
        return prev;
      }

      return validIds;
    });
  }, [filteredCities]);

  // ===== Modals =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [cityToDelete, setCityToDelete] = useState(null);

  // ===== Actions =====
  const handleEdit = (id) => {
    setSelectedCity(filteredCities.find((c) => c.id === id) || null);
    setIsModalOpen(true);
  };

  const handleDelete = (city) => {
    setCityToDelete(city);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!cityToDelete) return;

    try {
      await deleteCity(cityToDelete.id).unwrap();
      notify.success("تم حذف المدينة بنجاح");
      setIsDeleteOpen(false);
      setCityToDelete(null);
      setSelectedIds((prev) => prev.filter((id) => id !== cityToDelete.id));
    } catch (err) {
      notify.error(err?.data?.message || "حدث خطأ أثناء الحذف");
    }
  };

  // ===== Print =====
  const handlePrint = () => {
    if (selectedIds.length === 0) {
      notify.error("يرجى تحديد مدينة واحدة على الأقل للطباعة");
      return;
    }

    const rows = filteredCities.filter((c) => selectedIds.includes(c.id));

    if (!rows.length) {
      notify.error("لا توجد بيانات للطباعة");
      return;
    }

    const hasBranchColumn = rows.some((c) => getCityBranchId(c) != null);

    const html = `
      <html dir="rtl">
        <head>
          <style>
            body { font-family: Arial; }
            table { width: 100%; border-collapse: collapse; }
            th, td {
              border: 1px solid #ccc;
              padding: 6px;
              font-size: 12px;
              text-align: right;
            }
            th { background: #f3f3f3; }
          </style>
        </head>
        <body>
          <h3>قائمة المدن</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>اسم المدينة</th>
                ${hasBranchColumn ? "<th>الفرع</th>" : ""}
                <th>الوصف</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${rows
                .map((c, i) => {
                  const branchCell = hasBranchColumn
                    ? `<td>${getBranchName(getCityBranchId(c))}</td>`
                    : "";

                  return `
                    <tr>
                      <td>${i + 1}</td>
                      <td>${c.name ?? "-"}</td>
                      ${branchCell}
                      <td>${c.description ?? "-"}</td>
                      <td>${getStatusLabel(c)}</td>
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const win = window.open("", "", "width=1200,height=800");
    if (!win) {
      notify.error("المتصفح منع نافذة الطباعة");
      return;
    }

    win.document.write(html);
    win.document.close();
    win.print();
  };

  // ===== Excel =====
  const handleExcel = () => {
    if (selectedIds.length === 0) {
      notify.error("يرجى تحديد مدينة واحدة على الأقل للتصدير");
      return;
    }

    const rows = filteredCities.filter((c) => selectedIds.includes(c.id));

    if (!rows.length) {
      notify.error("لا توجد بيانات للتصدير");
      return;
    }

    const hasBranchColumn = rows.some((c) => getCityBranchId(c) != null);

    const excelRows = rows.map((c) => {
      const base = {
        "اسم المدينة": c.name ?? "-",
        الوصف: c.description ?? "-",
        الحالة: getStatusLabel(c),
      };

      if (hasBranchColumn) {
        base["الفرع"] = getBranchName(getCityBranchId(c));
      }

      return base;
    });

    const ws = XLSX.utils.json_to_sheet(excelRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cities");

    const buffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([buffer], {
        type: "application/octet-stream",
      }),
      "قائمة_المدن.xlsx",
    );
  };

  return (
    <div dir="rtl" className="w-full h-full p-6 flex flex-col gap-6">
      {/* HEADER */}
      <div className="w-full flex justify-between items-center">
        <div className="flex flex-col text-right">
          <h1 className="text-lg font-semibold text-gray-700">
            الجداول الرئيسية
          </h1>
          <Breadcrumb />
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-between items-center">
        <ActionsRow
          addLabel="إضافة مدينة"
          viewLabel=""
          showSelectAll
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          onAdd={() => {
            setSelectedCity(null);
            setIsModalOpen(true);
          }}
        />

        <div className="flex gap-2">
          <PrintButton onClick={handlePrint} />
          <ExcelButton onClick={handleExcel} />
        </div>
      </div>

      {/* TABLE */}
      <CitiesTable
        cities={filteredCities}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* MODALS */}
      <AddCityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        city={selectedCity}
        cities={cities}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        loading={isDeleting}
        title="حذف مدينة"
        description={`هل أنت متأكد من حذف المدينة ${cityToDelete?.name || ""}؟`}
        onClose={() => {
          setIsDeleteOpen(false);
          setCityToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
