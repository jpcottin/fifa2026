export function rawDaysUntil(target: Date, today = new Date()): number {
  const t = new Date(target);
  const now = new Date(today);
  t.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - now.getTime()) / 86_400_000);
}
