"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** lower = more subtle; recommended 0.08–0.18 */
  strength?: number;
  /** px cap so it never gets too wild */
  maxOffset?: number;
};

export default function Parallax({
  children,
  className = "",
  strength = 0.12,
  maxOffset = 28,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || 1;

        // progress: -1..1 roughly, centered at viewport
        const center = rect.top + rect.height / 2;
        const progress = (center - vh / 2) / (vh / 2);

        const next = Math.max(-maxOffset, Math.min(maxOffset, -progress * maxOffset * strength * 5));
        setOffset(next);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [maxOffset, strength]);

  return (
    <div ref={ref} className={className} style={{ transform: `translateY(${offset}px)` }}>
      {children}
    </div>
  );
}
