"use server";

import { revalidatePath } from 'next/cache';
import { prisma } from "./db";
import { feeAmount, isUnpaid, laundryPrice } from "./config";

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

export async function saveTransaction(data: {
  guestName: string;
  paymentMethod: string;
  totalAmount: number;
  room: string;
  staffId?: string;
  arrivalDate?: string;      
  checkoutDate?: string;     
  bookingSource?: string;    
  paymentNotes?: string;     
  items: { item_code: string; qty: number; rate: number; total: number }[];
}) {
  try {
    let staffId = data.staffId;
    if (!staffId) {
      const defaultStaff = await prisma.staff.findFirst();
      staffId = defaultStaff ? defaultStaff.staff_id : "STF-DEFAULT";
    }

    const noTransaksi = "TRX-" + Date.now();

    // Pastikan item terdaftar di MasterItem sebelum disimpan ke detail transaksi
    for (const item of data.items) {
      const exists = await prisma.masterItem.findUnique({
        where: { item_code: String(item.item_code) }
      });
      
      if (!exists) {
        await prisma.masterItem.create({
          data: {
            item_code: String(item.item_code),
            item_service: `Product ${item.item_code}`, 
            default_rate: Number(item.rate),           
            category: "CHARGE",                        
            billing_type: "PER_UNIT",                  
            desk: "coffee",
            notes: "Auto-generated",
            active: true
          }
        });
      }
    }

    const baseTotal = Number(data.totalAmount);
    const fee = feeAmount(baseTotal, data.paymentMethod);
    const grandTotal = baseTotal + fee;
    const unpaid = isUnpaid(data.paymentMethod);
    const feeCode = fee > 0 ? await ensureFeeItem() : null;

    const newTransaction = await prisma.transaksi.create({
      data: {
        no_transaksi: noTransaksi,
        nama_tamu: data.guestName,
        payment_method: data.paymentMethod,
        grand_total: grandTotal,
        amount_paid: unpaid ? 0 : grandTotal,
        balance: unpaid ? grandTotal : 0,
        payment_status: unpaid ? "UNPAID" : "PAID",
        room: data.room || "-", 
        staff_id: staffId,
        arrival_date: data.arrivalDate,       
        checkout_date: data.checkoutDate,     
        booking_source: data.bookingSource,   
        notes: data.paymentNotes,             
        
        details: {
          create: [
            ...data.items.map((item) => ({
              item_code: String(item.item_code),
              qty: item.qty,
              duration: 1, 
              rate: item.rate,
              discount: 0,
              total: item.total,
            })),
            ...(feeCode ? [{ item_code: feeCode, qty: 1, duration: 1, rate: fee, discount: 0, total: fee }] : []),
          ],
        },
      },
    });

    // --- FITUR BARU: AUTO-CREATE TUGAS JEMPUT/LAYANAN ---
    const needsPickupTask = data.items.some(item => {
      const n = item.item_code.toLowerCase();
      return n.includes("airport") || n.includes("transfer") || n.includes("boat") || n.includes("deposit");
    });

    if (needsPickupTask && (data.arrivalDate || data.checkoutDate)) {
      await prisma.caseFollowUp.create({
        data: {
          case_no: "TASK-" + Date.now(),
          desk: "Front Office",
          case_type: "Guest Arrival / Transport",
          nama_tamu: data.guestName,
          room: data.room || "-",
          priority: "High",
          status: "OPEN",
          description: `Arrival: ${data.arrivalDate || "-"}. Checkout: ${data.checkoutDate || "-"}. Note: ${data.paymentNotes || "-"}`,
          assigned_to: staffId,
        }
      });
    }
    // ----------------------------------------------------

    revalidatePath('/');
    return { success: true, data: newTransaction };
  } catch (error: any) {
    console.error("DETAIL ERROR PRISMA TRANSAKSI:", error);
    return { success: false, error: error.message || "Gagal menyimpan ke database." };
  }
}

export async function addMasterItem(data: { 
  item_code: string; 
  desk?: string;
  category: string; 
  item_service: string; 
  billing_type: string;
  default_rate: number; 
  notes?: string;
}) {
  try {
    const newItem = await prisma.masterItem.create({
      data: {
        item_code: data.item_code,       
        desk: data.desk || "-",
        category: data.category,
        item_service: data.item_service, 
        billing_type: data.billing_type, 
        default_rate: Number(data.default_rate),
        notes: data.notes || "-",
        active: true,
      },
    });

    revalidatePath('/');
    return { success: true, data: newItem };
  } catch (error: any) {
    console.error("DETAIL ERROR PRISMA MASTER ITEM:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "Item Code sudah digunakan! Silakan buat kode unik lainnya." };
    }
    return { success: false, error: error.message || "Gagal menambah produk ke database." };
  }
}

export async function deleteMasterItem(itemCode: string) {
  try {
    await prisma.masterItem.delete({
      where: { item_code: String(itemCode) },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    try {
      await prisma.masterItem.update({
        where: { item_code: String(itemCode) },
        data: { active: false },
      });

      revalidatePath('/');
      return { success: true };
    } catch (err: any) {
      console.error("DETAIL ERROR PRISMA DELETE MASTER:", err);
      return { success: false, error: err.message || "Gagal menghapus produk." };
    }
  }
}

export async function addStaff(data: { nama: string; posisi: string; shift: string; pin?: string; role?: string }) {
  try {
    const newStaff = await prisma.staff.create({
      data: {
        staff_id: "STF-" + Date.now(), 
        nama: data.nama,
        posisi: data.posisi,
        shift: data.shift || "Morning",
        pin: data.pin,
        role: data.role || "Kasir",
      },
    });
    revalidatePath('/');
    return { success: true, data: newStaff };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteStaff(staffId: any) {
  try {
    await prisma.staff.update({
      where: { staff_id: String(staffId) } as any,
      data: { active: false },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error("DETAIL ERROR PRISMA DELETE STAFF:", error);
    return { success: false, error: error.message || "Gagal menghapus staf dari database." };
  }
}

export async function saveShiftClosing(data: {
  openingCash: number;
  cashSales: number;
  cardSales: number;
  expectedCash: number;
  actualCash: number;
  variance: number;
  shift: string;
}) {
  try {
    const defaultStaff = await prisma.staff.findFirst();
    const staffId = defaultStaff ? defaultStaff.staff_id : "STF-DEFAULT";

    const newClosing = await prisma.shiftClosing.create({
      data: {
        close_no: "CLS-" + Date.now(),
        shift: data.shift || "Morning",
        opening_cash: data.openingCash,
        cash_sales: data.cashSales,
        card_sales: data.cardSales,
        expected_cash: data.expectedCash,
        actual_cash: data.actualCash,
        variance: data.variance,
        staff_id: staffId,
      } as any,
    });

    revalidatePath('/');
    return { success: true, data: newClosing };
  } catch (error: any) {
    console.error("DETAIL ERROR SHIFT CLOSING:", error);
    return { success: false, error: error.message || "Gagal menyimpan shift closing ke database." };
  }
}

export async function saveCaseFollowUp(data: {
  desk: string;
  case_type: string;
  nama_tamu: string;
  room: string;
  priority: string;
  description: string;
  assigned_to: string;
}) {
  try {
    const newCase = await prisma.caseFollowUp.create({
      data: {
        case_no: "CASE-" + Date.now(),
        desk: data.desk,
        case_type: data.case_type,
        nama_tamu: data.nama_tamu,
        room: data.room,
        priority: data.priority,
        status: "OPEN",
        description: data.description,
        assigned_to: data.assigned_to,
      },
    });

    revalidatePath('/');
    return { success: true, data: newCase };
  } catch (error: any) {
    console.error("DETAIL ERROR CASE:", error);
    return { success: false, error: error.message || "Gagal menyimpan tugas." };
  }
}

export async function verifyStaffLogin(pin: string) {
  try {
    const staff = await prisma.staff.findFirst({
      where: { 
        pin: pin,
        active: true 
      },
    });

    if (!staff) {
      return { success: false, error: "PIN salah atau staf tidak ditemukan." };
    }

    return { success: true, data: staff };
  } catch (error: any) {
    console.error("DETAIL ERROR LOGIN:", error);
    return { success: false, error: error.message || "Terjadi kesalahan saat login." };
  }
}

export async function resolveCase(caseNo: string) {
  try {
    await prisma.caseFollowUp.update({
      where: { case_no: caseNo },
      data: { status: "RESOLVED" },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error("DETAIL ERROR RESOLVE CASE:", error);
    return { success: false, error: error.message || "Gagal menyelesaikan tugas." };
  }
}

export async function updateMasterItem(data: {
  item_code: string;
  desk?: string;
  category: string;
  item_service: string;
  billing_type: string;
  default_rate: number;
  notes?: string;
}) {
  try {
    const updatedItem = await prisma.masterItem.update({
      where: { item_code: data.item_code },
      data: {
        desk: data.desk || "-",
        category: data.category,
        item_service: data.item_service,
        billing_type: data.billing_type,
        default_rate: Number(data.default_rate),
        notes: data.notes || "-",
      },
    });

    revalidatePath('/');
    return { success: true, data: updatedItem };
  } catch (error: any) {
    console.error("DETAIL ERROR UPDATE MASTER ITEM:", error);
    return { success: false, error: error.message || "Gagal memperbarui produk." };
  }
}

export async function updateStaff(data: { dbId: string; nama: string; posisi: string; shift: string; pin?: string; role?: string }) {
  try {
    const updatedStaff = await prisma.staff.update({
      where: { staff_id: data.dbId },
      data: {
        nama: data.nama,
        posisi: data.posisi,
        shift: data.shift || "Morning",
        pin: data.pin,
        role: data.role || "Kasir",
      },
    });
    revalidatePath('/');
    return { success: true, data: updatedStaff };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
export async function submitBikeRental(data: {
  room: string;
  guest_name: string;
  whatsapp: string;
  bike_type: string;
  duration_days: number;
  photo_url: string;
  signature_url: string;
}) {
  try {
    const newRental = await prisma.bikeRental.create({
      data: {
        rental_no: "BIKE-" + Date.now(),
        room: data.room,
        guest_name: data.guest_name,
        whatsapp: data.whatsapp,
        bike_type: data.bike_type,
        duration_days: data.duration_days,
        photo_url: data.photo_url,
        signature_url: data.signature_url,
        status: "PENDING"
      }
    });
    return { success: true, data: newRental };
  } catch (error: any) {
    console.error("ERROR SUBMIT BIKE:", error);
    return { success: false, error: error.message };
  }
}
export async function processBikeRental(id: string, data: {
  unit_no: string;
  total_price: number;
  payment_method: string;
  staff_name: string;
}) {
  try {
    const baseTotal = Number(data.total_price);
    const fee = feeAmount(baseTotal, data.payment_method);
    const grandTotal = baseTotal + fee;
    const unpaid = isUnpaid(data.payment_method);

    // 1. Update status sepeda menjadi DONE (total_price = harga sewa tanpa biaya kartu)
    const updated = await prisma.bikeRental.update({
      where: { id },
      data: {
        unit_no: data.unit_no,
        total_price: baseTotal,
        payment_method: data.payment_method,
        staff_name: data.staff_name,
        status: "DONE"
      }
    });

    // 2. Pastikan Master Item "E-BIKE" ada
    const exists = await prisma.masterItem.findUnique({
      where: { item_code: "E-BIKE" }
    });
    if (!exists) {
      await prisma.masterItem.create({
        data: {
          item_code: "E-BIKE", item_service: "E-Bike Rental", default_rate: 0,
          category: "RENTAL", billing_type: "PER_DAY", desk: "bike",
          notes: "Auto-generated", active: true
        }
      });
    }
    const feeCode = fee > 0 ? await ensureFeeItem() : null;

    // 3. Masukkan datanya ke tabel Transaksi utama (sudah termasuk biaya kartu)
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
        notes: `Bike Rental - Unit ${data.unit_no} (${updated.duration_days} Days)`,
        details: {
          create: [
            {
              item_code: "E-BIKE", qty: 1, duration: updated.duration_days || 1, discount: 0,
              rate: baseTotal, total: baseTotal,
            },
            ...(feeCode ? [{ item_code: feeCode, qty: 1, duration: 1, discount: 0, rate: fee, total: fee }] : []),
          ],
        },
      },
    });

    revalidatePath('/');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("ERROR PROCESS BIKE:", error);
    return { success: false, error: error.message };
  }
}

export async function submitLaundryOrder(data: {
  room: string;
  guest_name: string;
  whatsapp: string;
  items_detail: Record<string, number>;
  total_pcs: number;
  notes?: string;
}) {
  try {
    const orderNo = `LND-${Date.now().toString().slice(-6)}`;
    const order = await prisma.laundryOrder.create({
      data: {
        order_no: orderNo,
        room: data.room,
        guest_name: data.guest_name,
        whatsapp: data.whatsapp,
        items_detail: data.items_detail,
        total_pcs: Number(data.total_pcs),
        notes: data.notes || "",
        status: "PENDING",
      },
    });
    return { success: true, data: order };
  } catch (error: any) {
    console.error("Laundry error:", error);
    return { success: false, error: error.message };
  }
}

export async function getLaundryOrders() {
  try {
    const orders = await prisma.laundryOrder.findMany({
      orderBy: { created_at: 'desc' }
    });
    return { success: true, data: orders };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
// Dipakai halaman /laundry/timbang: staf laundry mengisi kg, harga dihitung otomatis di server.
export async function weighLaundryOrder(id: string, data: { weight_kg: number; service_type: string }) {
  try {
    const kg = Number(data.weight_kg);
    if (!kg || kg <= 0) return { success: false, error: "Berat (kg) harus lebih dari 0." };
    const service = data.service_type === "Express" ? "Express" : "Normal";

    const existing = await prisma.laundryOrder.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Pesanan tidak ditemukan." };
    if (existing.status === "DONE") return { success: false, error: "Pesanan sudah selesai diproses, kg tidak bisa diubah." };

    const updated = await prisma.laundryOrder.update({
      where: { id },
      data: { weight_kg: kg, service_type: service, total_price: laundryPrice(kg, service) }
    });

    revalidatePath('/');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("ERROR WEIGH LAUNDRY:", error);
    return { success: false, error: error.message };
  }
}

// Dipakai tombol Done di POS: kg, layanan, dan harga dasar diambil dari hasil timbang.
export async function processLaundryOrder(id: string, data: {
  payment_method: string;
  staff_name: string;
}) {
  try {
    const existing = await prisma.laundryOrder.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Pesanan tidak ditemukan." };
    if (!existing.weight_kg || !existing.total_price) {
      return { success: false, error: "Pesanan ini belum ditimbang. Isi kg dulu di halaman laundry." };
    }

    const baseTotal = Number(existing.total_price);
    const fee = feeAmount(baseTotal, data.payment_method);
    const grandTotal = baseTotal + fee;
    const unpaid = isUnpaid(data.payment_method);

    // 1. Update status pesanan Laundry menjadi DONE (total_price = harga tanpa biaya kartu)
    const updated = await prisma.laundryOrder.update({
      where: { id },
      data: {
        payment_method: data.payment_method,
        staff_name: data.staff_name,
        status: "DONE"
      }
    });

    // 2. Daftarkan kode "LAUNDRY" ke Master Item otomatis jika belum ada
    const itemCode = "SVC-LAUNDRY";
    const exists = await prisma.masterItem.findUnique({
      where: { item_code: itemCode }
    });
    
    if (!exists) {
      await prisma.masterItem.create({
        data: {
          item_code: itemCode,
          item_service: "Laundry Service", 
          default_rate: 0,           
          category: "CHARGE",                        
          billing_type: "PER_UNIT",                  
          desk: "laundry",
          notes: "Auto-generated",
          active: true
        }
      });
    }
    const feeCode = fee > 0 ? await ensureFeeItem() : null;

    // 3. Cari Staff ID kasir yang memproses
    const staff = await prisma.staff.findFirst({
      where: { nama: data.staff_name }
    });
    const staffId = staff ? staff.staff_id : "STF-DEFAULT";

    // 4. MASUKKAN KE DATABASE TRANSAKSI UTAMA AGAR MUNCUL DI REPORT (sudah termasuk biaya kartu)
    await prisma.transaksi.create({
      data: {
        no_transaksi: "TRX-LND-" + Date.now(),
        nama_tamu: updated.guest_name,
        payment_method: data.payment_method,
        grand_total: grandTotal,
        amount_paid: unpaid ? 0 : grandTotal,
        balance: unpaid ? grandTotal : 0,
        payment_status: unpaid ? "UNPAID" : "PAID",
        room: updated.room || "-",
        staff_id: staffId,
        notes: `Laundry ${existing.weight_kg}Kg - ${existing.service_type || "Normal"}`,
        details: {
          create: [
            { item_code: itemCode, qty: 1, duration: 1, rate: baseTotal, discount: 0, total: baseTotal },
            ...(feeCode ? [{ item_code: feeCode, qty: 1, duration: 1, rate: fee, discount: 0, total: fee }] : []),
          ],
        },
      },
    });

    revalidatePath('/');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("ERROR PROCESS LAUNDRY:", error);
    return { success: false, error: error.message };
  }
}
export async function clearAllLaundryOrders() {
  try {
    await prisma.laundryOrder.deleteMany({});
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLaundryGuestInfo(id: string, data: { room: string; guest_name: string; whatsapp: string; notes: string; }) {
  try {
    const updated = await prisma.laundryOrder.update({
      where: { id },
      data: {
        room: data.room,
        guest_name: data.guest_name,
        whatsapp: data.whatsapp,
        notes: data.notes
      }
    });
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}