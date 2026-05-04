const RETRY_DELAY_MS = 500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 1,
  label: string = "",
): Promise<T | null> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      if (attempt < retries) {
        attempt++;
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      const message = err instanceof Error ? err.message : String(err);
      const prefix = label ? `[withRetry:${label}]` : "[withRetry]";
      console.error(`${prefix} failed after ${retries + 1} attempt(s): ${message}`);
      return null;
    }
  }
}
