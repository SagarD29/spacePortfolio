"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** 0..1 - how much of the element should be visible before revealing */
  threshold?: number;
  /** px */
  translateY?: number;
};

export default function ScrollReveal({
  children,
  className = "",
  threshold = 0.18,
  translateY = 18,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={[
        className,
        "transition-all duration-700 ease-out will-change-transform",
        visible ? "opacity-100 translate-y-0" : `opacity-0 translate-y-[${translateY}px]`,
      ].join(" ")}
      style={{
        transform: visible ? "translateY(0px)" : `translateY(${translateY}px)`,
      }}
    >
      {children}
    </div>
  );
}
