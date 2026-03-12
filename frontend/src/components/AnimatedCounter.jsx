import { useEffect, useRef, useState } from "react";

export default function AnimatedCounter({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef({ start: 0, end: 0, raf: 0 });

  useEffect(() => {
    const target = typeof value === "number" ? value : 0;
    const startVal = ref.current.end;
    ref.current.end = target;
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(startVal + (target - startVal) * eased));
      if (progress < 1) ref.current.raf = requestAnimationFrame(step);
    };

    cancelAnimationFrame(ref.current.raf);
    ref.current.raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current.raf);
  }, [value, duration]);

  return <>{display}</>;
}
