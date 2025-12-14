import { Suspense } from "react";
import PrintClient from "./PrintClient";

// Tell Next.js this page must be dynamic (no prerender)
// so it won't choke trying to read localStorage at build time.
export const dynamic = "force-dynamic";

export default function PrintQuotePage() {
  return (
    <Suspense
      fallback={
        <main className="shell">
          <div className="wrap">
            <div className="card p-7">Loading quote…</div>
          </div>
        </main>
      }
    >
      <PrintClient />
    </Suspense>
  );
}
