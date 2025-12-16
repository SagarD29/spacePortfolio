"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SearchK() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === "k";
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        setOpen(true);
        setValue(sp.get("q") || "");
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sp]);

  function apply() {
    const params = new URLSearchParams(sp.toString());
    if (!value.trim()) params.delete("q");
    else params.set("q", value.trim());
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
    setOpen(false);
  }

  return (
    <>
      <button
        className="inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm hover:bg-black/5 transition"
        onClick={() => {
          setOpen(true);
          setValue(sp.get("q") || "");
        }}
        aria-label="Open search"
      >
        Search <span className="ml-2 text-xs opacity-60">⌘/Ctrl K</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border bg-white p-4 shadow-sm"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">Search Archive</h2>
              <button
                className="text-sm underline opacity-70 hover:opacity-100"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>

            <p className="mt-1 text-xs opacity-60">
              Searches title, summary, tags and domains.
            </p>

            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") apply();
                if (e.key === "Escape") setOpen(false);
              }}
              placeholder="Type and press Enter…"
              className="mt-3 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
            />

            <div className="mt-3 flex justify-end gap-2">
              <button
                className="rounded-xl border px-3 py-2 text-sm hover:bg-black/5 transition"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-xl border px-3 py-2 text-sm hover:bg-black/5 transition"
                onClick={apply}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
