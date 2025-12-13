import Link from "next/link";

export default function Home() {
  return (
    <main className="shell">
      <div className="wrap space-y-6">
        <header className="card p-7 space-y-3">
          <div className="h1">Auto Shop Quote Builder</div>
          <p className="sub">
            Create quotes, track customers, and schedule follow-ups — fast.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/customers" className="btn btnPrimary">
              Customers
            </Link>
            <Link href="/quotes/new" className="btn">
              New Quote
            </Link>
            <Link href="/quotes" className="btn">
              Quotes
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="card p-5 space-y-2">
            <div className="text-lg font-semibold">Customers</div>
            <p className="muted">
              Save customer info once and reuse it on every quote.
            </p>
            <div className="badge w-fit">Local autosave</div>
          </div>

          <div className="card p-5 space-y-2">
            <div className="text-lg font-semibold">Quotes</div>
            <p className="muted">
              Line items, tax, totals — built in. Copy a clean summary instantly.
            </p>
            <div className="badge w-fit">Fast & simple</div>
          </div>

          <div className="card p-5 space-y-2">
            <div className="text-lg font-semibold">Follow-ups</div>
            <p className="muted">
              Auto Day 1 / Day 3 / Day 7 follow-up reminders per quote.
            </p>
            <div className="badge w-fit">Built-in schedule</div>
          </div>
        </section>

        <section className="card p-6">
          <div className="text-lg font-semibold mb-2">Suggested workflow</div>
          <ol className="list-decimal pl-5 space-y-1 muted">
            <li>Add a customer</li>
            <li>Create a new quote</li>
            <li>Save quote → view it on Quotes page</li>
            <li>Use follow-up dates to close the job</li>
          </ol>
        </section>
      </div>
    </main>
  );
}
