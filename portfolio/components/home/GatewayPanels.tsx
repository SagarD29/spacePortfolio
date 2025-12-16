"use client";

import { useRouter } from "next/navigation";

export default function GatewayPanels() {
  const router = useRouter();

  return (
    <main className="h-dvh w-full grid grid-cols-1 md:grid-cols-2">
      <button
        className="group flex items-center justify-center p-10 border-b md:border-b-0 md:border-r hover:bg-black/5 transition"
        onClick={() => router.push("/journey")}
        aria-label="Enter The Journey"
      >
        <div className="max-w-md text-left">
          <h1 className="text-4xl font-semibold tracking-tight">The Journey</h1>
          <p className="mt-3 text-base opacity-80">
            Curated scrollytelling. Featured highlights. Cinematic + technical.
          </p>
          <p className="mt-6 text-sm underline opacity-70 group-hover:opacity-100">Go to /journey</p>
        </div>
      </button>

      <button
        className="group flex items-center justify-center p-10 hover:bg-black/5 transition"
        onClick={() => router.push("/archive")}
        aria-label="Enter The Archive"
      >
        <div className="max-w-md text-left">
          <h1 className="text-4xl font-semibold tracking-tight">The Archive</h1>
          <p className="mt-3 text-base opacity-80">
            Complete inventory. Searchable, filterable, fast. Recruiter-friendly.
          </p>
          <p className="mt-6 text-sm underline opacity-70 group-hover:opacity-100">Go to /archive</p>
        </div>
      </button>
    </main>
  );
}
