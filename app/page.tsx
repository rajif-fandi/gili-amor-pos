import { prisma } from "./db";
import POSClientApp from "./pos-client";
export const dynamic = 'force-dynamic';

export default async function Page() {
  // 1. Ambil data dari database
  const dbItems = await prisma.masterItem.findMany({ where: { active: true } });
  const dbStaff = await prisma.staff.findMany({ where: { active: true } });
  
  const dbTransaksi = await prisma.transaksi.findMany({
    orderBy: { tanggal: 'desc' },
    include: {
      details: {
        include: { item: true } 
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

  // 2. MENGGUNAKAN NAMA KOLOM BARU SESUAI BLUEPRINT
  const formattedProducts = dbItems.map((item) => ({
    id: item.item_code,
    name: item.item_service,
    price: item.default_rate,
    category: item.category,
    billing_type: item.billing_type,
    notes: item.notes,
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
      items: trx.details.map((d) => ({
        name: d.item?.item_service || d.item_code,
        qty: d.qty,
        price: d.rate,
        total: d.total,
        category: d.item?.category || "CHARGE" // <--- Ini tambahan barunya
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