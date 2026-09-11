"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STORAGE_KEY = "anvi-ops-auth";
/** Demo password for staff ops — documented in README */
export const OPS_DEMO_PASSWORD = "anviops2026";

export function OpsGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      setAuthed(window.sessionStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setAuthed(false);
    }
    setReady(true);
  }, []);

  function unlock(e: React.FormEvent) {
    e.preventDefault();
    if (password.trim() === OPS_DEMO_PASSWORD) {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
      setAuthed(true);
      setError("");
      return;
    }
    setError("Incorrect password. See README for the demo password.");
  }

  function lock() {
    window.sessionStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
    setPassword("");
    if (pathname !== "/ops") router.push("/ops");
  }

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[var(--ag-muted)]">
        Checking staff access…
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--ag-red)]">Staff only</p>
        <h1 className="mt-3 font-display text-4xl text-[var(--ag-ink)]">ANVI OPS</h1>
        <p className="mt-3 text-sm text-[var(--ag-muted)]">
          Enter the demo password to open reception, server, kitchen, admin,
          accounts, inward, and outward from one desk.
        </p>
        <form onSubmit={unlock} className="mt-8 grid gap-4 border border-[var(--ag-line)] bg-white p-6">
          <div className="grid gap-2">
            <Label htmlFor="ops-password">Password</Label>
            <Input
              id="ops-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-none"
              required
            />
          </div>
          <Button type="submit" className="h-11 rounded-none bg-[var(--ag-red)] text-white hover:bg-[var(--ag-maroon)]">
            Unlock ops desk
          </Button>
          {error ? (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-[var(--ag-line)] bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-end px-5 py-2 md:px-8">
          <button
            type="button"
            onClick={lock}
            className="text-xs uppercase tracking-wider text-[var(--ag-muted)] hover:text-[var(--ag-red)]"
          >
            Lock ops
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
