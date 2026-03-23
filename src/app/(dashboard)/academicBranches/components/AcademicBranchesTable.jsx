"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";
import DataTable from "@/components/common/DataTable";

export default function AcademicBranchesTable({
  branches = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onEdit,
  onDelete,
}) {
  const { data: instData } = useGetInstituteBranchesQuery();
  const instituteBranches = instData?.data || [];

  const getInstituteBranchName = (id) =>
    instituteBranches.find((b) => Number(b.id) === Number(id))?.name || "—";

  const hasInstituteBranchId = useMemo(() => {
    return Array.isArray(branches) && branches.some(
      (b) => b?.institute_branch_id != null || b?.branch_id != null,
    );
  }, [branches]);

  const columns = useMemo(() => {
    const cols = [
      { header: "اسم الفرع الأكاديمي", key: "name" },
    ];

    if (hasInstituteBranchId) {
      cols.push({
        header: "الفرع",
        key: "institute_branch_id",
        render: (val, row) => getInstituteBranchName(val ?? row?.branch_id),
      });
    }

    cols.push({ header: "الوصف", key: "description" });

    return cols;
  }, [hasInstituteBranchId, instituteBranches]);

  const renderActions = (row) => (
    <div className="flex items-center justify-center gap-4">
      <button onClick={() => onEdit?.(row.id)}>
        <Image src="/icons/Edit.png" width={18} height={18} alt="edit" />
      </button>

      <button onClick={() => onDelete?.(row)}>
        <Image src="/icons/Trash.png" width={18} height={18} alt="trash" />
      </button>
    </div>
  );

  return (
    <DataTable
      data={branches}
      columns={columns}
      isLoading={isLoading}
      selectedIds={selectedIds}
      onSelectChange={onSelectChange}
      renderActions={renderActions}
      pageSize={6}
    />
  );
}
