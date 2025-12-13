"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const STORAGE_KEY = "asqb_customers_v1";
const BACKUP_KEY = "asqb_customers_backup_v1";

function isCustomer(x: any): x is Customer {
  return (
    x &&
    typeof x === "object" &&
    typeof x.id === "string" &&
    typeof x.name === "string" &&
    typeof x.phone === "string" &&
    typeof x.email === "string" &&
    typeof x.createdAt === "string"
  );
}

function readCustomers(key: string): Customer[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const clean = parsed.filter(isCustomer);
    return clean;
  } catch {
    return [];
  }
}

function writeCustomers(key: string, list: Customer[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {}
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");

  // Load once (and auto-restore if main key got wiped)
  useEffect(() => {
    const main = readCustomers(STORAGE_KEY);
    const backup = readCustomers(BACKUP_KEY);

    // If main is empty but backup has data, restore.
    if (main.length === 0 && backup.length > 0) {
      setCustomers(backup);
      writeCustomers(STORAGE_KEY, backup);
      writeCustomers(BACKUP_KEY, backup);
      return;
    }

    setCustomers(main);

    // Keep backup in sync if main has data.
    if (main.length > 0) {
      writeCustomers(BACKUP_KEY, main);
    }
  }, []);

  function persist(next: Customer[]) {
    setCustomers(next);
    writeCustomers(STORAGE_KEY, next);
    writeCustomers(BACKUP_KEY, next);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => {
      return (
        (c.name || "").toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q)
      );
    });
  }, [customers, query]);

  function addCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const newCustomer: Customer = {
      id: uid(),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      createdAt: new Date().toISOString(),
    };

    persist([newCustomer, ...customers]);
    setName("");
    setPhone("");
    setEmail("");
  }

  function removeCustomer(id: string) {
    persist(customers.filter((c) => c.id !== id));
  }

  return (
    <main className="shell">
      <div className="wrap space-y-6">
        <header className="card p-7 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h1">Customers</div>
            <p className="sub">Add and manage customers.</p>
          </div>

          <Link className="btn" href="/">
            ← Home
          </Link>
        </header>

        <section className="card p-7 space-y-4">
          <div className="text-lg font-semibold">Add Customer</div>

          <form onSubmit={addCustomer} className="grid gap-3 md:grid-cols-3">
            <input
              className="input"
              placeholder="Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="input"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              className="input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="md:col-span-3 flex items-center gap-3">
              <button type="submit" className="btn btnPrimary">
                Add Customer
              </button>
              <span className="muted text-sm">* required</span>
            </div>
          </form>
        </section>

        <section className="card p-7 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-lg font-semibold">
              Customer List{" "}
              <span className="muted font-normal">({filtered.length})</span>
            </div>

            <input
              className="input md:w-[420px]"
              placeholder="Search name / phone / email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {filtered.length === 0 ? (
            <p className="muted">No customers yet.</p>
          ) : (
            <div className="card p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-left">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Email</th>
                    <th className="p-3 w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-t border-white/10">
                      <td className="p-3 font-semibold">{c.name}</td>
                      <td className="p-3 muted">{c.phone || "—"}</td>
                      <td className="p-3 muted">{c.email || "—"}</td>
                      <td className="p-3">
                        <button onClick={() => removeCustomer(c.id)} className="btn">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
