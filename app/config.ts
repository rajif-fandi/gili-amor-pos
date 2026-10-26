// Pengaturan bersama: metode pembayaran dan harga laundry.
// File biasa (bukan "use server"), jadi bisa dipakai di actions.ts maupun halaman client.

export const PAYMENT_METHODS = [
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
// Math.round DIBUANG: Biaya admin sekarang akan memiliki koma desimal asli
export const feeAmount = (base: number, method?: string | null) => (base || 0) * feeRate(method);
// Math.round DIBUANG: Total pembayaran sekarang menyesuaikan nilai aslinya
export const withFee = (base: number, method?: string | null) => (base || 0) + feeAmount(base, method);

export const isCard = (method?: string | null) => (method || "").startsWith("Card");
// isUnpaid dibiarkan agar data lama di database yang berstatus Unpaid tidak error saat dibaca
export const isUnpaid = (method?: string | null) => method === "Unpaid";
export const methodGroup = (method?: string | null) => (isCard(method) ? "Card" : method || "");

// Harga laundry per kg
export const LAUNDRY_RATES: Record<string, number> = {
  Normal: 30000,
  Express: 50000,
};
// Math.round DIBUANG: Harga dari perkalian berat (kg) yang berkoma tidak akan dibulatkan
export const laundryPrice = (kg: number, service?: string | null) =>
  (kg || 0) * (LAUNDRY_RATES[service || "Normal"] ?? LAUNDRY_RATES.Normal);

// Sewa sepeda
export const BIKE_RATES: Record<string, number> = {
  "Standard Bicycle": 50000,
  "Electric Bike": 250000,
};
export const bikeDailyRate = (type?: string | null) => BIKE_RATES[type || ""] ?? BIKE_RATES["Standard Bicycle"];

export const BIKE_VENDORS = ["Mr Ikin", "Life is Good"] as const;

// Denda untuk Terms of Loss Agreement (form sewa sepeda)
export const STANDARD_LOST_FEE = 2700000;
export const PADLOCK_LOST_FEE = 50000;
export const EBIKE_LOST_FEE = 5500000;
export const EBIKE_KEY_LOST_FEE = 500000;
export const EBIKE_MINOR_DAMAGE_FEE = 1200000;
export const EBIKE_MAJOR_DAMAGE_FEE = 2000000;