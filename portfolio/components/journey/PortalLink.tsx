import Link from "next/link";

export default function PortalLink({ href, label }: { href: string; label: string }) {
  const isInternal = href.startsWith("/");

  // Internal navigation -> Next Link
  if (isInternal) {
    return (
      <Link
        href={href}
        className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:border-white/25 transition"
      >
        {label} →
      </Link>
    );
  }

  // External -> normal anchor (allowed)
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:border-white/25 transition"
    >
      {label} →
    </a>
  );
}
