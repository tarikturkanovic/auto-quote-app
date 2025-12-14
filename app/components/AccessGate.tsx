"use client";

import React, {
  useEffect,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";

const ACCESS_KEY = "asqb_access_unlocked_v1";

// Codes you can give to paying clients
const VALID_CODES = ["AUTO2025", "DEMO123", "CLIENTPASS"];

type AccessGateProps = {
  children: ReactNode;
};

export default function AccessGate({ children }: AccessGateProps) {
  const [checked, setChecked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  // Check localStorage once on load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(ACCESS_KEY);
      if (raw === "true") {
        setUnlocked(true);
      }
    } catch {
      // ignore
    }
    setChecked(true);
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();

    if (VALID_CODES.includes(trimmed)) {
      setUnlocked(true);
      setError("");
      try {
        localStorage.setItem(ACCESS_KEY, "true");
      } catch {
        // ignore
      }
    } else {
      setError("That code doesn’t match. Ask the owner for your access code.");
    }
  }

  // While checking stored access
  if (!checked) {
    return (
      <main className="shell">
        <div className="wrap flex items-center justify-center min-h-[60vh]">
          <div className="muted">Checking access…</div>
        </div>
      </main>
    );
  }

  // Locked state
  if (!unlocked) {
    return (
      <main className="shell">
        <div className="wrap flex items-center justify-center min-h-[60vh]">
          <div className="card p-8 max-w-md w-full space-y-4">
            <h1 className="h1">Enter access code</h1>
            <p className="sub">
              This tool is for paying customers. Enter the access code the owner
              gave you.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                className="input w-full"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Access code"
              />
              {error && <div className="text-xs text-red-400">{error}</div>}
              <button type="submit" className="btn btnPrimary w-full">
                Unlock Auto Shop Quote Builder
              </button>
            </form>

            <p className="muted text-xs">
              Lost your code? Contact the owner and they can send you a new one.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Unlocked – show the real app
  return <>{children}</>;
}
