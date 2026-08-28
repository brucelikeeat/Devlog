import { useRef, useState, useEffect } from "react";

// Returns inView as a live boolean — true while the element intersects the
// viewport, false when it scrolls out. Animations reset cleanly if the user
// scrolls back up.
export function useInView(
  options: IntersectionObserverInit = { threshold: 0.2 },
): { ref: React.RefObject<HTMLDivElement>; inView: boolean } {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, options);

    observer.observe(el);
    return () => observer.disconnect();
    // options object is intentionally excluded — callers pass a stable literal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, inView };
}
