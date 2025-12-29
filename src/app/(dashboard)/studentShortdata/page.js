import { Suspense } from "react";
import StudentShortdataClient from "./StudentShortdataClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-gray-500">
          جاري تحميل بيانات الطالب...
        </div>
      }
    >
      <StudentShortdataClient />
    </Suspense>
  );
}
