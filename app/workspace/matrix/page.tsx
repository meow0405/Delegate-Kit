import { Suspense } from "react";
import { MatrixTab } from "@/components/workspace/MatrixTab";
import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";

export default function MatrixPage() {
  return (
    <div className="app-shell">
      <Suspense fallback={null}>
        <WorkspaceLayout>
          <MatrixTab />
        </WorkspaceLayout>
      </Suspense>
    </div>
  );
}
