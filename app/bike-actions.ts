"use server";
import { prisma } from "./db";
import { revalidatePath } from "next/cache";
import { feeAmount, isUnpaid, bikeDailyRate } from "./config";

// ---------- helper (tidak diekspor) ----------
type Unit = { no: string; vendor?: string };

const cleanUnits = (units: any, qty: number): Unit[] => {
  const arr = Array.isArray(units) ? units : [];
  return Array.from({ length: qty }, (_, i) => {
    const u = arr[i] || {};
    return { no: String(u.no ?? "").trim(), vendor: u.vendor ? String(u.vendor) : undefined };
  });
};
const joinNos = (units: Unit[]) => units.map((u) => u.no).filter(Boolean).join(", ");
const vendorLabel = (units: Unit[]) => {
  const v = Array.from(new Set(units.map((u) => u.vendor).filter(Boolean))) as string[];
  return v.length ? v.join(" + ") : null;
};

async function ensureRentalItem(isElectric: boolean) {
  const code = isElectric ? "E-BIKE" : "BIKE-STD";
  const exists = await prisma.masterItem.findUnique({ where: { item_code: code } });
  if (!exists) {
    await prisma.masterItem.create({
      data: {
        item_code: code, item_service: isElectric ? "E-Bike Rental" : "Bicycle Rental", default_rate: 0,
        category: "RENTAL", billing_type: "PER_DAY", desk: "bike", notes: "Auto-generated", active: true
      }
    });
  }
  return code;
}

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

// ---------- 1. Form tamu: satu kiriman bisa berisi beberapa sepeda biasa dan/atau sepeda listrik ----------
export async function submitBikeBatch(
  data: { room: string; guest_name: string; whatsapp: string; duration_days: number; photo_url: string; signature_url: string },
  items: { bike_type: string; quantity: number }[]
) {
  try {
    const rows = items.filter((i) => Number(i.quantity) > 0);
    if (rows.length === 0) return { success: false, error: "Pilih minimal 1 sepeda." };
    const ts = Date.now();

    const created = await prisma.$transaction(
      rows.map((it, idx) =>
        prisma.bikeRental.create({
          data: {
            rental_no: `BIKE-${ts}-${idx + 1}`,
            room: data.room,
            guest_name: data.guest_name,
            whatsapp: data.whatsapp,
            bike_type: it.bike_type,
            quantity: Math.max(1, Math.floor(Number(it.quantity))),
            duration_days: Math.max(1, Math.floor(Number(data.duration_days) || 1)),
            photo_url: data.photo_url,
            signature_url: data.signature_url,
            status: "PENDING",
          },
        })
      )
    );
    return { success: true, data: created };
  } catch (error: any) {
    console.error("ERROR SUBMIT BIKE BATCH:", error);
    return { success: false, error: error.message };
  }
}

// ---------- 2. Tombol Proses di dashboard: nomor (dan vendor) per unit ----------
export async function processBikeUnits(id: string, data: {
  units: Unit[];
  total_price: number;
  payment_method: string;
  staff_name: string;
}) {
  try {
    const existing = await prisma.bikeRental.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Data sewa tidak ditemukan." };
    if (existing.status === "DONE") return { success: false, error: "Pesanan ini sudah diproses." };

    const qty = Math.max(1, existing.quantity || 1);
    const isElectric = !!existing.bike_type?.includes("Electric");
    const units = cleanUnits(data.units, qty);
    if (units.some((u) => !u.no)) return { success: false, error: "Isi nomor/warna untuk setiap unit." };
    if (!isElectric && units.some((u) => !u.vendor)) return { success: false, error: "Pilih vendor untuk setiap unit." };

    const baseTotal = Number(data.total_price);
    const fee = feeAmount(baseTotal, data.payment_method);
    const grandTotal = baseTotal + fee;
    const unpaid = isUnpaid(data.payment_method);

    // total_price = harga sewa tanpa biaya kartu
    const updated = await prisma.bikeRental.update({
      where: { id },
      data: {
        unit_no: joinNos(units),
        vendor: vendorLabel(units),
        units_detail: units as any,
        total_price: baseTotal,
        payment_method: data.payment_method,
        staff_name: data.staff_name,
        status: "DONE",
      },
    });

    const itemCode = await ensureRentalItem(isElectric);
    const feeCode = fee > 0 ? await ensureFeeItem() : null;
    const staff = await prisma.staff.findFirst({ where: { nama: data.staff_name } });

    await prisma.transaksi.create({
      data: {
        no_transaksi: "TRX-BIKE-" + Date.now(),
        nama_tamu: updated.guest_name || "Bike Guest",
        payment_method: data.payment_method,
        grand_total: grandTotal,
        amount_paid: unpaid ? 0 : grandTotal,
        balance: unpaid ? grandTotal : 0,
        payment_status: unpaid ? "UNPAID" : "PAID",
        room: updated.room || "-",
        staff_id: staff ? staff.staff_id : "STF-DEFAULT",
        notes: `Bike Rental - ${qty} unit (${joinNos(units)}) - ${updated.duration_days} Days`,
        details: {
          create: [
            { item_code: itemCode, qty: 1, duration: updated.duration_days || 1, discount: 0, rate: baseTotal, total: baseTotal },
            ...(feeCode ? [{ item_code: feeCode, qty: 1, duration: 1, discount: 0, rate: fee, total: fee }] : []),
          ],
        },
      },
    });

    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("ERROR PROCESS BIKE UNITS:", error);
    return { success: false, error: error.message };
  }
}

// ---------- 3. Edit: ubah data, tambah unit, perpanjang hari ----------
export async function updateBikeUnits(id: string, data: {
  guest_name: string;
  room: string;
  whatsapp: string;
  bike_type: string;
  duration_days: number;
  quantity: number;
  units: Unit[];
  staff_name: string;
}) {
  try {
    const existing = await prisma.bikeRental.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Data sewa tidak ditemukan." };

    const newQty = Math.max(1, Math.floor(Number(data.quantity) || 1));
    const newDays = Math.max(1, Math.floor(Number(data.duration_days) || 1));
    const oldQty = Math.max(1, existing.quantity || 1);
    const oldDays = Math.max(1, existing.duration_days || 1);
    const units = cleanUnits(data.units, newQty);

    let newTotal: number | undefined;
    let addOnTrx: any = null;

    if (existing.status === "DONE") {
      if (data.bike_type !== existing.bike_type) {
        return { success: false, error: "Jenis sepeda tidak bisa diubah setelah pesanan DONE. Gunakan 'Tambah sepeda lain' untuk menambah jenis lain." };
      }
      const unitDays = newQty * newDays - oldQty * oldDays;
      if (unitDays < 0) {
        return { success: false, error: "Mengurangi unit atau hari pada pesanan yang sudah DONE tidak bisa otomatis. Hapus lalu buat ulang, atau catat penyesuaiannya manual." };
      }
      if (unitDays > 0) {
        const delta = unitDays * bikeDailyRate(data.bike_type);
        const method = existing.payment_method || "Cash";
        const fee = feeAmount(delta, method);
        const grand = delta + fee;
        const unpaid = isUnpaid(method);
        const isElectric = !!data.bike_type?.includes("Electric");
        const itemCode = await ensureRentalItem(isElectric);
        const feeCode = fee > 0 ? await ensureFeeItem() : null;
        const staff = await prisma.staff.findFirst({ where: { nama: existing.staff_name || data.staff_name } });

        addOnTrx = {
          no_transaksi: "TRX-BIKE-ADD-" + Date.now(),
          nama_tamu: data.guest_name || existing.guest_name || "Bike Guest",
          payment_method: method,
          grand_total: grand,
          amount_paid: unpaid ? 0 : grand,
          balance: unpaid ? grand : 0,
          payment_status: unpaid ? "UNPAID" : "PAID",
          room: data.room || existing.room || "-",
          staff_id: staff ? staff.staff_id : "STF-DEFAULT",
          notes: `Tambahan sewa ${data.bike_type} (+${newQty - oldQty} unit, +${newDays - oldDays} hari) - ${existing.rental_no}`,
          details: {
            create: [
              { item_code: itemCode, qty: 1, duration: 1, discount: 0, rate: delta, total: delta },
              ...(feeCode ? [{ item_code: feeCode, qty: 1, duration: 1, discount: 0, rate: fee, total: fee }] : []),
            ],
          },
        };
        newTotal = (existing.total_price || 0) + delta;
      }
    }

    const updated = await prisma.bikeRental.update({
      where: { id },
      data: {
        guest_name: data.guest_name,
        room: data.room,
        whatsapp: data.whatsapp,
        bike_type: data.bike_type,
        duration_days: newDays,
        quantity: newQty,
        unit_no: joinNos(units) || null,
        vendor: vendorLabel(units),
        units_detail: units as any,
        ...(newTotal !== undefined ? { total_price: newTotal } : {}),
      },
    });

    if (addOnTrx) {
      await prisma.transaksi.create({ data: addOnTrx });
      revalidatePath("/");
    }

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("ERROR UPDATE BIKE UNITS:", error);
    return { success: false, error: error.message };
  }
}

// ---------- 4. Edit: tambah sepeda JENIS LAIN (misal tamu sewa sepeda biasa lalu tambah E-Bike) ----------
export async function createBikeCompanion(sourceId: string, bike_type: string, quantity: number) {
  try {
    const src = await prisma.bikeRental.findUnique({ where: { id: sourceId } });
    if (!src) return { success: false, error: "Data sewa asal tidak ditemukan." };

    const created = await prisma.bikeRental.create({
      data: {
        rental_no: `BIKE-${Date.now()}-ADD`,
        room: src.room,
        guest_name: src.guest_name,
        whatsapp: src.whatsapp,
        bike_type,
        quantity: Math.max(1, Math.floor(Number(quantity) || 1)),
        duration_days: src.duration_days,
        photo_url: src.photo_url,
        signature_url: src.signature_url,
        status: "PENDING",
      },
    });
    return { success: true, data: created };
  } catch (error: any) {
    console.error("ERROR CREATE BIKE COMPANION:", error);
    return { success: false, error: error.message };
  }
}