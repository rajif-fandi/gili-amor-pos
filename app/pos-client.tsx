"use client";
import { useRouter } from "next/navigation";
import { saveTransaction, addMasterItem, deleteMasterItem, updateMasterItem, addStaff, updateStaff, deleteStaff, saveShiftClosing, saveCaseFollowUp, resolveCase, processBikeRental, submitLaundryOrder, processLaundryOrder, deleteLaundryOrder, getBikeRentals, updateBikeRental, deleteBikeRental, setBikeReturned } from "./actions";
import { useMemo, useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import { PAYMENT_METHODS, withFee, feeAmount, feeRate, isCard, methodGroup, laundryPrice, bikeDailyRate, BIKE_VENDORS } from "./config";

type IconName = "home" | "reception" | "rent" | "boat" | "buy" | "reports" | "shift" | "search" | "bell" | "chevron" | "clock" | "bike" | "bed" | "coffee" | "laundry" | "spa" | "car" | "cake" | "utensils" | "cash" | "card" | "transfer" | "room" | "case" | "database" | "staff" | "dive" | "fish" | "camera" | "sun" | "water" | "shirt" | "check" | "printer" | "none" | "dashboard" | "bank" | "download";

function Icon({ name, size = 20, strokeWidth = 1.8 }: { name: IconName; size?: number; strokeWidth?: number; }) {
  if (name === "none") return <div style={{ width: size, height: size }} />;
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-7h6v7" /></>,
    dashboard: <><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></>,
    reception: <><path d="M4 19h16M6 16h12M7 16v-3a5 5 0 0 1 10 0v3" /><path d="M12 8V5M10 5h4" /></>,
    rent: <><circle cx="7" cy="17" r="3" /><circle cx="17" cy="17" r="3" /><path d="m7 17 4-7 3 7M9 10h6M14 17h3l-3-7-1-2h3" /></>,
    boat: <><path d="m3 15 3 5h12l3-5H3ZM7 15V8h10v7M12 8V3l4 3h-4" /></>,
    buy: <><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 10V7a3 3 0 0 1 6 0v3" /></>,
    reports: <><path d="M5 20V10h4v10M10 20V4h4v16M15 20v-7h4v7M3 20h18" /></>,
    shift: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2M8 3 5 3" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    chevron: <path d="m8 10 4 4 4-4" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    bike: <><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="m6 17 4-7 4 7M9 11h6M14 17h4l-4-7-1-2h3" /></>,
    bed: <><path d="M3 19v-8M21 19v-5a3 3 0 0 0-3-3H8a5 5 0 0 0-5 5v1h18" /><path d="M7 11V7h5a3 3 0 0 1 3 3v1" /></>,
    coffee: <><path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z" /><path d="M17 11h2a2 2 0 0 1 0 4h-2M7 5v1M11 4v2M15 5v1" /></>,
    laundry: <><rect x="5" y="3" width="14" height="18" rx="2" /><circle cx="12" cy="14" r="4" /><path d="M8 7h.01M11 7h5" /></>,
    spa: <><path d="M12 21c-5-3-7-7-5-11 3 0 5 2 5 5 0-5 2-8 5-10 2 4 1 8-2 11" /><path d="M5 14c-1 0-2 .5-3 1 2 4 6 6 10 6 4 0 8-2 10-6-2-1-4-1-6 0" /></>,
    car: <><path d="m5 16 1-5 2-4h8l2 4 1 5H5Z" /><path d="M3 13h2M19 13h2M7 16v3M17 16v3M8 13h.01M16 13h.01" /></>,
    cake: <><path d="M5 11h14v9H5zM4 15h16M12 4v4M9 8h6" /><path d="M12 4c1-1 1-2 0-3-1 1-1 2 0 3Z" /></>,
    utensils: <><path d="M7 3v7M4 3v4a3 3 0 0 0 6 0V3M7 10v11M16 3v18M16 3c3 2 4 5 4 8h-4" /></>,
    cash: <><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="3" /><path d="M7 9H6v1M17 15h1v-1" /></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></>,
    bank: <><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" /></>,
    transfer: <><path d="M5 8h14M16 5l3 3-3 3M19 16H5M8 13l-3 3 3 3" /></>,
    room: <><path d="M5 21V4h13v17M9 21V8h5v13M3 21h18" /><path d="M11 14h.01" /></>,
    case: <><path d="M8 4h8M9 3h6v3H9zM7 5H5v16h14V5h-2" /><path d="m8 13 2 2 5-5M8 9h2" /></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" /></>,
    staff: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1" /></>,
    dive: <><path d="M3 10h7v4a3 3 0 0 1-6 0v-4ZM14 10h7v4a3 3 0 0 1-6 0v-4ZM10 11h4" /><path d="M6 7c3-2 9-2 12 0M12 17v3M9 20h6" /></>,
    fish: <><path d="M4 12c3-5 8-7 14-3l3-3v12l-3-3c-6 4-11 2-14-3Z" /><path d="M4 12 2 9v6l2-3ZM15 10h.01" /></>,
    camera: <><path d="M5 8h3l2-3h4l2 3h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" /><circle cx="12" cy="14" r="4" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    water: <><path d="M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13Z" /><path d="M9 16a3 3 0 0 0 3 2" /></>,
    shirt: <><path d="m8 4-5 3 3 5 2-1v10h8V11l2 1 3-5-5-3a4 4 0 0 1-8 0Z" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    printer: <><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>
  };
  return <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 24 24" width={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}>{paths[name]}</svg>;
}

const formatIDR = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

const globalPrintStyle = `
  .hide-on-screen { display: none !important; }
  @media print {
    body * { visibility: hidden; }
    .print-area { display: block !important; position: absolute; left: 0; top: 0; width: 100%; padding: 40px; font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a; visibility: visible; }
    .print-area * { visibility: visible; }
    .hide-on-print { display: none !important; }
    .print-area h2 { text-align: center; font-size: 24px; margin-top: 0; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 2px solid #0f172a; text-transform: uppercase; letter-spacing: 1px; }
    .print-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
    .print-table th { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; border: 1px solid #cbd5e1; padding: 14px 12px; font-size: 13px; text-align: left; text-transform: uppercase; font-weight: bold; }
    .print-table td { border: 1px solid #cbd5e1; padding: 12px; font-size: 13px; vertical-align: top; }
  }
`;

function ReceiptModal({ transaction, onClose }: { transaction: any, onClose: () => void }) {
  if (!transaction) return null;
  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-receipt, #printable-receipt * { visibility: visible; }
          #printable-receipt { position: absolute; left: 0; top: 0; width: 80mm; margin: 0; padding: 5mm; font-family: monospace; color: #000; }
          .hide-on-print { display: none !important; }
        }
      `}</style>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '380px', color: '#0f172a', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
          <div className="hide-on-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Receipt Preview</h3><button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>×</button>
          </div>
          <div id="printable-receipt" style={{ flex: 1, overflowY: 'auto', border: '1px dashed #ccc', padding: '20px', backgroundColor: '#fafafa', fontSize: '13px' }}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #666', paddingBottom: '12px', marginBottom: '12px' }}>
              <strong style={{ fontSize: '18px' }}>GILI AMOR</strong><div style={{ fontSize: '12px' }}>Boutique Resort</div>
            </div>
            <div style={{ marginBottom: '12px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Receipt No:</span> <span>{transaction.receipt}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Date:</span> <span>{transaction.date}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Guest:</span> <span>{transaction.guest}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Method:</span> <span>{transaction.method}</span></div>
              {transaction.bookingSource && transaction.bookingSource !== "-" && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Source:</span> <span>{transaction.bookingSource}</span></div>}
            </div>
            <div style={{ borderTop: '1px dashed #666', borderBottom: '1px dashed #666', padding: '12px 0', marginBottom: '12px' }}>
              {transaction.items && transaction.items.map((item: any, idx: number) => (
                <div key={idx} style={{ marginBottom: '8px' }}>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{item.qty} x {item.price.toLocaleString("id-ID")}</span><span>{item.total.toLocaleString("id-ID")}</span></div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', marginBottom: '24px' }}><span>TOTAL</span><span>{formatIDR(transaction.total)}</span></div>
            <div style={{ textAlign: 'center', fontSize: '11px', marginTop: '20px' }}><p>Thank you for choosing Gili Amor!</p></div>
          </div>
          <div className="hide-on-print" style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button onClick={onClose} style={{ flex: 1, padding: '10px', background: '#f1f5f9', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
            <button onClick={() => window.print()} style={{ flex: 2, padding: '10px', background: '#10b981', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}><Icon name="printer" size={16} /> Print</button>
          </div>
        </div>
      </div>
    </>
  );
}

const navItems = [
  { label: "Launchpad", icon: "home" as IconName, roles: ["Admin", "Kasir"] },
  { label: "Dashboard", icon: "dashboard" as IconName, roles: ["Admin"] },
  { label: "Reception", icon: "reception" as IconName, roles: ["Admin", "Kasir"] },
  { label: "Rent", icon: "rent" as IconName, roles: ["Admin", "Kasir"] },
  { label: "Boat", icon: "boat" as IconName, roles: ["Admin", "Kasir"] },
  { label: "Buy", icon: "buy" as IconName, roles: ["Admin", "Kasir"] },
  { label: "Bike Dashboard", icon: "bike" as IconName, roles: ["Admin", "Kasir"] },
  { label: "Laundry Dashboard", icon: "laundry" as IconName, roles: ["Admin", "Kasir"] },
  { label: "Case / Follow-up", icon: "case" as IconName, roles: ["Admin", "Kasir"] },
  { label: "Payment Database", icon: "database" as IconName, roles: ["Admin"] },
  { label: "Case Report", icon: "reports" as IconName, roles: ["Admin"] },
  { label: "Reports", icon: "reports" as IconName, roles: ["Admin"] },
  { label: "Shift Closing", icon: "shift" as IconName, roles: ["Admin", "Kasir"] },
  { label: "Master Data", icon: "database" as IconName, roles: ["Admin"] },
  { label: "Staff", icon: "staff" as IconName, roles: ["Admin"] },
];


// =========================================================================================
// NEW LAUNDRY DASHBOARD CONTENT - FULLY FUNCTIONAL (FILTER, EDIT, CLEAR)
// =========================================================================================
function LaundryDashboardContent({ staffList = [] }: { staffList?: any[] }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // -- AUTO SAVE LOCAL STORAGE LAUNDRY --
  const [edits, setEdits] = useState<Record<string, any>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gili_laundry_drafts");
      if (saved) return JSON.parse(saved);
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem("gili_laundry_drafts", JSON.stringify(edits));
  }, [edits]);
  // -------------------------------------

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterPayment, setFilterPayment] = useState("All Payment");
  const [editModal, setEditModal] = useState<any>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/laundry-orders').then(r => r.json()).catch(() => null);
      if (res && res.success) setOrders(res.data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const silentRefresh = async () => {
    try {
      const res = await fetch('/api/laundry-orders').then(r => r.json()).catch(() => null);
      if (res && res.success) setOrders(res.data || []);
    } catch (e) { }
  };

  useEffect(() => {
    fetchOrders();
    const timer = setInterval(() => { if (!document.hidden) silentRefresh(); }, 20000);
    return () => clearInterval(timer);
  }, []);

  const handleDelete = async (order: any) => {
    const warn = order.status === "DONE" ? "\n\nPesanan ini sudah DONE. Catatan transaksinya di laporan keuangan TIDAK ikut terhapus." : "";
    if (!confirm(`Hapus pesanan laundry Room ${order.room} - ${order.guest_name}?${warn}`)) return;
    const res = await deleteLaundryOrder(order.id);
    if (res && res.success) setOrders((prev) => prev.filter((o) => o.id !== order.id));
    else alert("Gagal menghapus: " + (res?.error || "Unknown error"));
  };

  const filteredOrders = orders.filter((o) => {
    const oDate = new Date(o.created_at);
    if (filterPayment !== "All Payment") {
      const method = o.payment_method || "Cash";
      if (method !== filterPayment) return false;
    }
    if (startDate) {
      const sDate = new Date(startDate);
      sDate.setHours(0, 0, 0, 0);
      if (oDate < sDate) return false;
    }
    if (endDate) {
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);
      if (oDate > eDate) return false;
    }
    return true;
  });

  const handleEditChange = (id: string, field: string, value: any) => {
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleProcess = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    const data = edits[orderId] || {};
    if (!order?.weight_kg) return alert("Pesanan ini belum ditimbang. Berat (kg) diisi oleh tim laundry di halaman laundry.");
    if (!data.staff_name) return alert("PENTING: Pilih FO sebelum klik Done!");

    const service = data.service_type || 'Normal';
    const method = data.payment_method || 'Cash';
    const finalPrice = withFee(laundryPrice(order.weight_kg, service), method);
    
    if (confirm(`Proses pesanan laundry ini ke laporan keuangan pusat?\n\nLayanan: ${service} (${order.weight_kg} Kg)\nTotal bayar: ${formatIDR(finalPrice)} (${method})`)) {
      const res = await processLaundryOrder(orderId, { service_type: service, payment_method: method, staff_name: data.staff_name });
      if (res && res.success) {
        alert("Pesanan berhasil diproses dan masuk ke Report!");
        // Hapus dari draft karena sudah selesai
        setEdits(prev => { const next = {...prev}; delete next[orderId]; return next; });
        fetchOrders(); 
      } else alert("Gagal memproses pesanan: " + (res?.error || "Unknown Error"));
    }
  };

  const handleClearData = async () => {
    if (confirm("⚠️ PERINGATAN BAPAK MANAJER: Anda yakin ingin menghapus SEMUA data laundry? Aksi ini tidak dapat dibatalkan!")) {
      const res = await (await import('./actions')).clearAllLaundryOrders();
      if (res.success) { alert("Semua data laundry berhasil dikosongkan."); fetchOrders(); } 
      else alert("Gagal menghapus data.");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await (await import('./actions')).updateLaundryGuestInfo(editModal.id, {
      room: editModal.room, guest_name: editModal.guest_name, whatsapp: editModal.whatsapp, notes: editModal.notes
    });
    if (res.success) { alert("Info tamu berhasil diubah!"); setEditModal(null); fetchOrders(); } 
    else alert("Gagal mengubah data.");
  };

  const exportExcel = () => {
    const dataToExport = filteredOrders.map((r, index) => ({
      No: index + 1, Kamar: r.room, Tamu: r.guest_name, WhatsApp: r.whatsapp,
      TotalPcs: r.total_pcs, BeratKg: r.weight_kg || "-", Layanan: r.service_type || "-",
      TotalHarga: r.total_price ? withFee(r.total_price, r.payment_method) : "-", MetodeBayar: r.payment_method || "-",
      Status: r.status, Staf: r.staff_name || "-", Tanggal: new Date(r.created_at).toLocaleString('id-ID')
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LaundryData");
    XLSX.writeFile(wb, `Laundry_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <section className="workspace-screen">
      {editModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '400px', color: '#0f172a' }}>
            <h3 style={{ marginBottom: '16px' }}>Edit Info Tamu (Laundry)</h3>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label>Kamar<input required value={editModal.room} onChange={e => setEditModal({...editModal, room: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} /></label>
              <label>Nama Tamu<input required value={editModal.guest_name} onChange={e => setEditModal({...editModal, guest_name: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} /></label>
              <label>WhatsApp<input required value={editModal.whatsapp} onChange={e => setEditModal({...editModal, whatsapp: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} /></label>
              <label>Catatan<input value={editModal.notes} onChange={e => setEditModal({...editModal, notes: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} /></label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setEditModal(null)} style={{ padding: '8px 16px', background: '#e2e8f0', border: 'none', borderRadius: '4px' }}>Batal</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="workspace-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#15803d', fontSize: '24px', fontWeight: 'bold' }}>Giliamor Laundry List</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleClearData} style={{ padding: '8px 16px', background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>⚠ Kosongkan Data</button>
          <button onClick={exportExcel} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><Icon name="download" size={16} /> Export Excel</button>
        </div>
      </header>

      <div className="workspace-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end', background: '#fff', padding: '16px 24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155', display: 'flex', flexDirection: 'column' }}>DARI TANGGAL:<input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ marginTop: '4px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} /></label>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155', display: 'flex', flexDirection: 'column' }}>SAMPAI TANGGAL:<input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ marginTop: '4px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} /></label>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155', display: 'flex', flexDirection: 'column' }}>METODE BAYAR:<select value={filterPayment} onChange={e => setFilterPayment(e.target.value)} style={{ marginTop: '4px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}><option value="All Payment">All Payment</option>{PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}</select></label>
          <button onClick={() => { setStartDate(""); setEndDate(""); setFilterPayment("All Payment"); }} style={{ padding: '10px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', height: '36px' }}>Reset Filter</button>
        </div>

        <div style={{ width: '100%', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#374151', color: '#ffffff', textAlign: 'left' }}>
                <th style={{ padding: '16px 12px', borderBottom: '1px solid #475569' }}>No</th><th style={{ padding: '16px 12px', borderBottom: '1px solid #475569' }}>Kamar</th><th style={{ padding: '16px 12px', borderBottom: '1px solid #475569' }}>Nama Tamu</th><th style={{ padding: '16px 12px', borderBottom: '1px solid #475569' }}>WhatsApp</th><th style={{ padding: '16px 12px', borderBottom: '1px solid #475569' }}>Rincian Pakaian</th><th style={{ padding: '16px 12px', borderBottom: '1px solid #475569' }}>Total Pcs</th><th style={{ padding: '16px 12px', borderBottom: '1px solid #475569' }}>Catatan</th><th style={{ padding: '16px 12px', borderBottom: '1px solid #475569' }}>Berat (Kg)</th><th style={{ padding: '16px 12px', borderBottom: '1px solid #475569' }}>Layanan</th><th style={{ padding: '16px 12px', borderBottom: '1px solid #475569' }}>Total Harga</th><th style={{ padding: '16px 12px', borderBottom: '1px solid #475569' }}>Status</th><th style={{ padding: '16px 12px', borderBottom: '1px solid #475569' }}>Bayar</th><th style={{ padding: '16px 12px', borderBottom: '1px solid #475569' }}>Waktu</th><th style={{ padding: '16px 12px', borderBottom: '1px solid #475569' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={14} style={{ textAlign: 'center', padding: '30px' }}>Memuat data...</td></tr> : filteredOrders.length === 0 ? <tr><td colSpan={14} style={{ textAlign: 'center', padding: '30px' }}>Tidak ada data yang sesuai filter.</td></tr> : filteredOrders.map((order, index) => {
                const isDone = order.status === "DONE";
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid #e2e8f0', background: isDone ? '#f0fdf4' : '#fff' }}>
                    <td style={{ padding: '16px 12px', color: '#64748b' }}>{index + 1}</td>
                    <td style={{ padding: '16px 12px' }}><span style={{ background: '#f59e0b', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{order.room}</span></td>
                    <td style={{ padding: '16px 12px', color: '#334155' }}>{order.guest_name}</td>
                    <td style={{ padding: '16px 12px' }}><a href={`https://wa.me/${order.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 'bold' }}>{order.whatsapp}</a></td>
                    <td style={{ padding: '16px 12px', fontSize: '11px', color: '#475569', lineHeight: '1.4' }}>{order.items_detail && typeof order.items_detail === 'object' ? Object.entries(order.items_detail).map(([k,v]) => `${k}: ${v}`).join(', ') : '-'}</td>
                    <td style={{ padding: '16px 12px', fontWeight: 'bold', color: '#0f172a' }}>{order.total_pcs} Pcs</td>
                    <td style={{ padding: '16px 12px', color: '#475569', fontSize: '11px' }}>{order.notes || '-'}</td>
                    <td style={{ padding: '16px 12px' }}>{order.weight_kg ? <strong>{order.weight_kg} Kg</strong> : <span style={{ fontSize: '11px', color: '#b45309', fontWeight: 'bold' }}>Belum ditimbang</span>}</td>
                    <td style={{ padding: '16px 12px' }}>
                      {isDone ? <span>{order.service_type || '-'}</span> : (
                        <select value={edits[order.id]?.service_type || 'Normal'} onChange={e => handleEditChange(order.id, 'service_type', e.target.value)} style={{ padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                          <option value="Normal">Normal</option><option value="Express">Express</option>
                        </select>
                      )}
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      {(() => {
                        const method = isDone ? order.payment_method : (edits[order.id]?.payment_method || 'Cash');
                        const base = isDone ? (order.total_price || 0) : (order.weight_kg ? laundryPrice(order.weight_kg, edits[order.id]?.service_type || 'Normal') : 0);
                        if (!base) return <span style={{ color: '#94a3b8' }}>-</span>;
                        return (
                          <><strong>{formatIDR(withFee(base, method))}</strong>{feeRate(method) > 0 && (<div style={{ fontSize: '10px', color: '#b45309' }}>+ biaya {formatIDR(feeAmount(base, method))}</div>)}</>
                        );
                      })()}
                    </td>
                    <td style={{ padding: '16px 12px', color: isDone ? '#16a34a' : '#64748b', fontWeight: 'bold' }}>{order.status}</td>
                    <td style={{ padding: '16px 12px' }}>
                      {isDone ? <span>{order.payment_method}</span> : (
                        <select value={edits[order.id]?.payment_method || 'Cash'} onChange={e => handleEditChange(order.id, 'payment_method', e.target.value)} style={{ padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                          {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      )}
                    </td>
                    <td style={{ padding: '16px 12px', color: '#475569', fontSize: '11px' }}>{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                    <td style={{ padding: '16px 12px', verticalAlign: 'middle', minWidth: '120px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {isDone ? (<span style={{ fontSize: '11px', fontWeight: 'bold', color: '#16a34a' }}>✓ {order.staff_name}</span>) : (
                        <>
                          <button onClick={() => handleProcess(order.id)} style={{ padding: '4px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>Done</button>
                          <button onClick={() => setEditModal(order)} style={{ padding: '4px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>Edit</button>
                          <select value={edits[order.id]?.staff_name || ''} onChange={e => handleEditChange(order.id, 'staff_name', e.target.value)} style={{ padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '10px' }}>
                            <option value="">FO</option>{staffList.map(s => <option key={s.dbId} value={s.name}>{s.name}</option>)}
                          </select>
                        </>
                      )}
                      <button onClick={() => handleDelete(order)} style={{ padding: '4px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>Hapus</button>
                    </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}


function DashboardAnalytics({ transactions = [], cases = [] }: { transactions?: any[], cases?: any[] }) {
  const [period, setPeriod] = useState("Daily");
  const filteredTx = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      const txDate = new Date(t.rawDate);
      if (period === "Daily") return txDate.toDateString() === now.toDateString();
      if (period === "Weekly") {
        const lastWeek = new Date();
        lastWeek.setDate(now.getDate() - 7);
        return txDate >= lastWeek && txDate <= now;
      }
      if (period === "Monthly") return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      return true;
    });
  }, [transactions, period]);

  const catData = useMemo(() => {
    let rent = 0, boat = 0, buy = 0, charge = 0;
    filteredTx.forEach(t => {
      t.items?.forEach((i:any) => {
        if(i.category === "RENTAL") rent += i.total;
        else if(i.category === "ACTIVITY" || i.category === "TRANSFER") boat += i.total;
        else if(i.category === "RETAIL") buy += i.total;
        else charge += i.total;
      });
    });
    return [
      { name: 'Room/Charge', value: charge },
      { name: 'Rent', value: rent },
      { name: 'Boat/Act', value: boat },
      { name: 'Buy/Retail', value: buy },
    ].filter(d => d.value > 0);
  }, [filteredTx]);

  const paymentBarData = useMemo(() => {
    const methods = { Cash: 0, Card: 0, "Bank Transfer": 0, "Room Charge": 0, Unpaid: 0 };
    filteredTx.forEach(t => {
      const group = methodGroup(t.method);
      if (methods.hasOwnProperty(group)) {
        methods[group as keyof typeof methods] += (t.amount || 0);
      }
    });
    return Object.entries(methods).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  }, [filteredTx]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
  const todaysGuests = Array.from(new Set(filteredTx.filter(t => t.room !== "-").map(t => `${t.guest} (Room ${t.room})`)));
  const openCases = cases.filter(c => c.status === "OPEN");

  return (
    <section className="workspace-screen">
      <header className="workspace-header">
        <div><p className="eyebrow">ANALYTICS</p><h1>Manager Dashboard</h1></div>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>
          <option value="Daily">Daily Report</option><option value="Weekly">Weekly Report</option><option value="Monthly">Monthly Report</option>
        </select>
      </header>
      <div className="workspace-content" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '340px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '15px' }}>Category Revenue Distribution ({period})</h3>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({name, percent}) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}>
                  {catData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: any) => `Rp ${Number(value).toLocaleString('id-ID')}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '340px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '15px' }}>Payment Method Breakdown ({period})</h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={paymentBarData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(val) => `Rp${val/1000}k`} tick={{ fontSize: 11 }} width={60} />
                <Tooltip formatter={(value: any) => `Rp ${Number(value).toLocaleString('id-ID')}`} />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]}>
                  {paymentBarData.map((entry, index) => <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', maxHeight: '340px', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '15px' }}>In-House Guest ({period})</h3>
            {todaysGuests.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {todaysGuests.map((g, i) => <li key={i} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px', fontWeight: 600 }}>{g}</li>)}
              </ul>
            ) : <p style={{ fontSize: '13px', color: '#64748b' }}>Belum ada tamu aktif.</p>}
          </div>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', maxHeight: '350px', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}><Icon name="clock" size={18} /> Agenda & Task (OPEN)</h3>
            {openCases.length > 0 ? openCases.map((c: any) => (
              <div key={c.case_no} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '10px', borderLeft: `4px solid ${c.priority === 'High' ? '#ef4444' : '#3b82f6'}` }}>
                <strong style={{ fontSize: '13px', display: 'block' }}>{c.case_type} - Room {c.room}</strong>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Assigned: {c.staff_name}</span>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>"{c.description}"</p>
              </div>
            )) : <p style={{ fontSize: '13px', color: '#64748b' }}>Semua tugas selesai.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeDashboard({ onLaunch, transactions = [], cases = [] }: { onLaunch: (page: string) => void, transactions?: any[], cases?: any[] }) {
  const router = useRouter();
  const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const todaysTransactions = transactions.filter((t: any) => t.date && t.date.includes(todayStr));
  const transportTasks = cases.filter((c: any) => c.status === "OPEN" && c.case_type === "Guest Arrival / Transport");

  const handleResolveTask = async (caseNo: string) => {
    if(confirm("Tandai jadwal penjemputan/layanan ini SELESAI?")) {
      const result = await resolveCase(caseNo);
      
    }
  };

  return (
    <section className="workspace-screen">
      <header className="workspace-header"><div><p className="eyebrow">GILI AMOR RESORT</p><h1>Launchpad</h1><p className="header-subtitle">Welcome back! Choose an application.</p></div></header>
      <div className="workspace-content">
        <div className="launchpad-grid">
          {navItems.filter(n => n.label !== "Launchpad" && n.label !== "Dashboard").map((item) => (
            <button className="launchpad-card" key={item.label} onClick={() => onLaunch(item.label)}>
              <span className={`launchpad-icon blue`}><Icon name={item.icon} size={27} /></span>
              <strong>{item.label}</strong>
              <span className="launch-arrow">→</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '30px' }}>
          <section className="activity-panel">
            <div className="panel-heading"><div><h2>Recent Activities Detail</h2></div></div>
            <div className="activity-list">
              {todaysTransactions.slice(0, 10).map((trx: any, index) => (
                <div className="activity-row" key={index}>
                  <div className={`activity-icon blue`}><Icon name="reception" size={20} /></div>
                  <div className="activity-main">
                    <strong>{trx.guest} (Room {trx.room})</strong>
                    <span style={{ fontSize: '11px' }}>
                      {trx.items?.map((i:any) => `${i.qty}x ${i.name}`).join(', ')} 
                      {trx.notes && trx.notes !== "-" && ` | Note: ${trx.notes}`}
                    </span>
                  </div>
                  <strong className="activity-amount">{formatIDR(trx.amount)}</strong>
                </div>
              ))}
            </div>
          </section>
          <section className="activity-panel" style={{ border: '1px solid #fde68a', background: '#fffbeb' }}>
            <div className="panel-heading"><div><h2 style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '8px' }}><Icon name="bell" size={18} /> Arrival & Transport Alerts</h2></div></div>
            <div className="activity-list" style={{ padding: '16px' }}>
              {transportTasks.length > 0 ? transportTasks.map((t: any) => (
                <div key={t.case_no} style={{ background: '#fff', padding: '12px', borderRadius: '8px', marginBottom: '12px', borderLeft: '4px solid #f59e0b', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>{t.nama_tamu} (Room {t.room})</strong>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0' }}>{t.description}</p>
                  </div>
                  <button onClick={() => handleResolveTask(t.case_no)} style={{ padding: '8px 12px', background: '#10b981', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><Icon name="check" size={14} /> Selesai</button>
                </div>
              )) : <p style={{ fontSize: '13px', color: '#d97706' }}>Belum ada jadwal penjemputan/layanan yang terbuka.</p>}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function ReportsDashboard({ transactions = [] }: { transactions?: any[] }) {
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const displayRows = transactions.filter((t: any) => t.date && t.date.includes(todayStr));
  
  const totalCash = displayRows.filter((t) => t.method === "Cash").reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalCard = displayRows.filter((t) => isCard(t.method)).reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalRoomCharge = displayRows.filter((t) => t.method === "Room Charge").reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalBank = displayRows.filter((t) => t.method === "Bank Transfer").reduce((sum, t) => sum + (t.amount || 0), 0);

  const exportExcel = () => {
    const dataToExport = displayRows.map(r => ({
      ID: r.id, Date: r.date, Guest: r.guest, Room: r.room, Method: r.method, 
      Items: r.items?.map((i:any) => `${i.qty}x ${i.name} (${i.category})`).join(', '),
      Total: r.amount
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DailyReport");
    XLSX.writeFile(wb, `Daily_Report_${todayStr}.xlsx`);
  };

  return (
    <section className="workspace-screen">
      <style>{globalPrintStyle}</style>
      {selectedReceipt && <ReceiptModal transaction={selectedReceipt} onClose={() => setSelectedReceipt(null)} />}
      <div className="print-area hide-on-screen">
        <h2>Daily Payment Report - {todayStr}</h2>
        <table className="print-table">
          <thead><tr><th>Time</th><th>Receipt</th><th>Guest</th><th>Method</th><th>Items Detail (Rent/Boat/etc)</th><th>Total</th></tr></thead>
          <tbody>
            {displayRows.map(row => (
              <tr key={row.id}>
                <td>{row.time}</td><td>{row.receipt}</td><td>{row.guest}</td><td>{row.method}</td>
                <td>{row.items?.map((i:any) => `${i.qty}x ${i.name} [${i.category}]`).join(', ')}</td>
                <td>{formatIDR(row.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <header className="workspace-header reports-header hide-on-print">
        <div><p className="eyebrow">FINANCIAL OVERVIEW</p><h1>Daily Payment Report</h1></div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={exportExcel} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#10b981', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}><Icon name="download" size={16} /> Excel</button>
          <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#3b82f6', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}><Icon name="printer" size={16} /> Print All</button>
        </div>
      </header>
      <div className="workspace-content hide-on-print">
        <div className="report-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <article className="report-metric-card" style={{ padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}><div className="metric-icon mint" style={{ marginBottom: '12px' }}><Icon name="cash" size={23} /></div><div><p style={{ fontSize: '12px', color: '#64748b' }}>Total Cash</p><strong style={{ display: 'block', fontSize: '18px', marginTop: '4px' }}>{formatIDR(totalCash)}</strong></div></article>
          <article className="report-metric-card" style={{ padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}><div className="metric-icon blue" style={{ marginBottom: '12px' }}><Icon name="card" size={23} /></div><div><p style={{ fontSize: '12px', color: '#64748b' }}>Total Card</p><strong style={{ display: 'block', fontSize: '18px', marginTop: '4px' }}>{formatIDR(totalCard)}</strong></div></article>
          <article className="report-metric-card" style={{ padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}><div className="metric-icon sand" style={{ marginBottom: '12px' }}><Icon name="room" size={23} /></div><div><p style={{ fontSize: '12px', color: '#64748b' }}>Total Room Charge</p><strong style={{ display: 'block', fontSize: '18px', marginTop: '4px' }}>{formatIDR(totalRoomCharge)}</strong></div></article>
          <article className="report-metric-card" style={{ padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}><div className="metric-icon" style={{ marginBottom: '12px', background: '#e0e7ff', color: '#4f46e5' }}><Icon name="bank" size={23} /></div><div><p style={{ fontSize: '12px', color: '#64748b' }}>Bank Transfer</p><strong style={{ display: 'block', fontSize: '18px', marginTop: '4px' }}>{formatIDR(totalBank)}</strong></div></article>
        </div>
        <section className="report-table-panel">
          <div className="panel-heading"><div><h2>Payment Transactions (Today)</h2></div></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Time</th><th>Receipt No</th><th>Guest Name</th><th>Method</th><th>Items Detail (Rent/Boat/etc)</th><th>Total</th><th>Action</th></tr></thead>
              <tbody>
                {displayRows.map((row) => (
                  <tr key={row.receipt || row.id}>
                    <td>{row.time}</td><td><strong>{row.receipt}</strong></td><td>{row.guest} <br/><small>Room {row.room}</small></td>
                    <td><span className={`payment-badge ${row.method === "Cash" ? "cash" : "card"}`}>{row.method}</span></td>
                    <td style={{ maxWidth: '250px' }}>
                      <div style={{ fontSize: '12px', color: '#475569' }}>
                        {row.items?.map((i:any, idx:number) => <div key={idx}>{i.qty}x {i.name} <span style={{color:'#94a3b8'}}>[{i.category}]</span></div>)}
                      </div>
                    </td>
                    <td><strong>{formatIDR(row.amount)}</strong></td>
                    <td><button onClick={() => setSelectedReceipt(row)} style={{ padding: '6px 12px', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Print</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}

function CasesDashboard({ staffList = [], cases = [] }: { staffList?: any[], cases?: any[] }) {
  const router = useRouter(); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ desk: "Front Office", case_type: "Maintenance", nama_tamu: "", room: "", priority: "Medium", description: "", assigned_to: staffList.length > 0 ? staffList[0].dbId : "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assigned_to) return alert("Pilih staf yang bertugas!");
    setIsSubmitting(true);
    const result = await saveCaseFollowUp(formData);
    if (result.success) { alert("Tugas berhasil ditambahkan!"); } 
    else alert("Gagal menyimpan: " + result.error);
    setIsSubmitting(false);
  };

  const handleResolve = async (caseNo: string) => {
    if (confirm("Tandai tugas ini selesai?")) {
      const result = await resolveCase(caseNo);
      
    }
  };

  return (
    <section className="workspace-screen">
      <header className="workspace-header"><div><p className="eyebrow">OPERATIONS</p><h1>Case & Follow-up</h1></div></header>
      <div className="workspace-content" style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 2fr', alignItems: 'start' }}>
        <section className="report-table-panel" style={{ padding: '24px' }}>
          <h2>Buat Tugas Baru</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <label><span style={{ fontSize: '12px', fontWeight: 600 }}>Tipe Case</span><select value={formData.case_type} onChange={(e) => setFormData({...formData, case_type: e.target.value})} style={{ width: '100%', padding: '8px' }}><option value="Maintenance">Maintenance</option><option value="Housekeeping">Housekeeping</option><option value="Room Service">Room Service</option><option value="Transport">Transport</option></select></label>
            <label><span style={{ fontSize: '12px', fontWeight: 600 }}>Nama Tamu / Room</span><div style={{ display: 'flex', gap: '8px' }}><input placeholder="Nama Tamu" required value={formData.nama_tamu} onChange={(e) => setFormData({...formData, nama_tamu: e.target.value})} style={{ flex: 1, padding: '8px' }} /><input placeholder="Room" required value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} style={{ width: '80px', padding: '8px' }} /></div></label>
            <label><span style={{ fontSize: '12px', fontWeight: 600 }}>Prioritas</span><select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} style={{ width: '100%', padding: '8px' }}><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High (Urgent)</option></select></label>
            <label><span style={{ fontSize: '12px', fontWeight: 600 }}>Tugaskan Kepada</span><select value={formData.assigned_to} onChange={(e) => setFormData({...formData, assigned_to: e.target.value})} style={{ width: '100%', padding: '8px' }}>{staffList.map(staff => (<option key={staff.dbId} value={staff.dbId}>{staff.name}</option>))}</select></label>
            <label><span style={{ fontSize: '12px', fontWeight: 600 }}>Deskripsi</span><textarea required rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '8px' }} /></label>
            <button style={{ padding: '12px', background: '#10b981', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }} type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan Tugas"}</button>
          </form>
        </section>
        <section className="report-table-panel">
          <div className="panel-heading"><h2>Daftar Tugas</h2></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>No Case</th><th>Kategori</th><th>Kamar & Tamu</th><th>Ditugaskan Ke</th><th>Status</th></tr></thead>
              <tbody>
                {cases.map((c: any) => (
                  <tr key={c.case_no} style={{ opacity: c.status === 'RESOLVED' ? 0.6 : 1 }}>
                    <td><strong>{c.case_no}</strong></td>
                    <td>{c.case_type} <br/><small style={{color: c.priority === 'High' ? 'red' : 'gray'}}>{c.priority} Priority</small></td>
                    <td>{c.room} - {c.nama_tamu} <br/><small>{c.description}</small></td>
                    <td>{c.staff_name}</td>
                    <td>
                      {c.status === 'OPEN' ? (
                        <button onClick={() => handleResolve(c.case_no)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Resolve</button>
                      ) : <span className="payment-badge cash">RESOLVED</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}

function ShiftClosingDashboard({ transactions = [], shiftClosings = [], currentStaff = null }: { transactions?: any[], shiftClosings?: any[], currentStaff?: any }) {
  const router = useRouter(); 
  const [openingCashInput, setOpeningCashInput] = useState("1000000"); 
  const openingCash = Number(openingCashInput) || 0;
  const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const displayRows = transactions.filter((t: any) => t.date && t.date.includes(todayStr));
  
  const cashSales = displayRows.filter(t => t.method === "Cash").reduce((sum, t) => sum + (t.amount || 0), 0);
  const cardSales = displayRows.filter(t => isCard(t.method)).reduce((sum, t) => sum + (t.amount || 0), 0);
  const expectedCash = openingCash + cashSales;
  const [actualCash, setActualCash] = useState(expectedCash.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const actualValue = Number(actualCash) || 0;
  const variance = actualValue - expectedCash;

  useEffect(() => { setActualCash(expectedCash.toString()); }, [expectedCash]);

  const handleSubmitClosing = async () => {
    setIsSubmitting(true);
    const result = await saveShiftClosing({ openingCash, cashSales, cardSales, expectedCash, actualCash: actualValue, variance, shift: currentStaff ? currentStaff.shift : "Morning" });
    if (result.success) { alert("Shift closing berhasil disubmit!"); } 
    else alert("Gagal menyimpan: " + result.error); 
    setIsSubmitting(false);
  };

  return (
    <section className="workspace-screen">
      <header className="workspace-header"><div><p className="eyebrow">FRONT OFFICE</p><h1>Cash Reconciliation</h1></div></header>
      <div className="workspace-content shift-content">
        <div className="shift-summary">
          {[{ label: "Opening Cash", value: openingCash, icon: "cash" as IconName, color: "sand" }, { label: "Total Cash Sales", value: cashSales, icon: "cash" as IconName, color: "mint" }, { label: "Total Card Sales", value: cardSales, icon: "card" as IconName, color: "blue" }].map((item) => (
            <article className="shift-summary-card" key={item.label}><div className={`metric-icon ${item.color}`}><Icon name={item.icon} size={22} /></div><p>{item.label}</p><strong>{formatIDR(item.value)}</strong></article>
          ))}
        </div>
        <section className="reconciliation-panel">
          <div className="reconciliation-heading"><div><h2>Cash Reconciliation</h2></div></div>
          <div className="reconciliation-form">
            <label><span>Opening Cash (Modal)</span><div className="currency-input"><span>Rp</span><input inputMode="numeric" onChange={(e) => setOpeningCashInput(e.target.value.replace(/\D/g, ""))} value={openingCashInput} /></div></label>
            <label><span>Expected Cash</span><div className="currency-input readonly"><span>Rp</span><input readOnly value={expectedCash.toLocaleString("id-ID")} /></div></label>
            <label><span>Actual Cash Counted</span><div className="currency-input"><span>Rp</span><input inputMode="numeric" onChange={(e) => setActualCash(e.target.value.replace(/\D/g, ""))} value={actualCash} /></div></label>
            <div className={`variance-field ${variance === 0 ? "balanced" : variance > 0 ? "over" : "short"}`}>
              <div><span>Variance</span><small>{variance === 0 ? "Cash drawer is balanced" : variance > 0 ? "Cash over expected" : "Cash short"}</small></div>
              <strong>{variance > 0 ? "+" : ""}{formatIDR(variance)}</strong>
            </div>
            <button style={{ padding: '12px', background: '#10b981', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }} onClick={handleSubmitClosing} disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit Shift Closing"}</button>
          </div>
        </section>
        <section className="report-table-panel" style={{ marginTop: '24px' }}>
          <div className="panel-heading"><h2>Shift Closing History</h2></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Close No</th><th>Waktu</th><th>Expected Cash</th><th>Actual Cash</th><th>Variance</th></tr></thead>
              <tbody>
                {shiftClosings.map((c: any) => (<tr key={c.close_no}><td><strong>{c.close_no}</strong></td><td>{new Date(c.tanggal).toLocaleString("id-ID")}</td><td>{formatIDR(c.expected_cash)}</td><td>{formatIDR(c.actual_cash)}</td><td>{c.variance}</td></tr>))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}

function PaymentDatabaseDashboard({ transactions = [] }: { transactions?: any[] }) {
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // "2026-10-25" -> tanggal lokal (awal atau akhir hari), supaya tidak bergeser zona waktu
  const parseDay = (v: string, endOfDay: boolean) => {
    const [y, m, d] = v.split("-").map(Number);
    return endOfDay ? new Date(y, m - 1, d, 23, 59, 59, 999) : new Date(y, m - 1, d, 0, 0, 0, 0);
  };

  const displayRows = transactions.filter(row => {
    const matchSearch = row.guest.toLowerCase().includes(searchQuery.toLowerCase()) || row.receipt.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;
    if (row.rawDate) {
      const when = new Date(row.rawDate);
      if (startDate && when < parseDay(startDate, false)) return false;
      if (endDate && when > parseDay(endDate, true)) return false;
    }
    return true;
  });
  
  const exportExcel = () => {
    const dataToExport = displayRows.map(r => ({
      ID: r.id, Date: r.date, Guest: r.guest, Room: r.room, Method: r.method, 
      Items: r.items?.map((i:any) => `${i.qty}x ${i.name} (${i.category})`).join(', '),
      Total: r.amount
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Database");
    XLSX.writeFile(wb, `Payment_Database.xlsx`);
  };

  return (
    <section className="workspace-screen">
      <style>{globalPrintStyle}</style>
      {selectedReceipt && <ReceiptModal transaction={selectedReceipt} onClose={() => setSelectedReceipt(null)} />}
      <div className="print-area hide-on-screen">
        <h2>Payment Database Master</h2>
        <table className="print-table">
          <thead><tr><th>Date</th><th>Receipt</th><th>Guest</th><th>Method</th><th>Items Detail (Rent/Boat/etc)</th><th>Total</th></tr></thead>
          <tbody>
            {displayRows.map(row => (
              <tr key={row.id}>
                <td>{row.date}</td><td>{row.receipt}</td><td>{row.guest}</td><td>{row.method}</td>
                <td>{row.items?.map((i:any) => `${i.qty}x ${i.name} [${i.category}]`).join(', ')}</td>
                <td>{formatIDR(row.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <header className="workspace-header database-header hide-on-print">
        <div><p className="eyebrow">TRANSACTIONS</p><h1>Payment Database</h1></div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={exportExcel} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#10b981', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}><Icon name="download" size={16} /> Excel</button>
          <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#3b82f6', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}><Icon name="printer" size={16} /> Print All</button>
        </div>
      </header>
      <div className="workspace-content hide-on-print">
        <section className="report-table-panel">
          <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2>All Transactions</h2>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>{displayRows.length} dari {transactions.length} transaksi</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>
                DARI TANGGAL
                <input type="date" value={startDate} max={endDate || undefined} onChange={(e) => setStartDate(e.target.value)} style={{ marginTop: '4px', padding: '7px 8px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>
                SAMPAI TANGGAL
                <input type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} style={{ marginTop: '4px', padding: '7px 8px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </label>
              <input onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari tamu atau struk..." type="search" value={searchQuery} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', height: '34px' }} />
              <button onClick={() => { setStartDate(""); setEndDate(""); setSearchQuery(""); }} style={{ padding: '0 14px', height: '34px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Reset</button>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Trx ID</th><th>Date</th><th>Guest Name</th><th>Method</th><th>Items Detail</th><th>Total</th><th>Action</th></tr></thead>
              <tbody>
                {displayRows.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Tidak ada transaksi yang sesuai filter.</td></tr>
                )}
                {displayRows.map((row) => (
                  <tr key={row.id}>
                    <td><strong>{row.id}</strong></td><td>{row.date}</td><td>{row.guest}</td>
                    <td><span className={`payment-badge ${row.method.toLowerCase()}`}>{row.method}</span></td>
                    <td style={{ maxWidth: '250px' }}>
                      <div style={{ fontSize: '12px', color: '#475569' }}>
                        {row.items?.map((i:any, idx:number) => <div key={idx}>{i.qty}x {i.name} <span style={{color:'#94a3b8'}}>[{i.category}]</span></div>)}
                      </div>
                    </td>
                    <td><strong>{formatIDR(row.total)}</strong></td>
                    <td><button onClick={() => setSelectedReceipt(row)} style={{ padding: '6px 12px', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Print</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}

function CaseReportDashboard({ cases = [] }: { cases?: any[] }) {
  return (
    <section className="workspace-screen">
      <style>{globalPrintStyle}</style>
      <div className="print-area hide-on-screen">
        <h2>Operational Case Report</h2>
        <table className="print-table">
          <thead><tr><th>Case No</th><th>Type</th><th>Guest/Room</th><th>Assigned</th><th>Status</th><th>Notes</th></tr></thead>
          <tbody>
            {cases.map((c:any) => (
              <tr key={c.case_no}>
                <td>{c.case_no}</td><td>{c.case_type}</td><td>{c.nama_tamu} ({c.room})</td><td>{c.staff_name}</td><td>{c.status}</td><td>{c.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <header className="workspace-header hide-on-print">
        <div><p className="eyebrow">ANALYTICS</p><h1>Operational Case Report</h1></div>
        <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#3b82f6', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}><Icon name="printer" size={16} /> Print Report</button>
      </header>
      <div className="workspace-content hide-on-print">
        <div className="analytics-metrics">
          <article><div><p>Total Cases</p><strong>{cases.length}</strong></div></article>
          <article><div><p>Resolved</p><strong>{cases.filter((c: any) => c.status !== "OPEN").length}</strong></div></article>
        </div>
        <section className="analytics-panel resolved-panel">
          <div className="panel-heading"><h2>Recent Cases</h2></div>
          <div className="resolved-list">
            {cases.map((item: any) => (
              <div key={item.case_no} style={{ padding: '16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>{item.case_type}</strong>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0' }}>{item.case_no} · Room {item.room} · Staf: {item.staff_name}</p>
                </div>
                <span className={`payment-badge ${item.status === 'OPEN' ? 'room' : 'cash'}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function MasterDataDashboard({ products = [] }: { products?: any[] }) {
  const router = useRouter(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const defaultForm = { item_code: "", item_service: "", default_rate: "", category: "CHARGE", billing_type: "PER_UNIT", desk: "none", notes: "" };
  const [formData, setFormData] = useState(defaultForm);
  const [query, setQuery] = useState("");

  const filteredProducts = products.filter((row: any) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return String(row.id).toLowerCase().includes(q) || String(row.name).toLowerCase().includes(q) || String(row.category).toLowerCase().includes(q);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, default_rate: Number(formData.default_rate) };
    const result = editMode ? await updateMasterItem(payload) : await addMasterItem(payload);
    if (result.success) { setIsModalOpen(false); } 
    else alert("Gagal menyimpan: " + result.error); 
  };

  return (
    <section className="workspace-screen">
      <header className="workspace-header"><div><h2>Master Data</h2></div><button className="export-button add-case-button" onClick={() => { setEditMode(false); setFormData(defaultForm); setIsModalOpen(true); }}>Add New Item</button></header>
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '480px', color: '#0f172a' }}>
            <h3 style={{ marginBottom: '16px' }}>{editMode ? "Edit Item" : "Add New Item"}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div><label>Item Code</label><input type="text" required value={formData.item_code} onChange={(e) => setFormData({...formData, item_code: e.target.value.toUpperCase()})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} disabled={editMode} /></div>
              <div><label>Service Name</label><input type="text" required value={formData.item_service} onChange={(e) => setFormData({...formData, item_service: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
              <div><label>Default Rate (Rp)</label><input type="number" required value={formData.default_rate} onChange={(e) => setFormData({...formData, default_rate: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '6px' }}><option value="CHARGE">CHARGE</option><option value="RENTAL">RENTAL</option><option value="ACTIVITY">ACTIVITY</option><option value="TRANSFER">TRANSFER</option><option value="RETAIL">RETAIL</option></select>
                <select value={formData.billing_type} onChange={(e) => setFormData({...formData, billing_type: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '6px' }}><option value="PER_UNIT">PER_UNIT</option><option value="PER_DAY">PER_DAY</option><option value="PER_PAX">PER_PAX</option><option value="PER_TRIP">PER_TRIP</option></select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 14px', background: '#f1f5f9', border: 'none', borderRadius: '6px' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="workspace-content">
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari kode, nama, atau kategori..." style={{ flex: 1, minWidth: '240px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }} />
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>{filteredProducts.length} dari {products.length} item</span>
          {query && <button onClick={() => setQuery("")} style={{ padding: '8px 14px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Reset</button>}
        </div>
        <table className="data-table">
          <thead><tr><th>ITEM</th><th>CATEGORY</th><th>RATE</th><th>ACTION</th></tr></thead>
          <tbody>
            {filteredProducts.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Tidak ada item yang cocok dengan pencarian.</td></tr>
            )}
            {filteredProducts.map((row: any) => (
              <tr key={row.id}>
                <td><strong>{row.id}</strong><br/>{row.name}</td><td>{row.category}</td><td>{formatIDR(row.price)}</td>
                <td>
                  <button onClick={() => { setEditMode(true); setFormData({ item_code: row.id, item_service: row.name, default_rate: row.price.toString(), category: row.category, billing_type: row.billing_type, desk: row.icon, notes: row.notes || "" }); setIsModalOpen(true); }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', marginRight: '4px' }}>Edit</button>
                  <button onClick={async () => { if(confirm("Hapus?")) { await deleteMasterItem(row.id); } }} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StaffDashboard({ staffData = [] }: { staffData?: any[] }) {
  const router = useRouter(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false); 
  const defaultForm = { dbId: "", nama: "", posisi: "Front Desk", shift: "Morning", pin: "1234", role: "Kasir" };
  const [formData, setFormData] = useState(defaultForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = editMode ? await updateStaff(formData) : await addStaff(formData);
    if (result.success) { setIsModalOpen(false); } 
  };

  return (
    <section className="workspace-screen">
      <header className="workspace-header"><div><h1>Staff Directory</h1></div><button className="export-button add-case-button" onClick={() => { setEditMode(false); setFormData(defaultForm); setIsModalOpen(true); }}>Add New Staff</button></header>
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '400px', color: '#0f172a' }}>
            <h3 style={{ marginBottom: '16px' }}>{editMode ? "Edit Staff" : "Add Staff"}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div><label>Name</label><input type="text" required value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} /></div>
              <div><label>Position</label><input type="text" required value={formData.posisi} onChange={(e) => setFormData({...formData, posisi: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} /></div>
              <div><label>Role Hak Akses</label><select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}><option value="Kasir">Kasir / Front Desk</option><option value="Admin">Manager / Admin</option></select></div>
              <div><label>PIN</label><input type="text" required value={formData.pin} onChange={(e) => setFormData({...formData, pin: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}><button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button><button type="submit">Save</button></div>
            </form>
          </div>
        </div>
      )}
      <div className="workspace-content">
        <table className="data-table">
          <thead><tr><th>STAFF</th><th>POSITION</th><th>ROLE</th><th>ACTION</th></tr></thead>
          <tbody>
            {staffData.map((row: any) => (
              <tr key={row.dbId}>
                <td>{row.name}</td><td>{row.position}</td><td><span className={`badge ${row.role === 'Admin' ? 'blue' : 'mint'}`}>{row.role}</span></td>
                <td>
                  <button onClick={() => { setEditMode(true); setFormData({ dbId: row.dbId, nama: row.name, posisi: row.position, shift: row.shift, pin: row.pin, role: row.role }); setIsModalOpen(true); }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '4px 8px', marginRight: '4px' }}>Edit</button>
                  <button onClick={async () => { if(confirm("Hapus?")) { await deleteStaff(row.dbId); } }} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function BikeRentalDashboard({ bikes = [], setBikes, staffName }: { bikes?: any[], setBikes: any, staffName: string }) {
  // -- AUTO SAVE LOCAL STORAGE BIKE --
  const [bikeInputs, setBikeInputs] = useState<Record<string, { price?: number; method?: string; unit_no?: string; vendor?: string }>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gili_bike_drafts");
      if (saved) return JSON.parse(saved);
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem("gili_bike_drafts", JSON.stringify(bikeInputs));
  }, [bikeInputs]);

  const handleBikeChange = (id: string, field: string, val: any) => {
    setBikeInputs(prev => ({ ...prev, [id]: { ...prev[id], [field]: val } }));
  };
  // ---------------------------------

  const [editBike, setEditBike] = useState<any>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const completedBikes = bikes.filter((b: any) => b.status === "DONE");
  const grossIncome = completedBikes.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0);
  const jatahBanana = grossIncome * 0.50;
  const jatahHotel = grossIncome * 0.25;
  const jatahPakJoe = grossIncome - jatahBanana - jatahHotel;

  const dueAt = (b: any) => new Date(new Date(b.created_at).getTime() + (b.duration_days || 1) * 24 * 60 * 60 * 1000);
  const fmtTime = (d: Date) => d.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  const replaceBike = (updated: any) => setBikes((prev: any[]) => prev.map((b: any) => b.id === updated.id ? updated : b));

  const handleProcessBike = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const unit_no = form.unit.value;
    const vendor = form.vendor.value;
    const total_price = Number(form.price.value);
    const payment_method = form.payment.value;

    if (!confirm(`Selesaikan pesanan ini? Laporan keuangan otomatis akan terbagi.\n\nVendor: ${vendor}\nTotal bayar: ${formatIDR(withFee(total_price, payment_method))} (${payment_method})`)) return;

    const res = await processBikeRental(id, { unit_no, vendor, total_price, payment_method, staff_name: staffName });
    if (res.success) {
      replaceBike(res.data);
      alert("Pesanan sukses diproses ke dalam laporan!");
      // Hapus dari draft karena sudah selesai
      setBikeInputs(prev => { const next = {...prev}; delete next[id]; return next; });
    } else alert("Gagal memproses: " + res.error);
  };

  const handleReturn = async (bike: any) => {
    const res = await setBikeReturned(bike.id, !bike.returned_at);
    if (res.success) replaceBike(res.data);
    else alert("Gagal mengubah status: " + res.error);
  };

  const handleDeleteBike = async (bike: any) => {
    const warn = bike.status === "DONE" ? "\n\nPesanan ini sudah DONE. Catatan transaksinya di laporan keuangan TIDAK ikut terhapus." : "";
    if (!confirm(`Hapus data sewa Room ${bike.room} - ${bike.guest_name}?${warn}`)) return;
    const res = await deleteBikeRental(bike.id);
    if (res.success) setBikes((prev: any[]) => prev.filter((b: any) => b.id !== bike.id));
    else alert("Gagal menghapus: " + res.error);
  };

  const handleSaveBikeEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdit(true);
    const res = await updateBikeRental(editBike.id, {
      guest_name: editBike.guest_name, room: editBike.room, whatsapp: editBike.whatsapp,
      bike_type: editBike.bike_type, duration_days: Number(editBike.duration_days),
      unit_no: editBike.unit_no || "", vendor: editBike.vendor || "",
    });
    setSavingEdit(false);
    if (res.success) { replaceBike(res.data); setEditBike(null); } 
    else alert("Gagal menyimpan: " + res.error);
  };

  const fieldStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px', background: '#fff' } as const;
  const smallBtn = (bg: string) => ({ padding: '6px 12px', background: bg, color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' } as const);

  return (
    <section className="workspace-screen">
      <header className="workspace-header"><div><p className="eyebrow">GILIAMOR BIKE</p><h1>Dashboard Laporan E-Bike</h1></div></header>

      {editBike && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '480px', maxWidth: '100%', maxHeight: '92vh', overflowY: 'auto', color: '#0f172a' }}>
            <h3 style={{ marginBottom: '4px' }}>Edit Sewa Sepeda</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>Untuk perpanjangan, ubah Durasi (hari). Waktu siap sepeda ikut berubah.</p>
            <form onSubmit={handleSaveBikeEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ width: '30%', fontSize: '12px', fontWeight: 'bold' }}>Room<input required value={editBike.room} onChange={(e) => setEditBike({ ...editBike, room: e.target.value })} style={fieldStyle} /></label>
                <label style={{ width: '70%', fontSize: '12px', fontWeight: 'bold' }}>Nama Tamu<input required value={editBike.guest_name} onChange={(e) => setEditBike({ ...editBike, guest_name: e.target.value })} style={fieldStyle} /></label>
              </div>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>WhatsApp<input required value={editBike.whatsapp} onChange={(e) => setEditBike({ ...editBike, whatsapp: e.target.value })} style={fieldStyle} /></label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ flex: 1, fontSize: '12px', fontWeight: 'bold' }}>Jenis Sepeda
                  <select value={editBike.bike_type} onChange={(e) => setEditBike({ ...editBike, bike_type: e.target.value })} style={fieldStyle}>
                    <option value="Standard Bicycle">Standard Bicycle</option><option value="Electric Bike">Electric Bike</option>
                  </select>
                </label>
                <label style={{ width: '120px', fontSize: '12px', fontWeight: 'bold' }}>Durasi (Hari)<input required type="number" min={1} value={editBike.duration_days} onChange={(e) => setEditBike({ ...editBike, duration_days: e.target.value })} style={fieldStyle} /></label>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ flex: 1, fontSize: '12px', fontWeight: 'bold' }}>Nomor/Warna Unit<input value={editBike.unit_no || ""} onChange={(e) => setEditBike({ ...editBike, unit_no: e.target.value })} style={fieldStyle} /></label>
                <label style={{ flex: 1, fontSize: '12px', fontWeight: 'bold' }}>Vendor
                  <select value={editBike.vendor || ""} onChange={(e) => setEditBike({ ...editBike, vendor: e.target.value })} style={fieldStyle}>
                    <option value="">- Pilih vendor -</option>{BIKE_VENDORS.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </label>
              </div>
              {editBike.status === "DONE" && <p style={{ fontSize: '12px', color: '#b45309', background: '#fef3c7', padding: '10px', borderRadius: '6px', margin: 0 }}>Pesanan ini sudah DONE. Mengubah durasi tidak mengubah transaksi yang sudah tercatat.</p>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setEditBike(null)} style={{ padding: '8px 14px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Batal</button>
                <button type="submit" disabled={savingEdit} style={{ padding: '8px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{savingEdit ? "Menyimpan..." : "Simpan"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="workspace-content">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#b45309', color: '#fff', padding: '16px', borderRadius: '8px' }}><span style={{ fontSize: '12px', opacity: 0.9 }}>GROSS INCOME E-BIKE</span><div style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '4px' }}>{formatIDR(grossIncome)}</div></div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px' }}><span style={{ fontSize: '12px', color: '#b45309', fontWeight: 'bold' }}>BERSIH MR. BANANA (50%)</span><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginTop: '4px' }}>{formatIDR(jatahBanana)}</div></div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px' }}><span style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold' }}>JATAH HOTEL (25%)</span><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginTop: '4px' }}>{formatIDR(jatahHotel)}</div></div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px' }}><span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 'bold' }}>BERSIH PAK JOE (25%)</span><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginTop: '4px' }}>{formatIDR(jatahPakJoe)}</div></div>
        </div>
        <section className="report-table-panel">
          <div className="panel-heading"><h2>Daftar Pesanan Sepeda Tamu</h2></div>
          <div style={{ padding: '20px' }}>
            {bikes.length === 0 ? <p style={{ textAlign: 'center', color: '#64748b' }}>Belum ada data penyewaan sepeda.</p> : bikes.map((bike: any) => {
              const returned = !!bike.returned_at;
              const due = dueAt(bike);
              const overdue = !returned && Date.now() > due.getTime();
              const defaultPrice = bikeDailyRate(bike.bike_type) * (bike.duration_days || 1);
              
              return (
              <div key={bike.id} style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', gap: '12px', flexWrap: 'wrap' }}>
                  <div><strong style={{ display: 'block', color: '#0f172a', fontSize: '16px' }}>Room {bike.room} - {bike.guest_name}</strong><span style={{ fontSize: '13px', color: '#64748b' }}>WA: {bike.whatsapp} • {new Date(bike.created_at).toLocaleString('id-ID')}</span></div>
                  <div style={{ textAlign: 'right' }}><strong style={{ display: 'block', color: bike.bike_type?.includes("Electric") ? '#b45309' : '#3b82f6' }}>{bike.bike_type}</strong><span style={{ fontSize: '13px', color: '#64748b' }}>Durasi: {bike.duration_days} Hari</span></div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {returned ? (<span style={{ background: '#d1fae5', color: '#065f46', padding: '5px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>SELESAI · dikembalikan {fmtTime(new Date(bike.returned_at))}</span>) : overdue ? (<span style={{ background: '#fee2e2', color: '#b91c1c', padding: '5px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>MASIH DISEWA · LEWAT WAKTU (seharusnya siap {fmtTime(due)})</span>) : (<span style={{ background: '#fef3c7', color: '#92400e', padding: '5px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>MASIH DISEWA · siap {fmtTime(due)}</span>)}
                  <span style={{ background: '#f1f5f9', color: '#334155', padding: '5px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>Vendor: {bike.vendor || '-'}</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button onClick={() => handleReturn(bike)} style={smallBtn(returned ? '#64748b' : '#0ea5e9')}>{returned ? 'Buka Lagi (Masih Disewa)' : 'Sepeda Kembali'}</button>
                    <button onClick={() => setEditBike({ ...bike })} style={smallBtn('#3b82f6')}>Edit</button>
                    <button onClick={() => handleDeleteBike(bike)} style={smallBtn('#ef4444')}>Hapus</button>
                  </div>
                </div>

                {bike.status === "PENDING" ? (
                  <form onSubmit={(e) => handleProcessBike(e, bike.id)} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px dashed #cbd5e1', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', flex: 1, minWidth: '130px' }}>Nomor/Warna Unit
                      <input name="unit" required value={bikeInputs[bike.id]?.unit_no ?? (bike.unit_no || "")} onChange={(e) => handleBikeChange(bike.id, 'unit_no', e.target.value)} placeholder="Cth: 1.5" style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', marginTop: '4px' }} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', flex: 1, minWidth: '130px' }}>Vendor
                      <select name="vendor" required value={bikeInputs[bike.id]?.vendor ?? (bike.vendor || "")} onChange={(e) => handleBikeChange(bike.id, 'vendor', e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', marginTop: '4px', background: '#fff' }}>
                        <option value="" disabled>- Pilih vendor -</option>{BIKE_VENDORS.map((v) => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', flex: 1, minWidth: '130px' }}>Harga Final (Rp)
                      <input name="price" type="number" required value={bikeInputs[bike.id]?.price ?? defaultPrice} onChange={(e) => handleBikeChange(bike.id, 'price', Number(e.target.value))} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', marginTop: '4px' }} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', flex: 1, minWidth: '130px' }}>Metode Bayar
                      <select name="payment" required value={bikeInputs[bike.id]?.method ?? "Cash"} onChange={(e) => handleBikeChange(bike.id, 'method', e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', marginTop: '4px', background: '#fff' }}>
                        {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', minWidth: '130px' }}>Total Bayar
                      <strong style={{ marginTop: '8px', fontSize: '16px', color: '#0f172a' }}>{formatIDR(withFee(bikeInputs[bike.id]?.price ?? defaultPrice, bikeInputs[bike.id]?.method ?? "Cash"))}</strong>
                    </div>
                    <button type="submit" style={{ padding: '8px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', height: '38px' }}>Proses (Selesai)</button>
                  </form>
                ) : (
                  <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '8px', border: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#065f46', fontWeight: 'bold' }}>✓ DONE (Unit: {bike.unit_no}) - Kasir: {bike.staff_name}</span>
                    <strong style={{ color: '#065f46' }}>Total: {formatIDR(withFee(bike.total_price || 0, bike.payment_method))} ({bike.payment_method})</strong>
                  </div>
                )}
                
                {/* Bagian foto dan tanda tangan (tidak ada perubahan) */}
                <div style={{ display: 'flex', gap: '20px', marginTop: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '220px' }}><span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>FOTO KONDISI SEPEDA:</span>{bike.photo_url ? (<a href={bike.photo_url} target="_blank" rel="noopener noreferrer"><img src={bike.photo_url} alt="Kondisi" style={{ width: '100%', height: '140px', borderRadius: '6px', display: 'block', marginTop: '4px', border: '1px solid #cbd5e1', objectFit: 'cover' }} /></a>) : (<p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Tidak ada foto</p>)}</div>
                  <div style={{ flex: 1, minWidth: '220px' }}><span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>TANDA TANGAN KONTRAK:</span>{bike.signature_url ? (<div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '4px', padding: '8px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src={bike.signature_url} alt="Tanda Tangan" style={{ maxHeight: '100%', maxWidth: '100%', display: 'block' }} /></div>) : (<p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Tidak ada tanda tangan</p>)}</div>
                </div>
              </div>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
}

export default function POSClientApp({ 
  initialProducts, initialStaff, initialTransactions, initialShiftClosings, initialCases = [], initialBikes = [] 
}: { 
  initialProducts?: any[]; initialStaff?: any[]; initialTransactions?: any[]; initialShiftClosings?: any[]; initialCases?: any[]; initialBikes?: any[];
}) {
  const router = useRouter(); 
  const [currentStaff, setCurrentStaff] = useState<any>(null);
  const [activePage, setActivePage] = useState("Launchpad");
  const [bikes, setBikes] = useState(initialBikes);

  // Saat Bike Dashboard dibuka, ambil data sepeda terbaru lalu cek lagi tiap 20 detik
  useEffect(() => {
    if (activePage !== "Bike Dashboard") return;
    const load = async () => {
      const res = await getBikeRentals();
      if (res && res.success && res.data) setBikes(res.data as any);
    };
    load();
    const timer = setInterval(() => { if (!document.hidden) load(); }, 20000);
    return () => clearInterval(timer);
  }, [activePage]);

  useEffect(() => {
    const sessionData = localStorage.getItem("gili_amor_staff");
    if (sessionData) setCurrentStaff(JSON.parse(sessionData));
    else router.push("/login");
  }, [router]);

  const realStaffData = initialStaff?.find(s => s.pin === currentStaff?.pin) || currentStaff;
  const isAdmin = realStaffData?.role === "Admin" || realStaffData?.position?.toLowerCase().includes("admin") || realStaffData?.posisi?.toLowerCase().includes("admin");
  const allowedNavs = navItems.filter(item => item.roles.includes(isAdmin ? "Admin" : "Kasir"));

  const [activeCategory, setActiveCategory] = useState("All Items");
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState("Room Charge");
  const [guestName, setGuestName] = useState(""); 
  const [cart, setCart] = useState<Record<string, {qty: number, price: number}>>({});
  const [bookingData, setBookingData] = useState({ arrival: "", checkout: "", source: "Direct", notes: "" });

  const isPosPage = ["Reception", "Rent", "Boat", "Buy"].includes(activePage);
  const allProducts = initialProducts || [];
  let activeProducts = allProducts;
  let categories = ["All Items"];

  if (activePage === "Reception") { activeProducts = allProducts.filter(p => p.category === "CHARGE" || p.category === "TRANSFER"); categories = ["All Items", "CHARGE", "TRANSFER"]; }
  else if (activePage === "Rent") { activeProducts = allProducts.filter(p => p.category === "RENTAL"); categories = ["All Items", "RENTAL"]; }
  else if (activePage === "Boat") { activeProducts = allProducts.filter(p => p.category === "ACTIVITY" || p.category === "TRANSFER"); categories = ["All Items", "ACTIVITY", "TRANSFER"]; }
  else if (activePage === "Buy") { activeProducts = allProducts.filter(p => p.category === "RETAIL"); categories = ["All Items", "RETAIL"]; }
  
  const visibleProducts = useMemo(() => activeProducts.filter((p) => (activeCategory === "All Items" || p.category === activeCategory) && p.name.toLowerCase().includes(query.toLowerCase())), [activeCategory, query, activeProducts]);
  const cartItems = Object.entries(cart).map(([id, data]) => {
    const p = activeProducts.find(x => String(x.id) === id);
    return { ...p, id, name: p?.name || id, qty: data.qty, price: data.price, color: p?.color || 'blue', icon: p?.icon || 'room' };
  });
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const showAdvancedBooking = cartItems.some(item => {
    const n = item.name.toLowerCase();
    return n.includes("airport") || n.includes("transfer") || n.includes("boat") || n.includes("deposit");
  });

  const updateQuantity = (id: string, change: number, defaultPrice: number) => { 
    setCart((curr) => { 
      const nextQty = Math.max(0, (curr[id]?.qty || 0) + change); 
      const updated = { ...curr }; 
      if (nextQty === 0) delete updated[id]; 
      else updated[id] = { qty: nextQty, price: curr[id]?.price || defaultPrice }; 
      return updated; 
    }); 
  };

  const handleCustomPrice = (id: string, newPrice: number) => {
    setCart(curr => ({ ...curr, [id]: { ...curr[id], price: newPrice } }));
  };

  return (
    <main className="pos-shell">
      <aside className="navigation hide-on-print">
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brand-mark" style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}><img src="/logo-gili.png" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} /></div>
          <div><strong>GILI AMOR</strong><small>BOUTIQUE RESORT</small></div>
        </div>
        <nav className="nav-list">
          <p className="nav-label">WORKSPACE</p>
          {allowedNavs.map((item) => (
            <button className={`nav-item ${item.label === activePage ? "active" : ""}`} key={item.label} onClick={() => { setActivePage(item.label); setActiveCategory("All Items"); setQuery(""); }}>
              <Icon name={item.icon} size={20} /><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="staff-card" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="avatar" style={{ background: isAdmin ? '#3b82f6' : '#10b981' }}>
              {realStaffData ? (realStaffData.name || realStaffData.nama)?.slice(0, 2).toUpperCase() : "GA"}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <strong style={{ display: 'block' }}>{realStaffData?.name || realStaffData?.nama}</strong>
              <span style={{ fontSize: '11px' }}>{isAdmin ? "Admin" : "Kasir"}</span>
            </div>
          </div>
          <button onClick={() => { localStorage.removeItem("gili_amor_staff"); router.push("/login"); }} style={{ width: '100%', background: '#ef4444', color: '#fff', border: 'none', padding: '6px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Logout</button>
        </div>
      </aside>

      {activePage === "Launchpad" && <HomeDashboard onLaunch={(page) => setActivePage(page)} transactions={initialTransactions} cases={initialCases} />}
      {activePage === "Dashboard" && isAdmin && <DashboardAnalytics transactions={initialTransactions} cases={initialCases} />}
      {activePage === "Reports" && isAdmin && <ReportsDashboard transactions={initialTransactions} />}
      {activePage === "Case / Follow-up" && <CasesDashboard staffList={initialStaff} cases={initialCases} />}
      {activePage === "Shift Closing" && <ShiftClosingDashboard transactions={initialTransactions} shiftClosings={initialShiftClosings} currentStaff={currentStaff} />}
      {activePage === "Payment Database" && isAdmin && <PaymentDatabaseDashboard transactions={initialTransactions} />}
      {activePage === "Case Report" && isAdmin && <CaseReportDashboard cases={initialCases} />}
      {activePage === "Master Data" && isAdmin && <MasterDataDashboard products={initialProducts} />}
      {activePage === "Staff" && isAdmin && <StaffDashboard staffData={initialStaff} />}
      {activePage === "Bike Dashboard" && <BikeRentalDashboard bikes={bikes} setBikes={setBikes} staffName={realStaffData?.name || realStaffData?.nama || "FO"} />}
      
      {/* LAUNDRY DASHBOARD DIRENDER DI SINI */}
      {activePage === "Laundry Dashboard" && <LaundryDashboardContent staffList={initialStaff} />}

      {isPosPage && <section className="catalog">
        <header className="catalog-header">
          <div className="top-row"><div><p className="eyebrow">GILI AMOR RESORT</p><h1>{activePage} POS</h1></div></div>
          <label className="search-field"><Icon name="search" size={21} /><input onChange={(e) => setQuery(e.target.value)} placeholder="Search..." type="search" value={query} /></label>
          <div className="category-row">{categories.map((cat) => (<button className={activeCategory === cat ? "active" : ""} key={cat} onClick={() => setActiveCategory(cat)}>{cat}</button>))}</div>
        </header>
        <div className="catalog-body">
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <button className="product-card" key={product.id} onClick={() => updateQuantity(product.id, 1, product.price)}>
                <div className={`product-icon ${product.color}`}><Icon name={product.icon as IconName} size={27} /></div>
                <div className="product-copy"><h3>{product.name}</h3><p>{product.category}</p></div>
                <strong>{formatIDR(product.price)}</strong><span className="add-product">+</span>
              </button>
            ))}
          </div>
        </div>
      </section>}

      {isPosPage && <aside className="order-panel" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#fff', borderLeft: '1px solid #e2e8f0' }}>
        <div className="order-top" style={{ flexShrink: 0, padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <div className="order-title" style={{ marginBottom: '16px' }}><div><h2>Current Order</h2></div></div>
          <div className="guest-fields" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold' }}><span>Guest Name</span><input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Enter guest name" style={{ marginTop: '4px', padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }} /></label>
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold' }}><span>Room Number</span><input id="room-input" placeholder="e.g. Room A-01" defaultValue="Walk-in" style={{ marginTop: '4px', padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }} /></label>
          </div>
        </div>

        <div className="order-items" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {cartItems.map((item) => (
            <div className="cart-item" key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px dashed #e2e8f0' }}>
              <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className={`cart-icon ${item.color}`} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}><Icon name={item.icon as IconName} size={19} /></div>
                  <div className="cart-item-copy"><h4 style={{ margin: 0, fontSize: '14px' }}>{item.name}</h4></div>
                </div>
                <div className="quantity" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px' }}>
                  <button onClick={() => updateQuantity(item.id, -1, item.price)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}>−</button>
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.qty}</span>
                  <button onClick={() => updateQuantity(item.id, 1, item.price)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}>+</button>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', width: '100%' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Rate: Rp</span>
                <input type="number" value={item.price} onChange={(e) => handleCustomPrice(item.id, Number(e.target.value))} style={{ padding: '6px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px', width: '120px' }} />
              </div>
            </div>
          ))}
          {cartItems.length === 0 && <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', marginTop: '40px' }}>Keranjang kosong</p>}

          {showAdvancedBooking && cartItems.length > 0 && (
            <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '13px', marginBottom: '12px', color: '#0f172a' }}>Booking & Travel Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Arrival Date <input type="date" value={bookingData.arrival} onChange={e => setBookingData({...bookingData, arrival: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }} /></label>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Checkout Date <input type="date" value={bookingData.checkout} onChange={e => setBookingData({...bookingData, checkout: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }} /></label>
                <label style={{ fontSize: '11px', fontWeight: 'bold', gridColumn: '1 / -1' }}>Booking Source 
                  <select value={bookingData.source} onChange={e => setBookingData({...bookingData, source: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}>
                    <option value="Direct">Direct</option><option value="Via Telepon">Via Telepon</option><option value="OTA">OTA</option><option value="Hotel Collect">Hotel Collect</option>
                  </select>
                </label>
                <label style={{ fontSize: '11px', fontWeight: 'bold', gridColumn: '1 / -1' }}>Notes (e.g. DP 50%) <input type="text" value={bookingData.notes} onChange={e => setBookingData({...bookingData, notes: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="DP 500rb..." /></label>
              </div>
            </div>
          )}
        </div>

        <div style={{ flexShrink: 0, backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Grand Total</span><strong style={{ fontSize: '20px', color: '#0f172a' }}>{formatIDR(withFee(subtotal, payment))}</strong>
            </div>
            {feeRate(payment) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#b45309', marginTop: '-8px', marginBottom: '14px' }}>
                <span>Subtotal {formatIDR(subtotal)} + biaya kartu {payment}</span><strong>+ {formatIDR(feeAmount(subtotal, payment))}</strong>
              </div>
            )}
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Payment Method</p>
              <select value={payment} onChange={(e) => setPayment(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #3b82f6', background: '#fff', fontSize: '13px', fontWeight: 'bold', color: '#1e3a8a', cursor: 'pointer' }}>
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <button disabled={cartItems.length === 0} onClick={async () => {
              const roomInputValue = (document.getElementById("room-input") as HTMLInputElement)?.value || "Walk-in";
              const finalOrderData = { 
                guestName: guestName || "Walk-in Guest", paymentMethod: payment, totalAmount: subtotal, room: roomInputValue,
                staffId: currentStaff?.dbId, arrivalDate: bookingData.arrival, checkoutDate: bookingData.checkout, bookingSource: bookingData.source, paymentNotes: bookingData.notes,
                items: cartItems.map(item => ({ item_code: item.id, qty: item.qty, rate: item.price, total: item.price * item.qty })) 
              };
              const result = await saveTransaction(finalOrderData);
              if (result.success) { setCart({}); setBookingData({ arrival: "", checkout: "", source: "Direct", notes: "" }); } 
              else alert("Gagal menyimpan: " + result.error);
            }} 
            style={{ width: '100%', padding: '16px', background: cartItems.length === 0 ? '#cbd5e1' : '#10b981', color: '#fff', borderRadius: '8px', border: 'none', cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '15px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Save Transaction</span> <span>{formatIDR(withFee(subtotal, payment))}</span>
            </button>
          </div>
        </div>
      </aside>}
    </main>
  );
}