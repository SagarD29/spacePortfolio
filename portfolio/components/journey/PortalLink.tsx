export default function PortalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm hover:bg-black/5 transition"
    >
      {label} →
    </a>
  );
}
