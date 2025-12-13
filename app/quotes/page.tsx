"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type QuoteStatus = "Draft" | "Sent" | "Approved" | "Paid";

type SavedQuote = {
  id: string;
  createdAt: string;

  title?: string;
  status?: QuoteStatus;
  notes?: string;

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
  return q.items.reduce(
    (s, it) => s + (Number(it.qty) || 0) * (Number(it.unit) || 0),
    0
  );
}

function followUpsFor(createdAtIso: string) {
  const created = new Date(createdAtIso);
  const d1 = new Date(created);
  d1.setDate(d1.getDate() + 1);
  const d3 = new Date(created);
  d3.setDate(d3.getDate() + 3);
  const d7 = new Date(created);
  d7.setDate(d7.getDate() + 7);
  return [
    { label: "Day 1 follow-up", date: d1 },
    { label: "Day 3 follow-up", date: d3 },
    { label: "Day 7 follow-up", date: d7 },
  ];
}

function safeStatus(s: any): QuoteStatus {
  const ok = ["Draft", "Sent", "Approved", "Paid"];
  return ok.includes(s) ? (s as QuoteStatus) : "Draft";
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<SavedQuote[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(QUOTES_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const safe = Array.isArray(list) ? list : [];

      const normalized = safe.map((q: SavedQuote) => ({
        ...q,
        title: (q.title || "").trim() || "Quote",
        status: safeStatus((q as any).status),
        notes: typeof (q as any).notes === "string" ? (q as any).notes : "",
      }));

      setQuotes(normalized);
    } catch {
      setQuotes([]);
    }
  }, []);

  const sorted = useMemo(() => {
    return [...quotes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [quotes]);

  function removeQuote(id: string) {
    const next = quotes.filter((q) => q.id !== id);
    setQuotes(next);
    try {
      localStorage.setItem(QUOTES_KEY, JSON.stringify(next));
    } catch {}
  }

  function editQuote(id: string) {
    try {
      localStorage.setItem("asqb_edit_quote_id_v1", id);
    } catch {}
    window.location.href = "/quotes/new";
  }

  // ✅ NEW: open print view in a new tab using the REAL quote id
  function openPrint(id: string) {
    window.open(`/quotes/print?id=${encodeURIComponent(id)}`, "_blank");
  }

  return (
    <main className="shell">
      <div className="wrap space-y-6">
        <header className="card p-7 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h1">Quotes</div>
            <p className="sub">Saved quotes + follow-ups (Day 1 / 3 / 7).</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="btn" href="/">
              Home
            </Link>
            <Link className="btn btnPrimary" href="/quotes/new">
              New Quote
            </Link>
            <Link className="btn" href="/customers">
              Customers
            </Link>
          </div>
        </header>

        {sorted.length === 0 ? (
          <div className="card p-7">
            <div className="muted">No saved quotes yet.</div>
            <div className="mt-3">
              <Link className="btn btnPrimary" href="/quotes/new">
                Create your first quote
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {sorted.map((q) => {
              const sub = subtotalOf(q);
              const tax = sub * (Number(q.taxRate) || 0);
              const total = sub + tax;

              return (
                <div key={q.id} className="card p-7 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-lg font-semibold">
                          {(q.title || "").trim() || "Quote"}
                        </div>
                        <div className="badge">{q.status || "Draft"}</div>
                      </div>

                      <div className="text-sm">
                        <span className="muted">Customer:</span>{" "}
                        <span className="font-medium">
                          {q.customerName || "Unknown Customer"}
                        </span>
                      </div>

                      <div className="muted text-sm">
                        Created: {new Date(q.createdAt).toLocaleString()}
                      </div>
                      <div className="muted text-sm">
                        {q.customerPhone || "—"} • {q.customerEmail || "—"}
                      </div>

                      {(q.notes || "").trim() ? (
                        <div className="muted text-sm">
                          <span className="font-medium">Notes:</span>{" "}
                          {(q.notes || "").trim()}
                        </div>
                      ) : null}
                    </div>

                    <div className="text-right space-y-2">
                      <div className="muted text-sm">Total</div>
                      <div className="text-3xl font-bold">{money(total)}</div>

                      <div className="flex gap-2 justify-end flex-wrap">
                        <button className="btn btnPrimary" onClick={() => openPrint(q.id)}>
                          Print
                        </button>
                        <button className="btn" onClick={() => editQuote(q.id)}>
                          Edit
                        </button>
                        <button className="btn" onClick={() => removeQuote(q.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="card p-0 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-white/5 text-left">
                        <tr>
                          <th className="p-3">Item</th>
                          <th className="p-3 w-24">Qty</th>
                          <th className="p-3 w-28">Unit</th>
                          <th className="p-3 w-28">Line</th>
                        </tr>
                      </thead>
                      <tbody>
                        {q.items.map((it, idx) => (
                          <tr key={idx} className="border-t border-white/10">
                            <td className="p-3">{it.name || "Item"}</td>
                            <td className="p-3">{Number(it.qty) || 0}</td>
                            <td className="p-3">{money(Number(it.unit) || 0)}</td>
                            <td className="p-3 font-semibold">
                              {money((Number(it.qty) || 0) * (Number(it.unit) || 0))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {followUpsFor(q.createdAt).map((f) => (
                      <div key={f.label} className="badge">
                        <span className="font-medium">{f.label}:</span>{" "}
                        {f.date.toLocaleDateString()}
                      </div>
                    ))}
                  </div>

                  <div className="muted text-sm">
                    Subtotal {money(sub)} • Tax {money(tax)} • Total{" "}
                    <span className="font-semibold">{money(total)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
