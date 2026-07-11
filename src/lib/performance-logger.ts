export function startTimer(label: string) {
  const start = process.hrtime();
  return {
    end() {
      const diff = process.hrtime(start);
      const ms = diff[0] * 1000 + diff[1] / 1000000;
      console.log(`[PERFORMANCE] ${label} took ${ms.toFixed(3)}ms`);
      return ms;
    }
  };
}
