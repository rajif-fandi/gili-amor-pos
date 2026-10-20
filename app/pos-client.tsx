"use client";
import { useRouter } from "next/navigation";
import { saveTransaction, addMasterItem, deleteMasterItem, updateMasterItem, addStaff, updateStaff, deleteStaff, saveShiftClosing, saveCaseFollowUp, resolveCase } from "./actions";
import { useMemo, useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';

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
  { label: "Case / Follow-up", icon: "case" as IconName, roles: ["Admin", "Kasir"] },
  { label: "Payment Database", icon: "database" as IconName, roles: ["Admin"] },
  { label: "Case Report", icon: "reports" as IconName, roles: ["Admin"] },
  { label: "Reports", icon: "reports" as IconName, roles: ["Admin"] },
  { label: "Shift Closing", icon: "shift" as IconName, roles: ["Admin", "Kasir"] },
  { label: "Master Data", icon: "database" as IconName, roles: ["Admin"] },
  { label: "Staff", icon: "staff" as IconName, roles: ["Admin"] },
];

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

  // 1. Data untuk Pie Chart (Category Revenue: Room, Rent, Boat, Retail)
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

  // 2. Data untuk Bar Chart (Payment Methods: Cash, Card, Bank Transfer, Room Charge)
  const paymentBarData = useMemo(() => {
    const methods = { Cash: 0, Card: 0, "Bank Transfer": 0, "Room Charge": 0 };
    filteredTx.forEach(t => {
      if (methods.hasOwnProperty(t.method)) {
        methods[t.method as keyof typeof methods] += (t.amount || 0);
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
        
        {/* Kolom Kiri: 2 Buah Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* CHART 1: PIE CHART (Category Revenue) */}
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

          {/* CHART 2: BAR CHART (Payment Methods: Cash, Card, Bank, Room Charge) */}
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

        {/* Kolom Kanan: In-House Guest & Agenda */}
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
      if (result.success) router.refresh();
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
  const totalCard = displayRows.filter((t) => t.method === "Card").reduce((sum, t) => sum + (t.amount || 0), 0);
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
    if (result.success) { alert("Tugas berhasil ditambahkan!"); router.refresh(); } 
    else alert("Gagal menyimpan: " + result.error);
    setIsSubmitting(false);
  };

  const handleResolve = async (caseNo: string) => {
    if (confirm("Tandai tugas ini selesai?")) {
      const result = await resolveCase(caseNo);
      if (result.success) router.refresh();
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
  const cardSales = displayRows.filter(t => t.method === "Card").reduce((sum, t) => sum + (t.amount || 0), 0);
  const expectedCash = openingCash + cashSales;
  const [actualCash, setActualCash] = useState(expectedCash.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const actualValue = Number(actualCash) || 0;
  const variance = actualValue - expectedCash;

  useEffect(() => { setActualCash(expectedCash.toString()); }, [expectedCash]);

  const handleSubmitClosing = async () => {
    setIsSubmitting(true);
    const result = await saveShiftClosing({ openingCash, cashSales, cardSales, expectedCash, actualCash: actualValue, variance, shift: currentStaff ? currentStaff.shift : "Morning" });
    if (result.success) { alert("Shift closing berhasil disubmit!"); router.refresh(); } 
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
  
  const displayRows = transactions.filter(row => row.guest.toLowerCase().includes(searchQuery.toLowerCase()) || row.receipt.toLowerCase().includes(searchQuery.toLowerCase()));
  
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
          <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>All Transactions</h2>
            <input onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari tamu atau struk..." type="search" value={searchQuery} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Trx ID</th><th>Date</th><th>Guest Name</th><th>Method</th><th>Items Detail</th><th>Total</th><th>Action</th></tr></thead>
              <tbody>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, default_rate: Number(formData.default_rate) };
    const result = editMode ? await updateMasterItem(payload) : await addMasterItem(payload);
    if (result.success) { setIsModalOpen(false); router.refresh(); } 
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
        <table className="data-table">
          <thead><tr><th>ITEM</th><th>CATEGORY</th><th>RATE</th><th>ACTION</th></tr></thead>
          <tbody>
            {products.map((row: any) => (
              <tr key={row.id}>
                <td><strong>{row.id}</strong><br/>{row.name}</td><td>{row.category}</td><td>{formatIDR(row.price)}</td>
                <td>
                  <button onClick={() => { setEditMode(true); setFormData({ item_code: row.id, item_service: row.name, default_rate: row.price.toString(), category: row.category, billing_type: row.billing_type, desk: row.icon, notes: row.notes || "" }); setIsModalOpen(true); }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', marginRight: '4px' }}>Edit</button>
                  <button onClick={async () => { if(confirm("Hapus?")) { await deleteMasterItem(row.id); router.refresh(); } }} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px' }}>Delete</button>
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
    if (result.success) { setIsModalOpen(false); router.refresh(); } 
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
                  <button onClick={async () => { if(confirm("Hapus?")) { await deleteStaff(row.dbId); router.refresh(); } }} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function POSClientApp({ initialProducts, initialStaff, initialTransactions, initialShiftClosings, initialCases = [] }: { initialProducts?: any[]; initialStaff?: any[]; initialTransactions?: any[]; initialShiftClosings?: any[]; initialCases?: any[]; }) {
  const router = useRouter(); 
  const [currentStaff, setCurrentStaff] = useState<any>(null);
  const [activePage, setActivePage] = useState("Launchpad");

  useEffect(() => {
    const sessionData = localStorage.getItem("gili_amor_staff");
    if (sessionData) setCurrentStaff(JSON.parse(sessionData));
    else router.push("/login");
  }, [router]);

  // --- KUNCI PERBAIKANNYA DI SINI ---
  // Kita tarik data 'role' super segar langsung dari database berdasarkan PIN, mengabaikan memori browser yang usang
  const realStaffData = initialStaff?.find(s => s.pin === currentStaff?.pin) || currentStaff;
  
  // Sistem sekarang dijamin membaca hak akses asli dari database
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

      {/* --- INI BAGIAN YANG DIPERBAIKI --- */}
      {activePage === "Launchpad" && <HomeDashboard onLaunch={(page) => setActivePage(page)} transactions={initialTransactions} cases={initialCases} />}
      {activePage === "Dashboard" && isAdmin && <DashboardAnalytics transactions={initialTransactions} cases={initialCases} />}
      {activePage === "Reports" && isAdmin && <ReportsDashboard transactions={initialTransactions} />}
      {activePage === "Case / Follow-up" && <CasesDashboard staffList={initialStaff} cases={initialCases} />}
      {activePage === "Shift Closing" && <ShiftClosingDashboard transactions={initialTransactions} shiftClosings={initialShiftClosings} currentStaff={currentStaff} />}
      {activePage === "Payment Database" && isAdmin && <PaymentDatabaseDashboard transactions={initialTransactions} />}
      {activePage === "Case Report" && isAdmin && <CaseReportDashboard cases={initialCases} />}
      {activePage === "Master Data" && isAdmin && <MasterDataDashboard products={initialProducts} />}
      {activePage === "Staff" && isAdmin && <StaffDashboard staffData={initialStaff} />}

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
        
        {/* 1. Header Pemesanan (Tetap di Atas) */}
        <div className="order-top" style={{ flexShrink: 0, padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <div className="order-title" style={{ marginBottom: '16px' }}><div><h2>Current Order</h2></div></div>
          <div className="guest-fields" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold' }}><span>Guest Name</span><input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Enter guest name" style={{ marginTop: '4px', padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }} /></label>
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold' }}><span>Room Number</span><input id="room-input" placeholder="e.g. Room A-01" defaultValue="Walk-in" style={{ marginTop: '4px', padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }} /></label>
          </div>
        </div>

        {/* 2. Daftar Belanjaan & Form Booking (Bisa di-scroll bersamaan) */}
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

          {/* FORM BOOKING DIPINDAHKAN KE SINI (Di bawah list barang) */}
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

        {/* 3. Area Checkout (Tetap menempel di bawah, lebih ramping) */}
        <div style={{ flexShrink: 0, backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Grand Total</span><strong style={{ fontSize: '20px', color: '#0f172a' }}>{formatIDR(subtotal)}</strong>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Payment Method</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[{ label: "Cash", icon: "cash" as IconName }, { label: "Card", icon: "card" as IconName }, { label: "Room Charge", icon: "room" as IconName }, { label: "Bank Transfer", icon: "bank" as IconName }].map((method) => (
                  <button key={method.label} onClick={() => setPayment(method.label)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '8px', border: payment === method.label ? '2px solid #3b82f6' : '1px solid #cbd5e1', background: payment === method.label ? '#eff6ff' : '#fff', cursor: 'pointer' }}>
                    <Icon name={method.icon} size={16} /><span style={{ fontSize: '12px', fontWeight: 'bold', color: payment === method.label ? '#1e3a8a' : '#475569' }}>{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button disabled={cartItems.length === 0} onClick={async () => {
              const roomInputValue = (document.getElementById("room-input") as HTMLInputElement)?.value || "Walk-in";
              const finalOrderData = { 
                guestName: guestName || "Walk-in Guest", paymentMethod: payment, totalAmount: subtotal, room: roomInputValue,
                staffId: currentStaff?.dbId, arrivalDate: bookingData.arrival, checkoutDate: bookingData.checkout, bookingSource: bookingData.source, paymentNotes: bookingData.notes,
                items: cartItems.map(item => ({ item_code: item.id, qty: item.qty, rate: item.price, total: item.price * item.qty })) 
              };
              const result = await saveTransaction(finalOrderData);
              if (result.success) { setCart({}); setBookingData({ arrival: "", checkout: "", source: "Direct", notes: "" }); router.refresh(); } 
              else alert("Gagal menyimpan: " + result.error);
            }} 
            style={{ width: '100%', padding: '16px', background: cartItems.length === 0 ? '#cbd5e1' : '#10b981', color: '#fff', borderRadius: '8px', border: 'none', cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '15px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Save Transaction</span> <span>{formatIDR(subtotal)}</span>
            </button>
          </div>
        </div>
      </aside>}
    </main>
  );
}