export function createTimer() {
  const start = process.hrtime.bigint();

  return {
    end() {
      const end = process.hrtime.bigint();
      const diffNs = end - start;
      return Number(diffNs) / 1e3 / 1e3; // ms
    },
  };
}

export function formatDuration(ms) {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;

  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(2)}s`;

  const m = Math.floor(s / 60);
  const rest = (s % 60).toFixed(1);
  return `${m}m ${rest}s`;
}
