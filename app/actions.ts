"use server";

import { prisma } from "./db";

export async function saveTransaction(data: {
  guestName: string;
  paymentMethod: string;
  totalAmount: number;
  room: string;
  staffId?: string;
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
            nama_item: `Product ${item.item_code}`,
            harga: Number(item.rate),
            kategori: "General",
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

    return { success: true, data: newTransaction };
  } catch (error: any) {
    console.error("DETAIL ERROR PRISMA TRANSAKSI:", error);
    return { success: false, error: error.message || "Gagal menyimpan ke database." };
  }
}

export async function addMasterItem(data: { nama_item: string; harga: number; kategori: string; desk: string }) {
  try {
    const newItem = await prisma.masterItem.create({
      data: {
        item_code: Date.now().toString(),
        nama_item: data.nama_item,
        harga: Number(data.harga),
        kategori: data.kategori,
        desk: data.desk,
        active: true,
      },
    });
    return { success: true, data: newItem };
  } catch (error: any) {
    console.error("DETAIL ERROR PRISMA MASTER ITEM:", error);
    return { success: false, error: error.message || "Gagal menambah produk ke database." };
  }
}

export async function deleteMasterItem(itemCode: string) {
  try {
    // Menggunakan update untuk menonaktifkan item jika sudah terikat transaksi, 
    // atau delete jika tidak ada relasi.
    await prisma.masterItem.update({
      where: { item_code: String(itemCode) },
      data: { active: false },
    });
    return { success: true };
  } catch (error: any) {
    try {
      // Fallback hapus permanen jika belum ada transaksi terkait
      await prisma.masterItem.delete({
        where: { item_code: String(itemCode) },
      });
      return { success: true };
    } catch (err: any) {
      console.error("DETAIL ERROR PRISMA DELETE MASTER:", err);
      return { success: false, error: err.message || "Gagal menghapus produk karena sudah terikat dengan data transaksi." };
    }
  }
}

export async function addStaff(formData: { nama: string; posisi: string; shift: string; pin?: string }) {
  try {
    const newStaff = await prisma.staff.create({
      data: {
        staff_id: `STF-${Date.now()}`,
        nama: formData.nama,
        posisi: formData.posisi,
        shift: formData.shift || "Morning",
        pin: formData.pin || "1234",
        active: true,
      },
    });
    return { success: true, data: newStaff };
  } catch (error: any) {
    console.error("DETAIL ERROR ADD STAFF:", error);
    return { success: false, error: error.message || "Gagal menambah staf ke database." };
  }
}

export async function deleteStaff(staffId: any) {
  try {
    await prisma.staff.update({
      where: { staff_id: String(staffId) } as any,
      data: { active: false },
    });
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
    return { success: true };
  } catch (error: any) {
    console.error("DETAIL ERROR RESOLVE CASE:", error);
    return { success: false, error: error.message || "Gagal menyelesaikan tugas." };
  }
}