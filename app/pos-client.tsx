"use client";
import { useRouter } from "next/navigation";
import { saveTransaction, addMasterItem, deleteMasterItem, updateMasterItem, addStaff, updateStaff, deleteStaff, saveShiftClosing, saveCaseFollowUp, resolveCase } from "./actions";
import { useMemo, useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type IconName = "home" | "reception" | "rent" | "boat" | "buy" | "reports" | "shift" | "search" | "bell" | "chevron" | "clock" | "bike" | "bed" | "coffee" | "laundry" | "spa" | "car" | "cake" | "utensils" | "cash" | "card" | "transfer" | "room" | "case" | "database" | "staff" | "dive" | "fish" | "camera" | "sun" | "water" | "shirt" | "check" | "printer" | "none" | "dashboard" | "bank";

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
    printer: <><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></>
  };
  return <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 24 24" width={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}>{paths[name]}</svg>;
}

const formatIDR = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

// --- KOMPONEN LAINNYA TETAP ---
function ReceiptModal({ transaction, onClose }: { transaction: any, onClose: () => void }) {
  if (!transaction) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '380px', color: '#0f172a', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>Receipt Preview</h3><button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', border: '1px dashed #ccc', padding: '20px', backgroundColor: '#fafafa', fontFamily: 'monospace', fontSize: '13px' }}>
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #666', paddingBottom: '12px', marginBottom: '12px' }}>
            <strong style={{ fontSize: '18px' }}>GILI AMOR</strong><div style={{ fontSize: '12px' }}>Boutique Resort</div>
          </div>
          <div style={{ marginBottom: '12px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>No:</span> <span>{transaction.receipt}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Guest:</span> <span>{transaction.guest}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Method:</span> <span>{transaction.method}</span></div>
            {transaction.bookingSource !== "-" && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Source:</span> <span>{transaction.bookingSource}</span></div>}
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
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}><button onClick={onClose} style={{ flex: 1, padding: '10px', background: '#f1f5f9', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Close</button></div>
      </div>
    </div>
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
  const chartData = useMemo(() => {
    return Array.from({length: 7}).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      const dayTx = transactions.filter((t: any) => t.date && t.date.includes(dateStr));
      return {
        name: dateStr,
        Cash: dayTx.filter((t: any) => t.method === 'Cash').reduce((s: number, t: any) => s + (t.amount || 0), 0),
        Card: dayTx.filter((t: any) => t.method === 'Card').reduce((s: number, t: any) => s + (t.amount || 0), 0),
        Bank: dayTx.filter((t: any) => t.method === 'Bank Transfer').reduce((s: number, t: any) => s + (t.amount || 0), 0),
        Room: dayTx.filter((t: any) => t.method === 'Room Charge').reduce((s: number, t: any) => s + (t.amount || 0), 0),
      };
    });
  }, [transactions]);

  const pieData = [
    { name: 'Cash', value: chartData.reduce((s, d) => s + d.Cash, 0) },
    { name: 'Card', value: chartData.reduce((s, d) => s + d.Card, 0) },
    { name: 'Bank Transfer', value: chartData.reduce((s, d) => s + d.Bank, 0) },
    { name: 'Room Charge', value: chartData.reduce((s, d) => s + d.Room, 0) }
  ].filter(d => d.value > 0);
  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

  const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const todaysGuests = Array.from(new Set(transactions.filter(t => t.date && t.date.includes(todayStr) && t.room !== "-").map(t => `${t.guest} (Room ${t.room})`)));
  const openCases = cases.filter(c => c.status === "OPEN");

  return (
    <section className="workspace-screen">
      <header className="workspace-header"><div><p className="eyebrow">ANALYTICS</p><h1>Manager Dashboard</h1></div></header>
      <div className="workspace-content" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '320px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '15px' }}>Revenue Trend (7 Days)</h3>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(val) => `Rp${val/1000}k`} tick={{ fontSize: 11 }} width={60} />
                <Tooltip formatter={(value: any) => `Rp ${Number(value).toLocaleString('id-ID')}`} />
                <Legend />
                <Bar dataKey="Cash" stackId="a" fill="#10b981" />
                <Bar dataKey="Card" stackId="a" fill="#3b82f6" />
                <Bar dataKey="Bank" stackId="a" fill="#8b5cf6" />
                <Bar dataKey="Room" stackId="a" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '15px', textAlign: 'center' }}>Revenue Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: any) => `Rp ${Number(value).toLocaleString('id-ID')}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', overflowY: 'auto', maxHeight: '300px' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '15px' }}>Today's In-House Guest</h3>
              {todaysGuests.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {todaysGuests.map((g, i) => <li key={i} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px', fontWeight: 600 }}>{g}</li>)}
                </ul>
              ) : <p style={{ fontSize: '13px', color: '#64748b' }}>Belum ada tamu aktif hari ini.</p>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

function HomeDashboard({ onLaunch, transactions = [] }: { onLaunch: (page: string) => void, transactions?: any[] }) {
  const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const todaysTransactions = transactions.filter((t: any) => t.date && t.date.includes(todayStr));

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
        <section className="activity-panel" style={{ marginTop: '30px' }}>
          <div className="panel-heading"><div><h2>Recent Activities Detail</h2></div></div>
          <div className="activity-list">
            {todaysTransactions.slice(0, 10).map((trx: any, index) => (
              <div className="activity-row" key={index}>
                <div className={`activity-icon blue`}><Icon name="reception" size={20} /></div>
                <div className="activity-main">
                  <strong>{trx.guest} (Room {trx.room})</strong>
                  <span style={{ fontSize: '11px' }}>
                    {trx.items?.map((i:any) => `${i.qty}x ${i.name}`).join(', ')} 
                    {trx.notes !== "-" && ` | Note: ${trx.notes}`}
                  </span>
                </div>
                <strong className="activity-amount">{formatIDR(trx.amount)}</strong>
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
                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                    <button onClick={() => { setEditMode(true); setFormData({ item_code: row.id, item_service: row.name, default_rate: row.price.toString(), category: row.category, billing_type: row.billing_type, desk: row.icon, notes: row.notes || "" }); setIsModalOpen(true); }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px' }}>Edit</button>
                    <button onClick={async () => { if(confirm("Hapus?")) { await deleteMasterItem(row.id); router.refresh(); } }} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px' }}>Delete</button>
                  </div>
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

// ... SISA KOMPONEN LAINNYA BISA DIBIARKAN SAMA (ReportsDashboard, CasesDashboard, ShiftClosingDashboard, PaymentDatabaseDashboard) ...

export default function POSClientApp({ initialProducts, initialStaff, initialTransactions, initialShiftClosings, initialCases = [] }: { initialProducts?: any[]; initialStaff?: any[]; initialTransactions?: any[]; initialShiftClosings?: any[]; initialCases?: any[]; }) {
  const router = useRouter(); 
  const [currentStaff, setCurrentStaff] = useState<any>(null);
  const [activePage, setActivePage] = useState("Launchpad");

  useEffect(() => {
    const sessionData = localStorage.getItem("gili_amor_staff");
    if (sessionData) setCurrentStaff(JSON.parse(sessionData));
    else router.push("/login");
  }, [router]);

  const isAdmin = currentStaff?.role === "Admin" || currentStaff?.posisi.toLowerCase().includes("admin");
  const allowedNavs = navItems.filter(item => item.roles.includes(isAdmin ? "Admin" : "Kasir"));

  const [activeCategory, setActiveCategory] = useState("All Items");
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState("Room Charge");
  const [guestName, setGuestName] = useState(""); 
  
  // CART SEKARANG MENYIMPAN QTY DAN CUSTOM PRICE (Untuk fitur edit harga kamar)
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
  const showAdvancedBooking = cartItems.some(item => activeProducts.find(p => String(p.id) === item.id)?.category !== "RETAIL");

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
      <aside className="navigation">
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
            <div className="avatar" style={{ background: isAdmin ? '#3b82f6' : '#10b981' }}>{currentStaff ? currentStaff.nama.slice(0, 2).toUpperCase() : "GA"}</div>
            <div style={{ overflow: 'hidden' }}><strong style={{ display: 'block' }}>{currentStaff?.nama}</strong><span style={{ fontSize: '11px' }}>{currentStaff?.role}</span></div>
          </div>
          <button onClick={() => { localStorage.removeItem("gili_amor_staff"); router.push("/login"); }} style={{ width: '100%', background: '#ef4444', color: '#fff', border: 'none', padding: '6px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Logout</button>
        </div>
      </aside>

      {activePage === "Launchpad" && <HomeDashboard onLaunch={(page) => setActivePage(page)} transactions={initialTransactions} />}
      {activePage === "Dashboard" && isAdmin && <DashboardAnalytics transactions={initialTransactions} cases={initialCases} />}
      {activePage === "Master Data" && isAdmin && <MasterDataDashboard products={initialProducts} />}
      {activePage === "Staff" && isAdmin && <StaffDashboard staffData={initialStaff} />}

      {/* Render komponen lain seperti biasa... */}

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

      {isPosPage && <aside className="order-panel" style={{ overflowY: 'auto' }}>
        <div className="order-top">
          <div className="order-title"><div><h2>Current Order</h2></div></div>
          <div className="guest-fields" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label><span>Guest Name</span><input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Enter guest name" /></label>
            <label><span>Room Number</span><input id="room-input" placeholder="e.g. Room A-01" defaultValue="Walk-in" /></label>
          </div>
        </div>

        <div className="order-items">
          {cartItems.map((item) => (
            <div className="cart-item" key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className={`cart-icon ${item.color}`}><Icon name={item.icon as IconName} size={19} /></div>
                  <div className="cart-item-copy"><h4>{item.name}</h4></div>
                </div>
                <div className="quantity"><button onClick={() => updateQuantity(item.id, -1, item.price)}>−</button><span>{item.qty}</span><button onClick={() => updateQuantity(item.id, 1, item.price)}>+</button></div>
              </div>
              {/* FITUR EDIT HARGA (Report Guest In House / Custom Rate) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', width: '100%' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Rate: Rp</span>
                <input type="number" value={item.price} onChange={(e) => handleCustomPrice(item.id, Number(e.target.value))} style={{ padding: '4px', fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '4px', width: '100px' }} />
              </div>
            </div>
          ))}
        </div>

        {/* ADVANCED BOOKING DETAILS (Tampil jika ada Transfer/Deposit) */}
        {showAdvancedBooking && cartItems.length > 0 && (
          <div style={{ padding: '16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '12px', marginBottom: '10px', color: '#0f172a' }}>Booking & Travel Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px' }}>Arrival Date <input type="date" value={bookingData.arrival} onChange={e => setBookingData({...bookingData, arrival: e.target.value})} style={{ width: '100%', padding: '6px' }} /></label>
              <label style={{ fontSize: '11px' }}>Checkout Date <input type="date" value={bookingData.checkout} onChange={e => setBookingData({...bookingData, checkout: e.target.value})} style={{ width: '100%', padding: '6px' }} /></label>
              <label style={{ fontSize: '11px' }}>Booking Source 
                <select value={bookingData.source} onChange={e => setBookingData({...bookingData, source: e.target.value})} style={{ width: '100%', padding: '6px' }}>
                  <option value="Direct">Direct</option><option value="Via Telepon">Via Telepon</option><option value="OTA / Traveloka">OTA / Traveloka</option><option value="Agoda">Agoda</option>
                </select>
              </label>
              <label style={{ fontSize: '11px' }}>Notes (e.g. DP 50%) <input type="text" value={bookingData.notes} onChange={e => setBookingData({...bookingData, notes: e.target.value})} style={{ width: '100%', padding: '6px' }} placeholder="DP 500rb..." /></label>
            </div>
          </div>
        )}

        <div className="checkout">
          <div className="summary"><div className="grand-total"><span>Grand Total</span><strong>{formatIDR(subtotal)}</strong></div></div>
          <div className="payment">
            <p>Payment Method</p>
            <div className="payment-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[{ label: "Cash", icon: "cash" as IconName }, { label: "Card", icon: "card" as IconName }, { label: "Room Charge", icon: "room" as IconName }, { label: "Bank Transfer", icon: "bank" as IconName }].map((method) => (
                <button className={payment === method.label ? "active" : ""} key={method.label} onClick={() => setPayment(method.label)}><Icon name={method.icon} size={16} /><span style={{ fontSize: '11px' }}>{method.label}</span></button>
              ))}
            </div>
          </div>

          <button disabled={cartItems.length === 0} onClick={async () => {
            const roomInputValue = (document.getElementById("room-input") as HTMLInputElement)?.value || "Walk-in";
            const finalOrderData = { 
              guestName: guestName || "Walk-in Guest", 
              paymentMethod: payment, 
              totalAmount: subtotal, 
              room: roomInputValue,
              staffId: currentStaff?.dbId, 
              arrivalDate: bookingData.arrival,
              checkoutDate: bookingData.checkout,
              bookingSource: bookingData.source,
              paymentNotes: bookingData.notes,
              items: cartItems.map(item => ({ item_code: item.id, qty: item.qty, rate: item.price, total: item.price * item.qty })) 
            };
            const result = await saveTransaction(finalOrderData);
            if (result.success) { setCart({}); setBookingData({ arrival: "", checkout: "", source: "Direct", notes: "" }); router.refresh(); } 
            else alert("Gagal menyimpan: " + result.error);
          }}>
            Save Transaction <span>{formatIDR(subtotal)}</span>
          </button>
        </div>
      </aside>}
    </main>
  );
}