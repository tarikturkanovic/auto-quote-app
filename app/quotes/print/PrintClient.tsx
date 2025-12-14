"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type SavedQuote = {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  taxRate: number;
  items: { name: string; qty: number; unit: number }[];
};

const QUOTES_KEY = "asqb_quotes_v1";

function money(n: number) {
  return `$${(Number(n) || 0).toFixed(2)}`;
}

export default function PrintClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";

  const [quote, setQuote] = useState<SavedQuote | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(QUOTES_KEY);
      const list: SavedQuote[] = raw ? JSON.parse(raw) : [];
      const safe = Array.isArray(list) ? list : [];
      const found = safe.find((q) => q.id === id) || null;
      setQuote(found);
    } catch {
      setQuote(null);
    } finally {
      setLoaded(true);
    }
  }, [id]);

  if (!loaded) {
    return (
      <main className="shell">
        <div className="wrap">
          <div className="card p-7">Loading quote…</div>
        </div>
      </main>
    );
  }

  if (!quote) {
    return (
      <main className="shell">
        <div className="wrap space-y-4">
          <div className="card p-7 space-y-3">
            <div className="h1">Quote not found</div>
            <p className="sub">
              We couldn’t find that quote in this browser’s saved data.
            </p>
            <div className="flex gap-2">
              <Link href="/quotes" className="btn">
                Back to Quotes
              </Link>
              <Link href="/quotes/new" className="btn btnPrimary">
                Create New Quote
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const subtotal = quote.items.reduce(
    (sum, it) => sum + (Number(it.qty) || 0) * (Number(it.unit) || 0),
    0
  );
  const tax = subtotal * (Number(quote.taxRate) || 0);
  const total = subtotal + tax;

  function handlePrint() {
    window.print();
  }

  return (
    <main className="shell">
      <div className="wrap space-y-6 pb-10">
        {/* Top controls (hidden when printing) */}
        <header className="card p-7 flex flex-wrap items-start justify-between gap-4 print:hidden">
          <div className="space-y-1">
            <div className="h1">Quote Print View</div>
            <p className="sub">Clean layout for printing or saving as PDF.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn btnPrimary" onClick={handlePrint}>
              Print / Save as PDF
            </button>
            <Link href="/quotes" className="btn">
              Back to Quotes
            </Link>
          </div>
        </header>

        {/* Printable content */}
        <section className="card p-7 bg-white text-slate-900 print:shadow-none">
          {/* Header info */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4 mb-4">
            <div>
              <div className="text-xl font-semibold">Auto Shop Quote</div>
              <div className="text-sm text-slate-500">
                Created: {new Date(quote.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="text-right text-sm">
              <div className="font-semibold">Customer</div>
              <div>{quote.customerName || "Unknown customer"}</div>
              <div className="text-slate-500">
                {quote.customerPhone || "—"} • {quote.customerEmail || "—"}
              </div>
            </div>
          </div>

          {/* Line items table */}
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left">Item</th>
                <th className="py-2 text-right w-24">Qty</th>
                <th className="py-2 text-right w-28">Unit</th>
                <th className="py-2 text-right w-28">Line</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((it, idx) => {
                const q = Number(it.qty) || 0;
                const u = Number(it.unit) || 0;
                const line = q * u;
                return (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-2">{it.name || "Item"}</td>
                    <td className="py-2 text-right">{q}</td>
                    <td className="py-2 text-right">{money(u)}</td>
                    <td className="py-2 text-right font-medium">
                      {money(line)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{money(tax)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
