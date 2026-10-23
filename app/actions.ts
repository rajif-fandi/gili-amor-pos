"use server";

import { revalidatePath } from 'next/cache';
import { prisma } from "./db";

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

    const newTransaction = await prisma.transaksi.create({
      data: {
        no_transaksi: noTransaksi,
        nama_tamu: data.guestName,
        payment_method: data.paymentMethod,
        grand_total: Number(data.totalAmount),
        amount_paid: Number(data.totalAmount),
        balance: 0,
        payment_status: "PAID",
        room: data.room || "-", 
        staff_id: staffId,
        arrival_date: data.arrivalDate,       
        checkout_date: data.checkoutDate,     
        booking_source: data.bookingSource,   
        notes: data.paymentNotes,             
        
        details: {
          create: data.items.map((item) => ({
            item_code: String(item.item_code),
            qty: item.qty,
            duration: 1, 
            rate: item.rate,
            discount: 0,
            total: item.total,
          })),
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
    const updated = await prisma.bikeRental.update({
      where: { id },
      data: {
        unit_no: data.unit_no,
        total_price: data.total_price,
        payment_method: data.payment_method,
        staff_name: data.staff_name,
        status: "DONE"
      }
    });
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
  items_detail: Record<string, number>; // Diubah dari 'items' menjadi 'items_detail'
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
        items_detail: data.items_detail, // Dicocokkan dengan schema.prisma
        total_pcs: data.total_pcs,
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