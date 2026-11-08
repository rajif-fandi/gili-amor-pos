// Modul biasa (bukan "use server"): dipakai oleh actions.ts dan bike-actions.ts untuk pembayaran split 50/50.
// Setiap bagian pembayaran disimpan sebagai satu baris Transaksi sendiri dengan metode aslinya (Cash, Card, dst),
// sehingga laporan Cash/Card dan Shift Closing tetap benar tanpa mengubah rumus laporan.
import { prisma } from "./db";
import { splitParts, splitAmounts, feeRate } from "./config";

type Detail = { item_code: string; qty: number; duration?: number; rate: number; total: number };

async function ensureFeeItem() {
  const code = "FEE-CARD";
  const exists = await prisma.masterItem.findUnique({ where: { item_code: code } });
  if (!exists) {
    await prisma.masterItem.create({
      data: { item_code: code, item_service: "Card Surcharge", default_rate: 0, category: "FEE", billing_type: "PER_UNIT", desk: "card", notes: "Auto-generated", active: true }
    });
  }
  return code;
}

export async function recordSplitTransactions(p: {
  baseNo: string;               // contoh "TRX-LND-1730000000000"; baris menjadi -1 dan -2
  nama_tamu: string;
  room: string;
  staff_id: string;
  notes?: string | null;
  method: string;               // "Split 50/50: Cash + Card (2,5%)"
  baseTotal: number;            // harga sebelum biaya kartu
  items: Detail[];              // rincian item penjualan (dicatat di baris pertama)
  extra?: { arrival_date?: string; checkout_date?: string; booking_source?: string };
}) {
  const parts = splitParts(p.method);
  if (!parts) throw new Error("Metode split tidak valid: " + p.method);

  const [a, b] = splitAmounts(p.baseTotal);
  const portions = [
    { method: parts[0], base: a },
    { method: parts[1], base: b },
  ];

  const feeCode = portions.some((x) => Math.round(x.base * feeRate(x.method)) > 0) ? await ensureFeeItem() : null;

  const creates = portions.map((portion, idx) => {
    const fee = Math.round(portion.base * feeRate(portion.method));
    const grand = portion.base + fee;
    const details: Detail[] = [
      ...(idx === 0 ? p.items : []),
      ...(fee > 0 && feeCode ? [{ item_code: feeCode, qty: 1, duration: 1, rate: fee, total: fee }] : []),
    ];
    return prisma.transaksi.create({
      data: {
        no_transaksi: `${p.baseNo}-${idx + 1}`,
        nama_tamu: p.nama_tamu,
        payment_method: portion.method,
        grand_total: grand,
        amount_paid: grand,
        balance: 0,
        payment_status: "PAID",
        room: p.room || "-",
        staff_id: p.staff_id,
        ...(idx === 0 && p.extra ? { arrival_date: p.extra.arrival_date, checkout_date: p.extra.checkout_date, booking_source: p.extra.booking_source } : {}),
        notes: `${p.notes ? p.notes + " | " : ""}SPLIT 50/50 [${idx + 1}/2] ${portion.method} (dari ${p.method.replace("Split 50/50: ", "")})`,
        details: {
          create: details.map((d) => ({
            item_code: d.item_code,
            qty: d.qty,
            duration: d.duration ?? 1,
            rate: Math.round(d.rate),
            discount: 0,
            total: Math.round(d.total),
          })),
        },
      },
    });
  });

  const created = await prisma.$transaction(creates);
  return created[0];
}
