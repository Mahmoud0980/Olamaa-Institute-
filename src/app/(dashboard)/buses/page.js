"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { notify } from "@/lib/helpers/toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// APIs
import {
  useGetBusesQuery,
  useDeleteBusMutation,
} from "@/store/services/busesApi";
import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

// Components
import BusesTable from "./components/BusesTable";
import AddBusModal from "./components/AddBusModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import ActionsRow from "@/components/common/ActionsRow";
import PrintButton from "@/components/common/PrintButton";
import ExcelButton from "@/components/common/ExcelButton";
import Breadcrumb from "@/components/common/Breadcrumb";
// import Breadcrumb from "@/components/common/Breadcrumb"; // إذا موجود عندك

export default function BusesPage() {
  // ===== Redux (بحث + فلترة فرع من Navbar) =====
  const search = useSelector((state) => state.search.values.buses);
  const branchId = useSelector((state) => state.search.values.branch);

  // ===== Data =====
  const { data, isLoading } = useGetBusesQuery();
  const buses = data?.data || [];

  const [deleteBus, { isLoading: isDeleting }] = useDeleteBusMutation();

  // (اختياري) لجلب اسم الفرع عند الطباعة/الاكسل إذا الباصات فيها branch id
  const { data: branchesData } = useGetInstituteBranchesQuery();
  const branches = branchesData?.data || [];
  const getBranchName = (id) =>
    branches.find((b) => Number(b.id) === Number(id))?.name || "-";

  const getBusBranchId = (bus) =>
    bus?.institute_branch_id ??
    bus?.branch_id ??
    bus?.instituteBranchId ??
    bus?.branchId ??
    null;

  // ===== Filtering =====
  const filteredBuses = useMemo(() => {
    return buses.filter((b) => {
      const matchSearch = (b?.name || "")
        .toLowerCase()
        .includes((search || "").toLowerCase());

      // ✅ إذا الصفحة/الداتا ما فيها فرع: منخليها تمر وما نخرب الفلترة
      const busBranchId = getBusBranchId(b);
      const matchBranch =
        !branchId ||
        busBranchId == null ||
        Number(branchId) === Number(busBranchId);

      return matchSearch && matchBranch;
    });
  }, [buses, search, branchId]);

  // ===== Selection =====
  const [selectedIds, setSelectedIds] = useState([]);

  const isAllSelected =
    filteredBuses.length > 0 && selectedIds.length === filteredBuses.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : filteredBuses.map((b) => b.id));
  };

  // تفريغ التحديد عند تغيير البحث أو الفرع (مثل صفحة الشعب)
  useEffect(() => {
    setSelectedIds([]);
  }, [search, branchId]);

  // تنظيف التحديد إذا انحذف عنصر أو تغيرت الداتا
  useEffect(() => {
    setSelectedIds((prev) => {
      const validIds = prev.filter((id) =>
        filteredBuses.some((b) => b.id === id),
      );

      // ✅ إذا ما تغير شي، لا نعمل setState
      if (validIds.length === prev.length) {
        return prev;
      }

      return validIds;
    });
  }, [filteredBuses]);

  // ===== Modals =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [busToDelete, setBusToDelete] = useState(null);

  // ===== Actions =====
  const handleEdit = (id) => {
    setSelectedBus(filteredBuses.find((b) => b.id === id) || null);
    setIsModalOpen(true);
  };

  const handleDelete = (bus) => {
    setBusToDelete(bus);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!busToDelete) return;

    try {
      await deleteBus(busToDelete.id).unwrap();
      notify.success("تم حذف الباص بنجاح");
      setIsDeleteOpen(false);
      setBusToDelete(null);
      setSelectedIds((prev) => prev.filter((id) => id !== busToDelete.id));
    } catch (err) {
      notify.error(err?.data?.message || "حدث خطأ أثناء الحذف");
    }
  };

  // ===== Print (ممنوع بدون تحديد) =====
  const handlePrint = () => {
    if (selectedIds.length === 0) {
      notify.error("يرجى تحديد باص واحد على الأقل للطباعة");
      return;
    }

    const rows = filteredBuses.filter((b) => selectedIds.includes(b.id));

    if (!rows.length) {
      notify.error("لا توجد بيانات للطباعة");
      return;
    }

    const hasBranchColumn = rows.some((b) => getBusBranchId(b) != null);

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
          <h3>قائمة الباصات</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>اسم الباص</th>
                <th>السعة</th>
                <th>اسم السائق</th>
                <th>وصف الطريق</th>
                ${hasBranchColumn ? "<th>الفرع</th>" : ""}
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${rows
                .map((b, i) => {
                  const branchCell = hasBranchColumn
                    ? `<td>${getBranchName(getBusBranchId(b))}</td>`
                    : "";

                  return `
                    <tr>
                      <td>${i + 1}</td>
                      <td>${b.name ?? "-"}</td>
                      <td>${b.capacity ?? "-"}</td>
                      <td>${b.driver_name ?? "-"}</td>
                      <td>${b.route_description ?? "-"}</td>
                      ${branchCell}
                      <td>${b.is_active ? "نشط" : "غير نشط"}</td>
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

  // ===== Excel (ممنوع بدون تحديد) =====
  const handleExcel = () => {
    if (selectedIds.length === 0) {
      notify.error("يرجى تحديد باص واحد على الأقل للتصدير");
      return;
    }

    const rows = filteredBuses.filter((b) => selectedIds.includes(b.id));

    if (!rows.length) {
      notify.error("لا توجد بيانات للتصدير");
      return;
    }

    const hasBranchColumn = rows.some((b) => getBusBranchId(b) != null);

    const excelRows = rows.map((b) => {
      const base = {
        "اسم الباص": b.name ?? "-",
        السعة: b.capacity ?? "-",
        "اسم السائق": b.driver_name ?? "-",
        "وصف الطريق": b.route_description ?? "-",
        الحالة: b.is_active ? "نشط" : "غير نشط",
      };

      if (hasBranchColumn) {
        base["الفرع"] = getBranchName(getBusBranchId(b));
      }

      return base;
    });

    const ws = XLSX.utils.json_to_sheet(excelRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Buses");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      "قائمة_الباصات.xlsx",
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
          addLabel="إضافة باص"
          viewLabel="" // ✅ ما عاد في زر عرض
          showSelectAll // ✅ زر تحديد الكل ظاهر
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          onAdd={() => {
            setSelectedBus(null);
            setIsModalOpen(true);
          }}
        />

        <div className="flex gap-2">
          <PrintButton onClick={handlePrint} />
          <ExcelButton onClick={handleExcel} />
        </div>
      </div>

      {/* TABLE (تظهر فوراً) */}
      <BusesTable
        buses={filteredBuses}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* MODALS */}
      <AddBusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bus={selectedBus}
        buses={buses}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        loading={isDeleting}
        title="حذف باص"
        description={`هل أنت متأكد من حذف الباص ${busToDelete?.name || ""}؟`}
        onClose={() => {
          setIsDeleteOpen(false);
          setBusToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
