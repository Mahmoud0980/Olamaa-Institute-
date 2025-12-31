"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import EmployeesPage from "./EmployeesPage";

export default function EmployeesClient() {
  const searchParams = useSearchParams();
  const [openAddFromUrl, setOpenAddFromUrl] = useState(false);

  useEffect(() => {
    const addEmployee = searchParams.get("addEmployee");
    if (addEmployee === "1") {
      setOpenAddFromUrl(true);
    }
  }, [searchParams]);

  return <EmployeesPage openAddFromUrl={openAddFromUrl} />;
}
