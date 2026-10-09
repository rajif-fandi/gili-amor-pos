import { prisma } from "./db";
import POSClientApp from "./pos-client";
export const dynamic = 'force-dynamic';

export default async function Page() {
  // 1. Ambil data dari database
  const dbItems = await prisma.masterItem.findMany({ where: { active: true } });
  const dbStaff = await prisma.staff.findMany({ where: { active: true } });
  
  // PERBAIKAN: Ambil transaksi beserta detail rincian barangnya untuk Struk
  const dbTransaksi = await prisma.transaksi.findMany({
    orderBy: { tanggal: 'desc' },
    include: {
      details: {
        include: { item: true } // Mengambil relasi nama barang dari MasterItem
      }
    }
  });

  const dbShiftClosings = await prisma.shiftClosing.findMany({
    orderBy: { tanggal: 'desc' }
  });

  const dbCases = await prisma.caseFollowUp.findMany({
    orderBy: { tanggal: 'desc' },
    include: { staff: true } 
  });

  // 2. Format data agar cocok dengan desain UI
  const formattedProducts = dbItems.map((item) => ({
    id: item.item_code,
    name: item.nama_item,
    price: item.harga,
    category: item.kategori || "Miscellaneous",
    icon: (item.desk as any) || "coffee",
    color: "blue",
  }));

  const formattedStaff = dbStaff.map((s: any) => ({
    dbId: s.staff_id || s.id, 
    initials: s.nama.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
    name: s.nama,
    position: s.posisi,
    shift: s.shift || "Morning",
    status: s.active ? "Active" : "On Leave",
    color: "mint",
  }));

  const formattedTransactions = dbTransaksi.map((trx) => {
    const dateObj = new Date(trx.tanggal);
    const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    
    return {
      id: trx.no_transaksi, 
      receipt: trx.no_transaksi, 
      date: `${dateStr}, ${timeStr}`,
      time: timeStr,
      guest: trx.nama_tamu || "Walk-in Guest",
      room: trx.room || "-",
      method: trx.payment_method,
      status: trx.payment_status,
      total: trx.grand_total, 
      amount: trx.grand_total, 
      // BARU: Format rincian barang yang siap dicetak ke struk
      items: trx.details.map((d) => ({
        name: d.item?.nama_item || d.item_code,
        qty: d.qty,
        price: d.rate,
        total: d.total
      }))
    };
  });

  const formattedCases = dbCases.map((c) => ({
    case_no: c.case_no,
    case_type: c.case_type,
    nama_tamu: c.nama_tamu,
    room: c.room,
    priority: c.priority,
    status: c.status,
    description: c.description,
    staff_name: c.staff?.nama || "Tidak diketahui",
  }));

  // 3. Kirim semua data ke aplikasi POS
  return (
    <POSClientApp 
      initialProducts={formattedProducts} 
      initialStaff={formattedStaff} 
      initialTransactions={formattedTransactions} 
      initialShiftClosings={dbShiftClosings} 
      initialCases={formattedCases} 
    />
  );
}