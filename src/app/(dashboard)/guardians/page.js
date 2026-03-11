"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
    useGetGuardiansQuery,
    useDeleteGuardianMutation,
    useGetTotalGuardiansQuery,
} from "@/store/services/guardiansApi";

import GuardiansTable from "./components/GuardiansTable";
import AddGuardianModal from "./components/AddGuardianModal";
import GuardianDetailsModal from "./components/GuardianDetailsModal";

import ActionsRow from "@/components/common/ActionsRow";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function GuardiansPage() {
    const { data, isLoading } = useGetGuardiansQuery();
    const guardians = data?.data || [];

    const { data: totalData } = useGetTotalGuardiansQuery();
    const totalCount = totalData?.data?.total ?? 0;

    const [deleteGuardian, { isLoading: isDeleting }] = useDeleteGuardianMutation();
    const search = useSelector((state) => state.search?.values?.guardians || "");

    const filteredGuardians = useMemo(() => {
        const q = (search || "").toLowerCase().trim();
        if (!q) return guardians;

        return guardians.filter((g) => {
            const fullName = `${g.first_name ?? ""} ${g.last_name ?? ""}`.toLowerCase();
            const phone = (g.phone ?? "").toLowerCase();
            const nationalId = (g.national_id ?? "").toLowerCase();

            return (
                fullName.includes(q) ||
                phone.includes(q) ||
                nationalId.includes(q)
            );
        });
    }, [guardians, search]);

    const [selectedIds, setSelectedIds] = useState([]);
    const isAllSelected =
        selectedIds.length > 0 && selectedIds.length === filteredGuardians.length;

    const toggleSelectAll = () => {
        setSelectedIds(isAllSelected ? [] : filteredGuardians.map((r) => r.id));
    };

    useEffect(() => {
        setSelectedIds([]);
    }, [search]);

    // Modals
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedGuardian, setSelectedGuardian] = useState(null);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [guardianToDelete, setGuardianToDelete] = useState(null);

    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [detailsGuardianId, setDetailsGuardianId] = useState(null);

    // Actions
    const handleView = (row) => {
        setDetailsGuardianId(row.id);
        setIsDetailsOpen(true);
    };

    const handleEdit = (row) => {
        setSelectedGuardian(row);
        setIsAddOpen(true);
    };

    const handleDelete = (row) => {
        setGuardianToDelete(row);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!guardianToDelete) return;
        try {
            await deleteGuardian(guardianToDelete.id).unwrap();
            toast.success("تم حذف ولي الأمر بنجاح");
            setIsDeleteOpen(false);
            setGuardianToDelete(null);
            setSelectedIds([]);
        } catch (err) {
            toast.error(err?.data?.message || "حدث خطأ أثناء الحذف");
        }
    };

    return (
        <div dir="rtl" className="w-full h-full p-6 flex flex-col gap-6">
            <div className="w-full flex justify-between items-center">
                <div className="flex flex-col text-right">
                    <h1 className="text-lg font-semibold text-gray-700">
                        أولياء الأمور
                    </h1>
                    <Breadcrumb />
                </div>
            </div>

            <div className="flex justify-between items-center flex-wrap gap-3">
                <ActionsRow
                    addLabel="إضافة ولي أمر"
                    viewLabel=""
                    showSelectAll
                    isAllSelected={isAllSelected}
                    onToggleSelectAll={toggleSelectAll}
                    onAdd={() => {
                        setSelectedGuardian(null);
                        setIsAddOpen(true);
                    }}
                />
                <div className="flex items-center gap-4 text-sm">
                    <div className="text-gray-400">
                        يعرض {filteredGuardians.length} من أصل {totalCount}
                    </div>
                </div>
            </div>

            <GuardiansTable
                guardians={filteredGuardians}
                isLoading={isLoading}
                selectedIds={selectedIds}
                onSelectChange={setSelectedIds}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <GuardianDetailsModal
                open={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                guardianId={detailsGuardianId}
            />

            <AddGuardianModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                guardian={selectedGuardian}
            />

            <DeleteConfirmModal
                isOpen={isDeleteOpen}
                loading={isDeleting}
                title="حذف ولي أمر"
                description={`هل أنت متأكد من حذف ${guardianToDelete?.first_name} ${guardianToDelete?.last_name}؟ لا يمكن التراجع عن هذا الإجراء.`}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
