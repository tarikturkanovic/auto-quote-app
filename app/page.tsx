"use client";

import Link from "next/link";
import AccessGate from "./components/AccessGate";

export default function Home() {
  return (
    <AccessGate>
      <main className="shell">
        <div className="wrap space-y-8 pb-10">
          {/* Top hero section */}
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-stretch">
            {/* Left: headline + copy */}
            <div className="card p-7 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wide">
                  <span className="h-2 w-2 rounded-full bg-lime-400" />
                  <span className="opacity-80">Built for auto shops</span>
                </div>

                <h1 className="h1">
                  Turn calls into{" "}
                  <span className="font-extrabold text-lime-300">
                    closed jobs
                  </span>
                  — in minutes.
                </h1>

                <p className="sub">
                  Auto Shop Quote Builder lets you log customers, build clean
                  quotes, and follow up like a pro — without spreadsheets or
                  confusing software.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link href="/quotes/new" className="btn btnPrimary">
                  + Create a quote
                </Link>
                <Link href="/customers" className="btn">
                  View customers
                </Link>

                <div className="muted text-xs md:text-sm">
                  No login system yet — access is tied to this browser.
                </div>
              </div>
            </div>

            {/* Right: preview card */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm uppercase tracking-wide text-lime-300">
                    Live preview
                  </div>
                  <div className="text-base text-white/90">
                    Sample quote summary
                  </div>
                </div>
                <span className="badge">Instant total</span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-white">Customer</span>
                  <span className="muted">E36 M3 Brake Job</span>
                </div>
                <div className="muted">
                  John Carter • (555) 123-4567 • john@example.com
                </div>

                <div className="mt-3 space-y-1">
                  <div className="muted text-xs">Items</div>
                  <div className="flex justify-between text-xs">
                    <span>Labor (2.0 hrs @ $120)</span>
                    <span>$240.00</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Brake pads (front)</span>
                    <span>$180.00</span>
                  </div>
                </div>

                <div className="mt-3 border-t border-white/10 pt-3 space-y-1 text-xs">
                  <div className="flex justify-between muted">
                    <span>Subtotal</span>
                    <span>$420.00</span>
                  </div>
                  <div className="flex justify-between muted">
                    <span>Tax (9%)</span>
                    <span>$37.80</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-white">
                    <span>Total</span>
                    <span>$457.80</span>
                  </div>
                </div>
              </div>

              <p className="muted text-xs">
                This is just a static preview. Real quotes are created on the{" "}
                <span className="font-medium text-white">New Quote</span> page.
              </p>
            </div>
          </section>

          {/* Feature row */}
          <section className="grid gap-4 md:grid-cols-3">
            <div className="card p-5 space-y-2">
              <div className="text-sm font-semibold text-white">
                Fast, clean quotes
              </div>
              <p className="muted text-sm">
                Type parts + labor, and the app auto-calculates subtotals, tax,
                and total — ready to read over the phone or copy into a text.
              </p>
            </div>
            <div className="card p-5 space-y-2">
              <div className="text-sm font-semibold text-white">
                Customer mini-CRM
              </div>
              <p className="muted text-sm">
                Save names, phones, and emails so you never lose track of who
                called about what job.
              </p>
            </div>
            <div className="card p-5 space-y-2">
              <div className="text-sm font-semibold text-white">
                Built-in follow-ups
              </div>
              <p className="muted text-sm">
                Every quote gets Day 1 / 3 / 7 follow-up reminders so you can
                call back and close more work.
              </p>
            </div>
          </section>

          {/* How it works */}
          <section className="card p-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">
                How shops actually use this
              </h2>
              <span className="badge">3-step flow</span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="pill w-fit">Step 1</div>
                <div className="font-medium text-white">Log the customer</div>
                <p className="muted text-sm">
                  Pick up the phone, open{" "}
                  <span className="font-medium text-white">Customers</span>, and
                  save their name + number in under 10 seconds.
                </p>
              </div>

              <div className="space-y-2">
                <div className="pill w-fit">Step 2</div>
                <div className="font-medium text-white">Build the quote</div>
                <p className="muted text-sm">
                  Jump to <span className="font-medium text-white">New Quote</span>,
                  choose the customer, type parts + labor, and read the total on
                  the spot.
                </p>
              </div>

              <div className="space-y-2">
                <div className="pill w-fit">Step 3</div>
                <div className="font-medium text-white">Follow up & close</div>
                <p className="muted text-sm">
                  Use the <span className="font-medium text-white">Quotes</span>{" "}
                  page to see totals and follow-up dates — call back and book
                  the job.
                </p>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="card p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-wide text-lime-300">
                Ready to try it?
              </div>
              <p className="mt-1 text-base text-white">
                Start by adding your first customer or jumping straight into a
                quote.
              </p>
              <p className="muted text-sm mt-1">
                Everything is saved in this browser — perfect for a front desk
                or service writer laptop.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/customers" className="btn btnPrimary">
                Add customer
              </Link>
              <Link href="/quotes/new" className="btn">
                Create quote
              </Link>
            </div>
          </section>
        </div>
      </main>
    </AccessGate>
  );
}
