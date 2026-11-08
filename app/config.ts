// Pengaturan bersama: metode pembayaran dan harga laundry.
// File biasa (bukan "use server"), jadi bisa dipakai di actions.ts maupun halaman client.

// Metode bayar tunggal
export const BASE_METHODS = [
  "Card (Debit/QRIS)",
  "Card (2,5%)",
  "Card (4%)",
  "Cash",
  "Room Charge",
  "Bank Transfer",
];

// Split 50/50: semua kombinasi dua metode berbeda (kecuali dua jenis kartu sekaligus)
export const SPLIT_PREFIX = "Split 50/50: ";
const SPLIT_ORDER = ["Cash", "Card (Debit/QRIS)", "Card (2,5%)", "Card (4%)", "Room Charge", "Bank Transfer"];
export const SPLIT_METHODS: string[] = [];
for (let i = 0; i < SPLIT_ORDER.length; i++) {
  for (let j = i + 1; j < SPLIT_ORDER.length; j++) {
    if (SPLIT_ORDER[i].startsWith("Card") && SPLIT_ORDER[j].startsWith("Card")) continue;
    SPLIT_METHODS.push(SPLIT_PREFIX + SPLIT_ORDER[i] + " + " + SPLIT_ORDER[j]);
  }
}

// Daftar yang tampil di semua menu pembayaran: metode tunggal dulu, split di bawah Bank Transfer
export const PAYMENT_METHODS: string[] = [...BASE_METHODS, ...SPLIT_METHODS];

const FEE_RATES: Record<string, number> = {
  "Card (2,5%)": 0.025,
  "Card (4%)": 0.04,
};

export const splitParts = (method?: string | null): [string, string] | null => {
  if (!method || !method.startsWith(SPLIT_PREFIX)) return null;
  const parts = method.slice(SPLIT_PREFIX.length).split(" + ");
  return parts.length === 2 ? [parts[0], parts[1]] : null;
};
// Bagi dua (bilangan bulat): bagian pertama dibulatkan, bagian kedua sisanya
export const splitAmounts = (base: number): [number, number] => {
  const total = Math.round(base || 0);
  const first = Math.round(total / 2);
  return [first, total - first];
};

export const feeRate = (method?: string | null) => {
  const sp = splitParts(method);
  if (sp) return (FEE_RATES[sp[0]] || 0) / 2 + (FEE_RATES[sp[1]] || 0) / 2;
  return FEE_RATES[method || ""] || 0;
};
// Math.round DIBUANG untuk pembayaran tunggal (sesuai pilihanmu). Split selalu bilangan bulat.
export const feeAmount = (base: number, method?: string | null) => {
  const sp = splitParts(method);
  if (sp) {
    const [a, b] = splitAmounts(base);
    return Math.round(a * (FEE_RATES[sp[0]] || 0)) + Math.round(b * (FEE_RATES[sp[1]] || 0));
  }
  return (base || 0) * feeRate(method);
};
export const withFee = (base: number, method?: string | null) =>
  (splitParts(method) ? Math.round(base || 0) : (base || 0)) + feeAmount(base, method);

// Ringkasan bagian split untuk layar/konfirmasi, contoh: "Cash: Rp 50.000 + Card (2,5%): Rp 51.250 (termasuk biaya Rp 1.250)"
export const splitSummary = (base: number, method?: string | null) => {
  const sp = splitParts(method);
  if (!sp) return "";
  const [a, b] = splitAmounts(base);
  const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");
  return ([[sp[0], a], [sp[1], b]] as [string, number][])
    .map(([m, v]) => {
      const f = Math.round(v * (FEE_RATES[m] || 0));
      return `${m}: ${fmt(v + f)}${f > 0 ? ` (termasuk biaya ${fmt(f)})` : ""}`;
    })
    .join(" + ");
};

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

// Pembagian hasil sewa sepeda
export const EBIKE_SPLIT = { banana: 0.5, hotel: 0.25, joe: 0.25 };
export const BIKE_SPLIT = { hotel: 0.30, vendor: 0.70 }; // vendor = Mr Ikin / Life is Good, dihitung dari sewa sepedanya sendiri

// Item Mini Bar (muncul di panel "Mini Bar Details" saat item Mini Bar dipilih di kasir)
export const MINIBAR_ITEMS = [
  { id: "MB-PRINGLES", name: "Pringles", price: 40000 },
  { id: "MB-CHITATO", name: "Chitato", price: 25000 },
  { id: "MB-SMALLWATER", name: "Small Water", price: 5000 },
  { id: "MB-SMALLBIR", name: "Small Bir", price: 40000 },
  { id: "MB-SPRITE", name: "Sprite", price: 20000 },
  { id: "MB-COKE", name: "Coke", price: 20000 },
  { id: "MB-DCOKE", name: "D.Coke", price: 20000 },
];
