"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Item = { id: string; name: string; qty: number; unit: number };
type Customer = { id: string; name: string; phone: string; email: string; createdAt: string };
type QuoteStatus = "Draft" | "Sent" | "Approved" | "Paid";

type SavedQuote = {
  id: string;
  createdAt: string;
  title: string;
  status: QuoteStatus;
  notes: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  taxRate: number;
  items: { name: string; qty: number; unit: number }[];
};

const CUSTOMER_KEY = "asqb_customers_v1";
const QUOTE_DRAFT_KEY = "asqb_quote_draft_v2";
const QUOTES_KEY = "asqb_quotes_v1";
const EDIT_ID_KEY = "asqb_edit_quote_id_v1";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function money(n: number) {
  return `$${(Number(n) || 0).toFixed(2)}`;
}

function guessTitle(items: Item[]) {
  const first = items.find((it) => (it.name || "").trim());
  if (first) return `${first.name.trim()} quote`;
  return "New quote";
}

function safeStatus(s: any): QuoteStatus {
  const ok = ["Draft", "Sent", "Approved", "Paid"];
  return ok.includes(s) ? (s as QuoteStatus) : "Draft";
}

export default function NewQuotePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState<string>("");

  const [editingId, setEditingId] = useState<string>("");

  const [title, setTitle] = useState<string>("New quote");
  const [status, setStatus] = useState<QuoteStatus>("Draft");
  const [notes, setNotes] = useState<string>("");

  const [taxRate, setTaxRate] = useState<number>(0.09);
  const [items, setItems] = useState<Item[]>([{ id: uid(), name: "Labor", qty: 1, unit: 120 }]);

  const didLoadRef = useRef(false);

  useEffect(() => {
    try {
      const rawCustomers = localStorage.getItem(CUSTOMER_KEY);
      const list: Customer[] = rawCustomers ? JSON.parse(rawCustomers) : [];
      const safeList = Array.isArray(list) ? list : [];
      setCustomers(safeList);

      // check if we are editing a quote
      const maybeEditId = localStorage.getItem(EDIT_ID_KEY) || "";
      if (maybeEditId) {
        const rawQuotes = localStorage.getItem(QUOTES_KEY);
        const qlist = rawQuotes ? JSON.parse(rawQuotes) : [];
        const safeQuotes: SavedQuote[] = Array.isArray(qlist) ? qlist : [];
        const found = safeQuotes.find((q) => q.id === maybeEditId);

        if (found) {
          setEditingId(found.id);
          setTitle(found.title || "Quote");
          setStatus(safeStatus(found.status));
          setNotes(found.notes || "");
          setTaxRate(typeof found.taxRate === "number" ? found.taxRate : 0.09);

          // items need ids for editing UI
          const withIds: Item[] = (found.items || []).map((it) => ({
            id: uid(),
            name: it.name || "",
            qty: Number(it.qty) || 0,
            unit: Number(it.unit) || 0,
          }));
          setItems(withIds.length ? withIds : [{ id: uid(), name: "Labor", qty: 1, unit: 120 }]);

          // match customer by name
          const match = safeList.find((c) => c.name === found.customerName);
          if (match) setCustomerId(match.id);
          else if (safeList.length > 0) setCustomerId(safeList[0].id);

          didLoadRef.current = true;
          return; // IMPORTANT: skip draft load when editing
        } else {
          // edit id stale
          localStorage.removeItem(EDIT_ID_KEY);
        }
      }

      // not editing: load draft
      const rawDraft = localStorage.getItem(QUOTE_DRAFT_KEY);
      if (rawDraft) {
        const d = JSON.parse(rawDraft);

        if (typeof d.title === "string") setTitle(d.title);
        if (typeof d.status === "string") setStatus(safeStatus(d.status));
        if (typeof d.notes === "string") setNotes(d.notes);

        if (typeof d.taxRate === "number") setTaxRate(d.taxRate);
        if (Array.isArray(d.items)) setItems(d.items);
        if (typeof d.customerId === "string") setCustomerId(d.customerId);
      } else {
        if (safeList.length > 0) setCustomerId(safeList[0].id);
        setTitle("New quote");
        setStatus("Draft");
        setNotes("");
      }
    } catch {
      // ignore
    } finally {
      didLoadRef.current = true;
    }
  }, []);

  // Save draft only when NOT editing
  useEffect(() => {
    if (!didLoadRef.current) return;
    if (editingId) return;
    try {
      localStorage.setItem(
        QUOTE_DRAFT_KEY,
        JSON.stringify({ customerId, title, status, notes, taxRate, items })
      );
    } catch {}
  }, [customerId, title, status, notes, taxRate, items, editingId]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === customerId),
    [customers, customerId]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.unit) || 0), 0),
    [items]
  );
  const tax = useMemo(() => subtotal * (Number(taxRate) || 0), [subtotal, taxRate]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  function addItem() {
    setItems((prev) => [...prev, { id: uid(), name: "", qty: 1, unit: 0 }]);
  }
  function updateItem(id: string, patch: Partial<Item>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }
  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function copyQuoteSummary() {
    const custLine = selectedCustomer
      ? `${selectedCustomer.name} (${selectedCustomer.phone || "—"} / ${selectedCustomer.email || "—"})`
      : "—";

    const lines = [
      `AUTO SHOP QUOTE`,
      `Title: ${(title || "").trim() || "Quote"}`,
      `Status: ${status}`,
      `Customer: ${custLine}`,
      notes.trim() ? `Notes: ${notes.trim()}` : "",
      ``,
      `Items:`,
      ...items.map((it) => {
        const q = Number(it.qty) || 0;
        const u = Number(it.unit) || 0;
        return `- ${(it.name || "Item").trim()} | qty ${q} | $${u.toFixed(2)} | $${(q * u).toFixed(2)}`;
      }),
      ``,
      `Subtotal: ${money(subtotal)}`,
      `Tax (${((Number(taxRate) || 0) * 100).toFixed(2)}%): ${money(tax)}`,
      `Total: ${money(total)}`,
    ].filter(Boolean).join("\n");

    navigator.clipboard.writeText(lines);
    alert("Copied quote summary ✅");
  }

  function clearDraft() {
    try {
      localStorage.removeItem(QUOTE_DRAFT_KEY);
      localStorage.removeItem(EDIT_ID_KEY);
    } catch {}
    setEditingId("");
    setStatus("Draft");
    setNotes("");
    setTaxRate(0.09);
    setItems([{ id: uid(), name: "Labor", qty: 1, unit: 120 }]);
    setTitle("New quote");
    if (customers.length > 0) setCustomerId(customers[0].id);
  }

  function saveQuote() {
    if (customers.length === 0) {
      alert("Add a customer first.");
      return;
    }
    if (!selectedCustomer) {
      alert("Select a customer.");
      return;
    }

    const hasRealItem = items.some((it) => (it.name || "").trim() && (Number(it.qty) || 0) > 0);
    if (!hasRealItem) {
      alert("Add at least one real line item before saving.");
      return;
    }

    const finalTitle = (title || "").trim() || guessTitle(items);

    const payload: SavedQuote = {
      id: editingId || uid(),
      createdAt: editingId ? new Date().toISOString() : new Date().toISOString(),
      title: finalTitle,
      status,
      notes: notes || "",
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone || "",
      customerEmail: selectedCustomer.email || "",
      taxRate: Number(taxRate) || 0,
      items: items.map((it) => ({
        name: (it.name || "Item").trim(),
        qty: Number(it.qty) || 0,
        unit: Number(it.unit) || 0,
      })),
    };

    try {
      const raw = localStorage.getItem(QUOTES_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const safe = Array.isArray(list) ? list : [];

      const next = editingId
        ? safe.map((q: SavedQuote) => (q.id === editingId ? { ...q, ...payload } : q))
        : [payload, ...safe];

      localStorage.setItem(QUOTES_KEY, JSON.stringify(next));
    } catch {}

    try {
      localStorage.removeItem(EDIT_ID_KEY);
      localStorage.removeItem(QUOTE_DRAFT_KEY);
    } catch {}

    alert(editingId ? "Updated quote ✅" : "Saved quote ✅");
    window.location.href = "/quotes";
  }

  return (
    <main className="shell">
      <div className="wrap space-y-6">
        <header className="card p-7 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h1">{editingId ? "Edit Quote" : "New Quote"}</div>
            <p className="sub">{editingId ? "Editing a saved quote." : "Autosaves while you type."}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="btn" href="/">Home</Link>
            <Link className="btn" href="/customers">Customers</Link>
            <Link className="btn" href="/quotes">Quotes</Link>
          </div>
        </header>

        <section className="card p-7 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="muted">Quote Title</div>
              <input className="input w-full" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="space-y-2">
              <div className="muted">Status</div>
              <select className="input w-full" value={status} onChange={(e) => setStatus(e.target.value as QuoteStatus)}>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Approved">Approved</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="muted">Notes</div>
              <textarea className="input w-full" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="muted">Customer</div>
              {customers.length === 0 ? (
                <div className="card p-4">
                  <div className="muted">No customers yet.</div>
                  <div className="mt-2">
                    <Link className="btn btnPrimary" href="/customers">Add Customer</Link>
                  </div>
                </div>
              ) : (
                <>
                  <select className="input w-full" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {selectedCustomer && (
                    <div className="muted text-sm">
                      {selectedCustomer.phone || "—"} • {selectedCustomer.email || "—"}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="space-y-2">
              <div className="muted">Tax Rate</div>
              <input className="input w-full" type="number" step="0.01" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
              <div className="muted text-sm">Example: 0.09 = 9%</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="btn" onClick={copyQuoteSummary}>Copy Summary</button>
            <button className="btn" onClick={clearDraft}>{editingId ? "Stop Editing" : "Clear Draft"}</button>
            <button className="btn btnPrimary ml-auto" onClick={saveQuote}>
              {editingId ? "Update Quote" : "Save Quote"}
            </button>
          </div>
        </section>

        <section className="card p-7 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-lg font-semibold">Line Items</div>
            <button className="btn" onClick={addItem}>+ Add Item</button>
          </div>

          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left">
                <tr>
                  <th className="p-3">Item</th>
                  <th className="p-3 w-24">Qty</th>
                  <th className="p-3 w-32">Unit</th>
                  <th className="p-3 w-32">Line</th>
                  <th className="p-3 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t border-white/10">
                    <td className="p-3">
                      <input className="input w-full" value={it.name} onChange={(e) => updateItem(it.id, { name: e.target.value })} />
                    </td>
                    <td className="p-3">
                      <input className="input w-full" type="number" min={1} value={it.qty} onChange={(e) => updateItem(it.id, { qty: Number(e.target.value) })} />
                    </td>
                    <td className="p-3">
                      <input className="input w-full" type="number" step="0.01" value={it.unit} onChange={(e) => updateItem(it.id, { unit: Number(e.target.value) })} />
                    </td>
                    <td className="p-3 font-semibold">{money((Number(it.qty) || 0) * (Number(it.unit) || 0))}</td>
                    <td className="p-3">
                      <button className="btn" onClick={() => removeItem(it.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            <div className="card p-4">
              <div className="muted text-sm">Subtotal</div>
              <div className="text-xl font-semibold">{money(subtotal)}</div>
            </div>
            <div className="card p-4">
              <div className="muted text-sm">Tax</div>
              <div className="text-xl font-semibold">{money(tax)}</div>
            </div>
            <div className="card p-4">
              <div className="muted text-sm">Total</div>
              <div className="text-2xl font-bold">{money(total)}</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
