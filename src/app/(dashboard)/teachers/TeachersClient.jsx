"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TeachersPage from "./TeachersPage";

export default function TeachersClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [openAddFromUrl, setOpenAddFromUrl] = useState(false);

  useEffect(() => {
    if (searchParams.get("addTeacher") === "1") {
      setOpenAddFromUrl(true);

      // تنظيف الرابط حتى ما يعاد الفتح عند refresh
      router.replace("/teachers");
    }
  }, [searchParams, router]);

  return <TeachersPage openAddFromUrl={openAddFromUrl} />;
}
