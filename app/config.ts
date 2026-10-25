// Pengaturan bersama: metode pembayaran dan harga laundry.
// File biasa (bukan "use server"), jadi bisa dipakai di actions.ts maupun halaman client.

export const PAYMENT_METHODS = [
  "Unpaid",
  "Card (Debit/QRIS)",
  "Card (2,5%)",
  "Card (4%)",
  "Cash",
  "Room Charge",
  "Bank Transfer",
] as const;

const FEE_RATES: Record<string, number> = {
  "Card (2,5%)": 0.025,
  "Card (4%)": 0.04,
};

export const feeRate = (method?: string | null) => FEE_RATES[method || ""] || 0;
export const feeAmount = (base: number, method?: string | null) => Math.round((base || 0) * feeRate(method));
export const withFee = (base: number, method?: string | null) => Math.round(base || 0) + feeAmount(base, method);

export const isCard = (method?: string | null) => (method || "").startsWith("Card");
export const isUnpaid = (method?: string | null) => method === "Unpaid";
export const methodGroup = (method?: string | null) => (isCard(method) ? "Card" : method || "");

// Harga laundry per kg
export const LAUNDRY_RATES: Record<string, number> = {
  Normal: 30000,
  Express: 50000,
};
export const laundryPrice = (kg: number, service?: string | null) =>
  Math.round((kg || 0) * (LAUNDRY_RATES[service || "Normal"] ?? LAUNDRY_RATES.Normal));
