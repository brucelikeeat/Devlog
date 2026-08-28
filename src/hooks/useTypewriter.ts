import { useState, useEffect } from "react";

export function useTypewriter(
  text: string,
  speed: number = 28,
  startDelay: number = 0,
  enabled: boolean = true,
): { displayed: string; isDone: boolean } {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setIsDone(false);

    if (!enabled) return;

    let interval: ReturnType<typeof setInterval>;

    const timeout = setTimeout(() => {
      let index = 0;

      interval = setInterval(() => {
        index += 1;
        setDisplayed(text.slice(0, index));

        if (index >= text.length) {
          clearInterval(interval);
          setIsDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, speed, startDelay, enabled]);

  return { displayed, isDone };
}
