import { Suspense } from "react";
import EmployeesClient from "./EmployeesClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-500"></div>}>
      <EmployeesClient />
    </Suspense>
  );
}
