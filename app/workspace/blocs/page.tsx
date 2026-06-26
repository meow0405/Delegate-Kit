import { Suspense } from "react";
import { BlocsAndSeatingTab } from "@/components/workspace/BlocsAndSeatingTab";
import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";

export default function BlocsPage() {
  return (
    <div className="app-shell">
      <Suspense fallback={null}>
        <WorkspaceLayout>
          <BlocsAndSeatingTab />
        </WorkspaceLayout>
      </Suspense>
    </div>
  );
}
