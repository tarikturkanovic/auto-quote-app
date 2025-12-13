"use client";

import { useEffect, useMemo, useState } from "react";
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

function subtotalOf(q: SavedQuote) {
  return q.items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.unit) || 0), 0);
}

export default function PrintQuotePage() {
  const sp = useSearchParams();
  const id = sp.get("id") || "";

  const [quote, setQuote] = useState<SavedQuote | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(QUOTES_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const safe: SavedQuote[] = Array.isArray(list) ? list : [];
      const found = safe.find((q) => q.id === id) || null;
      setQuote(found);
    } catch {
      setQuote(null);
    } finally {
      setLoaded(true);
    }
  }, [id]);

  const totals = useMemo(() => {
    if (!quote) return { sub: 0, tax: 0, total: 0 };
    const sub = subtotalOf(quote);
    const tax = sub * (Number(quote.taxRate) || 0);
    const total = sub + tax;
    return { sub, tax, total };
  }, [quote]);

  if (!loaded) {
    return (
      <main className="min-h-screen bg-white text-black p-10">
        <div className="max-w-3xl mx-auto">Loading…</div>
      </main>
    );
  }

  if (!quote) {
    return (
      <main className="min-h-screen bg-white text-black p-10">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold">Quote not found</h1>
          <p>That usually means the URL id is wrong.</p>
          <div className="flex gap-2">
            <Link className="underline" href="/quotes">Back to Quotes</Link>
            <span>•</span>
            <Link className="underline" href="/quotes/new">Create a new quote</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Auto Shop Quote</h1>
            <div className="text-sm text-gray-600">
              Created: {new Date(quote.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="flex gap-2 print:hidden">
            <Link className="px-3 py-2 border rounded-md" href="/quotes">
              Back
            </Link>
            <button
              className="px-3 py-2 border rounded-md"
              onClick={() => window.print()}
            >
              Print
            </button>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-600">Customer</div>
          <div className="text-lg font-semibold">{quote.customerName || "Unknown Customer"}</div>
          <div className="text-sm text-gray-700">
            {quote.customerPhone || "—"} • {quote.customerEmail || "—"}
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Item</th>
                <th className="p-3 w-24">Qty</th>
                <th className="p-3 w-28">Unit</th>
                <th className="p-3 w-28">Line</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((it, idx) => {
                const qty = Number(it.qty) || 0;
                const unit = Number(it.unit) || 0;
                return (
                  <tr key={idx} className="border-t">
                    <td className="p-3">{it.name || "Item"}</td>
                    <td className="p-3">{qty}</td>
                    <td className="p-3">{money(unit)}</td>
                    <td className="p-3 font-semibold">{money(qty * unit)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-700">Subtotal</span>
            <span className="font-semibold">{money(totals.sub)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Tax ({((Number(quote.taxRate) || 0) * 100).toFixed(2)}%)</span>
            <span className="font-semibold">{money(totals.tax)}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="font-bold">Total</span>
            <span className="font-bold">{money(totals.total)}</span>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Tip: Press <b>Cmd+P</b> (Mac) or <b>Ctrl+P</b> (Windows) to print.
        </div>
      </div>
    </main>
  );
}
