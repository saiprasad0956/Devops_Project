export const CURRENCY = "USD"; // change to "INR", "EUR", "GBP"... if you like
export const INCOME_COLOR = "#10b981";
export const EXPENSE_COLOR = "#ef4444";
export const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export const money = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: CURRENCY }).format(Number(n || 0));

export const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const pad = (n) => String(n).padStart(2, "0");
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => toISO(new Date());
export const startOfMonth = () => { const d = new Date(); return toISO(new Date(d.getFullYear(), d.getMonth(), 1)); };
