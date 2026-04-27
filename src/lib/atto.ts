// Parses an ATTO bus QR payload like "atto01860DBA" into a formatted plate "01/860 DBA"
export function parseAttoQr(raw: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const match = trimmed.match(/(?:atto)?\s*(\d{2})(\d{3})([A-Za-z]{3})/i);
  if (!match) return null;
  const [, region, num, series] = match;
  return `${region}/${num} ${series.toUpperCase()}`;
}

export function generateReceiptNumber() {
  return String(Math.floor(Math.random() * 9000000) + 1000000);
}

const MONTHS_UZ = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
];

const MONTHS_UZ_TITLE = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentabr",
  "Oktabr",
  "Noyabr",
  "Dekabr",
];

const MONTHS_UZ_SHORT = [
  "yan",
  "fev",
  "mar",
  "apr",
  "may",
  "iyn",
  "iyl",
  "avg",
  "sen",
  "okt",
  "noy",
  "dek",
];

export function formatPaidAt(d: Date) {
  const day = d.getDate();
  const month = MONTHS_UZ[d.getMonth()];
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${hh}:${mm}`;
}

export function formatTravelDate(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

export function formatHM(d: Date) {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function formatMonthYearTitle(d: Date) {
  return `${MONTHS_UZ_TITLE[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDayShort(d: Date) {
  return `${d.getDate()}-${MONTHS_UZ_SHORT[d.getMonth()]}, ${d.getFullYear()}`;
}

export function formatISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function dayLabel(d: Date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(d, today)) return "Bugun";
  if (isSameDay(d, yesterday)) return "Kecha";
  return formatDayShort(d);
}

export function formatNum(n: number) {
  return n.toLocaleString("ru-RU").replace(/,/g, " ");
}
