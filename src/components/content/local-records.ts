/**
 * Tiny localStorage "collection" helper for the mock service forms (lab
 * bookings, consultations, pharmacy applications). Replace `saveRecord`
 * with a POST to the corresponding API endpoint in production.
 */
export const recordKeys = {
  labBookings: "medinest.lab-bookings.v1",
  consultations: "medinest.consultations.v1",
  pharmacyApplications: "medinest.pharmacy-applications.v1",
} as const;

export function saveRecord<T extends object>(key: string, record: T): T & { id: string; createdAt: string } {
  const full = { ...record, id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase(), createdAt: new Date().toISOString() };
  let list: unknown[] = [];
  try {
    list = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown[];
    if (!Array.isArray(list)) list = [];
  } catch {
    list = [];
  }
  localStorage.setItem(key, JSON.stringify([full, ...list].slice(0, 50)));
  return full;
}

/** The next `days` calendar days as { value: "YYYY-MM-DD", label: "Mon, 14 Sep" }. */
export function upcomingDays(days = 7, startOffset = 0) {
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const out: { value: string; label: string }[] = [];
  const base = new Date();
  for (let i = startOffset; i < startOffset + days; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const prefix = i === 0 ? "Today" : i === 1 ? "Tomorrow" : names[d.getDay()];
    out.push({ value, label: `${prefix}, ${d.getDate()} ${months[d.getMonth()]}` });
  }
  return out;
}
