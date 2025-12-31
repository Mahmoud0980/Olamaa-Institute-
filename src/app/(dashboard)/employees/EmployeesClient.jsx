"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EmployeesPage from "./EmployeesPage";

export default function EmployeesClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [openAddFromUrl, setOpenAddFromUrl] = useState(false);

  useEffect(() => {
    if (searchParams.get("addEmployee") === "1") {
      setOpenAddFromUrl(true);

      // تنظيف الرابط حتى لا يعاد فتح المودال
      router.replace("/employees");
    }
  }, [searchParams, router]);

  return <EmployeesPage openAddFromUrl={openAddFromUrl} />;
}
