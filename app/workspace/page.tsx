import { Suspense } from "react";
import { OverviewTab } from "@/components/workspace/OverviewTab";
import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";

export default function WorkspacePage() {
  return (
    <div className="app-shell">
      <Suspense fallback={null}>
        <WorkspaceLayout>
          <OverviewTab />
        </WorkspaceLayout>
      </Suspense>
    </div>
  );
}
