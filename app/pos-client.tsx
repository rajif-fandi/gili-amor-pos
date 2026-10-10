"use client";
import { useRouter } from "next/navigation";
import { saveTransaction, addMasterItem, deleteMasterItem, updateMasterItem, addStaff, deleteStaff, saveShiftClosing, saveCaseFollowUp, resolveCase } from "./actions";
import { useMemo, useState, useEffect } from "react";

type IconName =
  | "home" | "reception" | "rent" | "boat" | "buy" | "reports" | "shift" | "search"
  | "bell" | "chevron" | "clock" | "bike" | "bed" | "coffee" | "laundry" | "spa"
  | "car" | "cake" | "utensils" | "cash" | "card" | "transfer" | "room" | "case"
  | "database" | "staff" | "dive" | "fish" | "camera" | "sun" | "water" | "shirt"
  | "check" | "printer" | "none";

function Icon({ name, size = 20, strokeWidth = 1.8 }: { name: IconName; size?: number; strokeWidth?: number; }) {
  if (name === "none") return <div style={{ width: size, height: size }} />;
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-7h6v7" /></>,
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

  return (
    <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 24 24" width={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}>
      {paths[name]}
    </svg>
  );
}

const formatIDR = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

function ReceiptModal({ transaction, onClose }: { transaction: any, onClose: () => void }) {
  if (!transaction) return null;

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-receipt, #printable-receipt * { visibility: visible; }
          #printable-receipt {
            position: absolute; left: 0; top: 0; width: 80mm; margin: 0; padding: 5mm;
            font-family: monospace, sans-serif; color: #000;
          }
          .hide-on-print { display: none !important; }
        }
      `}</style>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '380px', color: '#0f172a', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
          <div className="hide-on-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Receipt Preview</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>×</button>
          </div>
          
          <div id="printable-receipt" style={{ flex: 1, overflowY: 'auto', border: '1px dashed #ccc', padding: '20px', backgroundColor: '#fafafa', fontFamily: 'monospace', fontSize: '13px' }}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #666', paddingBottom: '12px', marginBottom: '12px' }}>
              <strong style={{ fontSize: '18px' }}>GILI AMOR</strong>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>Boutique Resort</div>
              <div style={{ fontSize: '11px', marginTop: '4px' }}>Gili Trawangan, Lombok</div>
            </div>
            
            <div style={{ marginBottom: '12px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Receipt No:</span> <span>{transaction.receipt}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Date:</span> <span>{transaction.date}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Guest:</span> <span>{transaction.guest}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Method:</span> <span>{transaction.method}</span></div>
            </div>
            
            <div style={{ borderTop: '1px dashed #666', borderBottom: '1px dashed #666', padding: '12px 0', marginBottom: '12px' }}>
              {transaction.items && transaction.items.length > 0 ? (
                transaction.items.map((item: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: '8px' }}>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{item.qty} x {item.price.toLocaleString("id-ID")}</span>
                      <span>{item.total.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontStyle: 'italic', color: '#666' }}>No detailed items available.</div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', marginBottom: '24px' }}>
              <span>TOTAL</span>
              <span>{formatIDR(transaction.total)}</span>
            </div>
            
            <div style={{ textAlign: 'center', fontSize: '11px', marginTop: '20px' }}>
              <p>Thank you for choosing Gili Amor!</p>
              <p>Have a pleasant day.</p>
            </div>
          </div>
          
          <div className="hide-on-print" style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button onClick={onClose} style={{ flex: 1, padding: '10px', background: '#f1f5f9', color: '#475569', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Close</button>
            <button onClick={() => window.print()} style={{ flex: 2, padding: '10px', background: '#10b981', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Icon name="printer" size={16} /> Print Receipt
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const navItems: { label: string; icon: IconName }[] = [
  { label: "Home", icon: "home" },
  { label: "Reception", icon: "reception" },
  { label: "Rent", icon: "rent" },
  { label: "Boat", icon: "boat" },
  { label: "Buy", icon: "buy" },
  { label: "Case / Follow-up", icon: "case" },
  { label: "Payment Database", icon: "database" },
  { label: "Case Report", icon: "reports" },
  { label: "Reports", icon: "reports" },
  { label: "Shift Closing", icon: "shift" },
  { label: "Master Data", icon: "database" },
  { label: "Staff", icon: "staff" },
];

const controlCenterItems = [
  { label: "Reception POS", description: "Guest services & charges", icon: "reception" as IconName, color: "blue" },
  { label: "Rent POS", description: "Equipment & bicycle rental", icon: "rent" as IconName, color: "mint" },
  { label: "Boat POS", description: "Trips & island transfers", icon: "boat" as IconName, color: "sky" },
  { label: "Buy POS", description: "Retail & resort shop", icon: "buy" as IconName, color: "peach" },
  { label: "Case / Follow-up", description: "Guest requests & cases", icon: "case" as IconName, color: "rose" },
  { label: "Payment Database", description: "Payment records", icon: "database" as IconName, color: "lilac" },
  { label: "Daily Report", description: "Daily financial overview", icon: "reports" as IconName, color: "sand" },
  { label: "Case Report", description: "Cases & resolution status", icon: "case" as IconName, color: "pink" },
  { label: "Shift Closing", description: "Reconcile current shift", icon: "shift" as IconName, color: "mint" },
  { label: "Master Data", description: "Products, prices & rooms", icon: "database" as IconName, color: "blue" },
  { label: "Staff", description: "Team & access management", icon: "staff" as IconName, color: "lime" },
];

function HomeDashboard({ onLaunch, transactions = [] }: { onLaunch: (page: string) => void, transactions?: any[] }) {
  const recentActivities = transactions.slice(0, 5).map((trx: any) => ({
    time: trx.time,
    guest: trx.guest,
    detail: trx.items && trx.items.length > 0 
      ? `${trx.items[0].name} ${trx.items.length > 1 ? `(+${trx.items.length - 1} item)` : ''} · Room ${trx.room}` 
      : `Payment · Room ${trx.room}`,
    amount: trx.amount,
    icon: trx.method === "Cash" ? "cash" : trx.method === "Card" ? "card" : ("room" as IconName),
    color: trx.method === "Cash" ? "mint" : trx.method === "Card" ? "blue" : "sand"
  }));

  return (
    <section className="workspace-screen">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">GILI AMOR RESORT</p>
          <h1>Good Morning, Front Desk</h1>
          <p className="header-subtitle">Here is what is happening at Gili Amor today.</p>
        </div>
      </header>

      <div className="workspace-content">
        <section className="control-center">
          <div className="control-heading">
            <div>
              <h2>Control Center</h2>
              <p>Quick access to your daily resort operations</p>
            </div>
            <span>11 applications</span>
          </div>
          <div className="launchpad-grid">
            {controlCenterItems.map((item) => (
              <button
                className="launchpad-card"
                key={item.label}
                onClick={() => {
                  const destinations: Record<string, string> = {
                    "Reception POS": "Reception", "Rent POS": "Rent", "Boat POS": "Boat", "Buy POS": "Buy",
                    "Case / Follow-up": "Case / Follow-up", "Payment Database": "Payment Database", 
                    "Daily Report": "Reports", "Case Report": "Case Report", "Shift Closing": "Shift Closing",
                    "Master Data": "Master Data", "Staff": "Staff",
                  };
                  if (destinations[item.label]) onLaunch(destinations[item.label]);
                }}
              >
                <span className={`launchpad-icon ${item.color}`}><Icon name={item.icon} size={27} strokeWidth={1.65} /></span>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
                <span className="launch-arrow">→</span>
              </button>
            ))}
          </div>
        </section>

        <section className="activity-panel">
          <div className="panel-heading">
            <div><h2>Recent Activities</h2><p>Latest guest transactions and services</p></div>
          </div>
          <div className="activity-list">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div className="activity-row" key={`${activity.time}-${activity.guest}-${index}`}>
                  <div className={`activity-icon ${activity.color}`}><Icon name={activity.icon as IconName} size={20} /></div>
                  <div className="activity-main"><strong>{activity.guest}</strong><span>{activity.detail}</span></div>
                  <time>{activity.time}</time>
                  <strong className="activity-amount">{formatIDR(activity.amount)}</strong>
                </div>
              ))
            ) : (
              <p style={{ padding: '20px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>Belum ada aktivitas hari ini.</p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

function ReportsDashboard({ transactions = [] }: { transactions?: any[] }) {
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  const displayRows = transactions.length > 0 ? transactions : [];
  const cashTransactions = displayRows.filter((t) => t.method === "Cash");
  const totalCash = cashTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const cardTransactions = displayRows.filter((t) => t.method === "Card");
  const totalCard = cardTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <section className="workspace-screen">
      {selectedReceipt && <ReceiptModal transaction={selectedReceipt} onClose={() => setSelectedReceipt(null)} />}
      
      <header className="workspace-header reports-header">
        <div>
          <p className="eyebrow">FINANCIAL OVERVIEW</p>
          <h1>Daily Payment Report</h1>
          <p className="header-subtitle">Review and reconcile today's guest payments.</p>
        </div>
      </header>

      <div className="workspace-content">
        <div className="report-metrics">
          <article className="report-metric-card">
            <div className="metric-icon mint"><Icon name="cash" size={23} /></div>
            <div><p>Total Cash Sales</p><strong>{formatIDR(totalCash)}</strong><span>{cashTransactions.length} transactions</span></div>
          </article>
          <article className="report-metric-card">
            <div className="metric-icon blue"><Icon name="card" size={23} /></div>
            <div><p>Total Card Sales</p><strong>{formatIDR(totalCard)}</strong><span>{cardTransactions.length} transactions</span></div>
          </article>
        </div>

        <section className="report-table-panel">
          <div className="panel-heading report-table-heading">
            <div><h2>Payment Transactions</h2><p>All recorded transactions</p></div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Receipt No</th>
                  <th>Guest Name</th>
                  <th>Payment Method</th>
                  <th>Total Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row) => (
                  <tr key={row.receipt || row.id}>
                    <td>{row.time}</td>
                    <td><strong>{row.receipt}</strong></td>
                    <td>{row.guest}</td>
                    <td>
                      <span className={`payment-badge ${row.method.toLowerCase()}`}>
                        <Icon name={row.method === "Cash" ? "cash" : row.method === "Card" ? "card" : "room"} size={14} />
                        {row.method}
                      </span>
                    </td>
                    <td><strong>{formatIDR(row.amount)}</strong></td>
                    <td>
                      <button onClick={() => setSelectedReceipt(row)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#e2e8f0', color: '#334155', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                        <Icon name="printer" size={14} /> Print
                      </button>
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

function CasesDashboard({ staffList = [], cases = [] }: { staffList?: any[], cases?: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ desk: "Front Office", case_type: "Maintenance", nama_tamu: "", room: "", priority: "Medium", description: "", assigned_to: staffList.length > 0 ? staffList[0].dbId : "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assigned_to) return alert("Pilih staf yang bertugas terlebih dahulu!");
    setIsSubmitting(true);
    const result = await saveCaseFollowUp(formData);
    if (result.success) { alert("Tugas/Case berhasil ditambahkan!"); window.location.reload(); } 
    else { alert("Gagal menyimpan: " + result.error); }
    setIsSubmitting(false);
  };

  const handleResolve = async (caseNo: string) => {
    if (confirm("Tandai tugas ini sebagai selesai?")) {
      const result = await resolveCase(caseNo);
      if (result.success) window.location.reload();
      else alert("Gagal menyelesaikan: " + result.error);
    }
  };

  return (
    <section className="workspace-screen">
      <header className="workspace-header">
        <div><p className="eyebrow">OPERATIONS</p><h1>Case & Follow-up</h1><p className="header-subtitle">Kelola permintaan tamu dan tugas operasional staf.</p></div>
      </header>
      <div className="workspace-content" style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 2fr', alignItems: 'start' }}>
        <section className="report-table-panel" style={{ padding: '24px' }}>
          <h2>Buat Tugas Baru</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <label><span style={{ fontSize: '12px', fontWeight: 600 }}>Tipe Case</span><select value={formData.case_type} onChange={(e) => setFormData({...formData, case_type: e.target.value})} style={{ width: '100%', padding: '8px' }}><option value="Maintenance">Maintenance</option><option value="Housekeeping">Housekeeping</option><option value="Room Service">Room Service</option><option value="Transport">Transport</option></select></label>
            <label><span style={{ fontSize: '12px', fontWeight: 600 }}>Nama Tamu / Room</span><div style={{ display: 'flex', gap: '8px' }}><input placeholder="Nama Tamu" required value={formData.nama_tamu} onChange={(e) => setFormData({...formData, nama_tamu: e.target.value})} style={{ flex: 1, padding: '8px' }} /><input placeholder="Room" required value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} style={{ width: '80px', padding: '8px' }} /></div></label>
            <label><span style={{ fontSize: '12px', fontWeight: 600 }}>Prioritas</span><select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} style={{ width: '100%', padding: '8px' }}><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High (Urgent)</option></select></label>
            <label><span style={{ fontSize: '12px', fontWeight: 600 }}>Tugaskan Kepada</span><select value={formData.assigned_to} onChange={(e) => setFormData({...formData, assigned_to: e.target.value})} style={{ width: '100%', padding: '8px' }}>{staffList.map(staff => (<option key={staff.dbId} value={staff.dbId}>{staff.name} ({staff.position})</option>))}</select></label>
            <label><span style={{ fontSize: '12px', fontWeight: 600 }}>Deskripsi</span><textarea required rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '8px' }} /></label>
            <button className="submit-shift-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan Tugas"}</button>
          </form>
        </section>
        <section className="report-table-panel">
          <div className="panel-heading"><h2>Daftar Tugas</h2></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>No Case</th><th>Kategori</th><th>Kamar & Tamu</th><th>Ditugaskan Ke</th><th>Status / Aksi</th></tr></thead>
              <tbody>
                {cases.map((c: any) => (
                  <tr key={c.case_no} style={{ opacity: c.status === 'RESOLVED' ? 0.6 : 1 }}>
                    <td><strong>{c.case_no}</strong></td>
                    <td>{c.case_type} <br/><small style={{color: c.priority === 'High' ? 'red' : 'gray'}}>{c.priority} Priority</small></td>
                    <td>{c.room} - {c.nama_tamu} <br/><small>{c.description}</small></td>
                    <td>{c.staff_name}</td>
                    <td>
                      {c.status === 'OPEN' ? (
                        <button onClick={() => handleResolve(c.case_no)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                          Resolve
                        </button>
                      ) : (
                        <span className="payment-badge cash">RESOLVED</span>
                      )}
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
  const [openingCashInput, setOpeningCashInput] = useState("1000000"); 
  const openingCash = Number(openingCashInput) || 0;

  const displayRows = transactions.length > 0 ? transactions : [];
  const cashSales = displayRows.filter(t => t.method === "Cash").reduce((sum, t) => sum + (t.amount || 0), 0);
  const cardSales = displayRows.filter(t => t.method === "Card").reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const expectedCash = openingCash + cashSales;
  const [actualCash, setActualCash] = useState(expectedCash.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const actualValue = Number(actualCash) || 0;
  const variance = actualValue - expectedCash;

  useEffect(() => {
    setActualCash(expectedCash.toString());
  }, [expectedCash]);

  const handleSubmitClosing = async () => {
    setIsSubmitting(true);
    const result = await saveShiftClosing({ 
      openingCash, 
      cashSales, 
      cardSales, 
      expectedCash, 
      actualCash: actualValue, 
      variance, 
      shift: currentStaff ? currentStaff.shift : "Morning" 
    });
    if (result.success) { 
      alert("Shift closing berhasil disubmit!"); 
      window.location.reload(); 
    } else { 
      alert("Gagal menyimpan: " + result.error); 
    }
    setIsSubmitting(false);
  };

  return (
    <section className="workspace-screen">
      <header className="workspace-header"><div><p className="eyebrow">FRONT OFFICE · SHIFT CLOSING</p><h1>Cash Reconciliation</h1></div></header>
      <div className="workspace-content shift-content">
        <div className="shift-summary">
          {[{ label: "Opening Cash", value: openingCash, icon: "cash" as IconName, color: "sand" }, { label: "Total Cash Sales", value: cashSales, icon: "cash" as IconName, color: "mint" }, { label: "Total Card Sales", value: cardSales, icon: "card" as IconName, color: "blue" }].map((item) => (
            <article className="shift-summary-card" key={item.label}><div className={`metric-icon ${item.color}`}><Icon name={item.icon} size={22} /></div><p>{item.label}</p><strong>{formatIDR(item.value)}</strong></article>
          ))}
        </div>
        <section className="reconciliation-panel">
          <div className="reconciliation-heading"><div><h2>Cash Reconciliation</h2></div><div className="reconciliation-icon"><Icon name="shift" size={25} /></div></div>
          <div className="reconciliation-form">
            <label>
              <span>Opening Cash (Modal Awal)</span>
              <div className="currency-input">
                <span>Rp</span>
                <input 
                  inputMode="numeric" 
                  onChange={(event) => setOpeningCashInput(event.target.value.replace(/\D/g, ""))} 
                  value={openingCashInput} 
                />
              </div>
            </label>
            
            <label><span>Expected Cash in Drawer</span><div className="currency-input readonly"><span>Rp</span><input readOnly value={expectedCash.toLocaleString("id-ID")} /></div></label>
            <label>
              <span>Actual Cash Counted (Fisik)</span>
              <div className="currency-input">
                <span>Rp</span>
                <input 
                  inputMode="numeric" 
                  onChange={(event) => setActualCash(event.target.value.replace(/\D/g, ""))} 
                  value={actualCash} 
                />
              </div>
            </label>
            <div className={`variance-field ${variance === 0 ? "balanced" : variance > 0 ? "over" : "short"}`}>
              <div><span>Variance</span><small>{variance === 0 ? "Cash drawer is balanced" : variance > 0 ? "Cash over expected amount" : "Cash short of expected amount"}</small></div>
              <strong>{variance > 0 ? "+" : ""}{formatIDR(variance)}</strong>
            </div>
            <button className="submit-shift-button" type="button" disabled={isSubmitting} onClick={handleSubmitClosing}><Icon name="check" size={21} strokeWidth={2.3} />{isSubmitting ? "Submitting..." : "Submit Shift Closing"}</button>
          </div>
        </section>
        <section className="report-table-panel" style={{ marginTop: '24px' }}>
          <div className="panel-heading"><div><h2>Shift Closing History</h2></div></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Close No</th><th>Tanggal & Waktu</th><th>Expected Cash</th><th>Actual Cash</th><th>Variance</th></tr></thead>
              <tbody>
                {shiftClosings.map((closing: any) => (<tr key={closing.close_no}><td><strong>{closing.close_no}</strong></td><td>{new Date(closing.tanggal).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</td><td>{formatIDR(closing.expected_cash)}</td><td>{formatIDR(closing.actual_cash)}</td><td><span className={`payment-badge ${closing.variance === 0 ? 'room' : closing.variance > 0 ? 'cash' : 'card'}`}>{closing.variance > 0 ? "+" : ""}{formatIDR(closing.variance)}</span></td></tr>))}
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
  const displayRows = transactions.length > 0 ? transactions : [];
  
  return (
    <section className="workspace-screen">
      {selectedReceipt && <ReceiptModal transaction={selectedReceipt} onClose={() => setSelectedReceipt(null)} />}
      
      <header className="workspace-header database-header">
        <div><p className="eyebrow">TRANSACTION RECORDS</p><h1>Payment Database</h1></div>
      </header>
      <div className="workspace-content">
        <section className="report-table-panel">
          <div className="panel-heading"><div><h2>All Transactions</h2></div></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Transaction ID</th><th>Date & Time</th><th>Guest Name</th><th>Payment Method</th><th>Grand Total</th><th>Action</th></tr></thead>
              <tbody>
                {displayRows.map((row) => (
                  <tr key={row.id}>
                    <td><strong>{row.id}</strong></td><td>{row.date}</td><td>{row.guest}</td>
                    <td><span className={`payment-badge ${row.method.toLowerCase()}`}><Icon name={row.method === "Cash" ? "cash" : row.method === "Card" ? "card" : "room"} size={14} />{row.method}</span></td>
                    <td><strong>{formatIDR(row.total)}</strong></td>
                    <td><button onClick={() => setSelectedReceipt(row)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#e2e8f0', color: '#334155', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}><Icon name="printer" size={14} /> Print</button></td>
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
  const totalCases = cases.length;
  const resolvedCasesCount = cases.filter((c: any) => c.status !== "OPEN").length; 

  return (
    <section className="workspace-screen">
      <header className="workspace-header">
        <div><p className="eyebrow">PERFORMANCE & ANALYTICS</p><h1>Operational Case Report</h1></div>
      </header>
      <div className="workspace-content">
        <div className="analytics-metrics">
          <article>
            <span className="analytics-icon blue"><Icon name="case" size={21} /></span>
            <div><p>Total Cases</p><strong>{totalCases}</strong></div>
          </article>
          <article>
            <span className="analytics-icon mint"><Icon name="check" size={21} /></span>
            <div><p>Resolved</p><strong>{resolvedCasesCount}</strong></div>
          </article>
        </div>
        <div className="analytics-grid">
          <section className="analytics-panel resolved-panel">
            <div className="panel-heading"><div><h2>Recent Cases Overview</h2></div></div>
            <div className="resolved-list">
              {cases.length > 0 ? cases.map((item: any) => (
                <div className="resolved-row" key={item.case_no}>
                  <span className="resolved-check">
                    <Icon name={item.status === 'OPEN' ? "clock" : "check"} size={14} strokeWidth={2.4} />
                  </span>
                  <div>
                    <strong>{item.case_type} - {item.priority} Priority</strong>
                    <p>{item.case_no} · Room {item.room} · Staf: {item.staff_name} · Tamu: {item.nama_tamu}</p>
                    <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>"{item.description}"</p>
                  </div>
                  <time>
                    <span className={`payment-badge ${item.status === 'OPEN' ? 'room' : 'cash'}`}>
                      {item.status}
                    </span>
                  </time>
                </div>
              )) : (
                <p style={{ padding: '20px', color: '#64748b', fontSize: '14px' }}>Belum ada case atau tugas operasional saat ini.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function MasterDataDashboard({ products = [] }: { products?: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const defaultForm = { 
    item_code: "", 
    item_service: "", 
    default_rate: "", 
    category: "CHARGE", 
    billing_type: "PER_UNIT",
    desk: "none",
    notes: "" 
  };
  
  const [formData, setFormData] = useState(defaultForm);
  const displayRows = products.length > 0 ? products : [];

  const handleOpenAdd = () => {
    setEditMode(false);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditMode(true);
    setFormData({
      item_code: item.id,
      item_service: item.name,
      default_rate: item.price.toString(),
      category: item.category,
      billing_type: item.billing_type,
      desk: item.icon,
      notes: item.notes || ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = { 
      item_code: formData.item_code,
      item_service: formData.item_service, 
      default_rate: Number(formData.default_rate), 
      category: formData.category, 
      billing_type: formData.billing_type,
      desk: formData.desk,
      notes: formData.notes
    };
    
    const result = editMode ? await updateMasterItem(payload) : await addMasterItem(payload);
    
    if (result.success) { 
      setIsModalOpen(false); 
      window.location.reload(); 
    } else { 
      alert("Gagal menyimpan: " + result.error); 
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (itemCode: string) => {
    if (confirm("Yakin hapus?")) { 
      const result = await deleteMasterItem(itemCode); 
      if (result.success) window.location.reload(); 
    }
  };

  return (
    <section className="workspace-screen">
      <header className="workspace-header">
        <div><h2>Master Data</h2></div>
        <button className="export-button add-case-button" type="button" onClick={handleOpenAdd}>Add New Item</button>
      </header>
      
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '480px', color: '#0f172a', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '16px' }}>{editMode ? "Edit Item" : "Add New Item"}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Item Code</label>
                <input type="text" placeholder="Cth: RENT-BIKE" required value={formData.item_code} onChange={(e) => setFormData({...formData, item_code: e.target.value.toUpperCase()})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: editMode ? '#f1f5f9' : '#fff' }} disabled={editMode} />
                {editMode && <small style={{ color: '#64748b', fontSize: '11px' }}>*Kode tidak bisa diubah saat mode edit.</small>}
              </div>
              
              <div><label style={{ fontSize: '12px', fontWeight: 600 }}>Item / Service Name</label><input type="text" required value={formData.item_service} onChange={(e) => setFormData({...formData, item_service: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
              
              <div><label style={{ fontSize: '12px', fontWeight: 600 }}>Default Rate (Rp)</label><input type="number" required value={formData.default_rate} onChange={(e) => setFormData({...formData, default_rate: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="CHARGE">CHARGE</option><option value="RENTAL">RENTAL</option><option value="ACTIVITY">ACTIVITY</option><option value="TRANSFER">TRANSFER</option><option value="RETAIL">RETAIL</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Billing Type</label>
                  <select value={formData.billing_type} onChange={(e) => setFormData({...formData, billing_type: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="PER_UNIT">PER_UNIT</option><option value="PER_DAY">PER_DAY</option><option value="PER_PAX">PER_PAX</option><option value="PER_TRIP">PER_TRIP</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Icon / Logo</label>
                  <select value={formData.desk} onChange={(e) => setFormData({...formData, desk: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="none">No Logo / Default</option>
                    <option value="coffee">Coffee / Breakfast</option>
                    <option value="bed">Bed / Room</option>
                    <option value="bike">Bike / Vehicle</option>
                    <option value="spa">Spa / Treatment</option>
                    <option value="car">Car / Transfer</option>
                    <option value="laundry">Laundry</option>
                    <option value="sun">Sun / Essentials</option>
                    <option value="rent">Rent / E-Bike</option>
                    <option value="dive">Dive / Snorkeling</option>
                    <option value="clock">Clock / Late Charge</option>
                    <option value="cake">Cake / Celebration</option>
                    <option value="utensils">Utensils / Restaurant</option>
                    <option value="camera">Camera / Go Pro</option>
                    <option value="fish">Fish / Fishing</option>
                    <option value="boat">Boat / Trip</option>
                    <option value="water">Water / Drinks</option>
                    <option value="buy">Shopping Bag / Retail</option>
                    <option value="shirt">Shirt / Apparel</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Notes</label>
                  <input type="text" placeholder="Cth: Payment only" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 14px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={isSubmitting} style={{ padding: '8px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>{isSubmitting ? "Saving..." : "Save Item"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="workspace-content">
        <table className="data-table">
          <thead><tr><th>ITEM CODE</th><th>ITEM / SERVICE</th><th>CATEGORY</th><th>BILLING</th><th>RATE</th><th>ACTION</th></tr></thead>
          <tbody>
            {displayRows.map((row: any) => (
              <tr key={row.id}>
                <td><strong>{row.id}</strong></td>
                <td>{row.name}<br/><small style={{color: '#64748b'}}>{row.notes || "-"}</small></td>
                <td><span className="badge category">{row.category}</span></td>
                <td>{row.billing_type}</td>
                <td>{formatIDR(row.price)}</td>
                <td>
                  {/* BUNGKUS DENGAN DIV AGAR TIDAK MELAR */}
                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                    <button onClick={() => handleOpenEdit(row)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Edit</button>
                    <button onClick={() => handleDelete(row.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Delete</button>
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ nama: "", posisi: "Front Desk", shift: "Morning", pin: "1234" });
  const displayStaff = staffData.length > 0 ? staffData : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await addStaff(formData);
    if (result.success) { alert("Staf berhasil ditambahkan!"); window.location.reload(); } 
    else { alert("Gagal menyimpan: " + result.error); }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Yakin ingin menghapus staf ini?")) { 
      const result = await deleteStaff(id); 
      if (result.success) window.location.reload(); 
    }
  };

  return (
    <section className="workspace-screen">
      <header className="workspace-header">
        <div><h1>Staff Directory</h1><p>Kelola data staf dan shift kerja.</p></div>
        <button className="export-button add-case-button" type="button" onClick={() => setIsModalOpen(true)}>Add New Staff</button>
      </header>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '400px', color: '#0f172a' }}>
            <h3 style={{ marginBottom: '16px' }}>Add New Staff</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div><label style={{ fontSize: '12px', fontWeight: 600 }}>Full Name</label><input type="text" required value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
              <div><label style={{ fontSize: '12px', fontWeight: 600 }}>Position</label><input type="text" required value={formData.posisi} onChange={(e) => setFormData({...formData, posisi: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Shift</label>
                <select value={formData.shift} onChange={(e) => setFormData({...formData, shift: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="Morning">Morning (AM)</option>
                  <option value="Evening">Evening (PM)</option>
                  <option value="Night">Night</option>
                </select>
              </div>
              <div><label style={{ fontSize: '12px', fontWeight: 600 }}>PIN Login</label><input type="text" required value={formData.pin} onChange={(e) => setFormData({...formData, pin: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} placeholder="1234" /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 14px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isSubmitting} style={{ padding: '8px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{isSubmitting ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="workspace-content">
        <table className="data-table">
          <thead><tr><th>STAFF</th><th>POSITION</th><th>SHIFT</th><th>ACTION</th></tr></thead>
          <tbody>
            {displayStaff.map((row: any) => (
              <tr key={row.dbId}>
                <td>{row.name}</td>
                <td>{row.position}</td>
                <td><span className="badge category">{row.shift === "Morning" ? "AM" : row.shift === "Evening" ? "PM" : row.shift}</span></td>
                <td><button onClick={() => handleDelete(row.dbId)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function POSClientApp({ initialProducts, initialStaff, initialTransactions, initialShiftClosings, initialCases = [] }: { initialProducts?: any[]; initialStaff?: any[]; initialTransactions?: any[]; initialShiftClosings?: any[]; initialCases?: any[]; }) {
  const [activePage, setActivePage] = useState("Home");
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState("Room Charge");
  const [guestName, setGuestName] = useState(""); 
  const [cart, setCart] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    const sessionData = localStorage.getItem("gili_amor_staff");
    if (sessionData) {
      setCurrentStaff(JSON.parse(sessionData));
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("gili_amor_staff");
    router.push("/login");
  };

  const isPosPage = ["Reception", "Rent", "Boat", "Buy"].includes(activePage);
  
  // LOGIKA DINAMIS MEMBACA DATABASE MASTER DATA
  const allProducts = initialProducts && initialProducts.length > 0 ? initialProducts : [];
  let activeProducts = allProducts;
  let categories = ["All Items"];

  if (activePage === "Reception") {
    activeProducts = allProducts.filter(p => p.category === "CHARGE" || p.category === "TRANSFER");
    categories = ["All Items", "CHARGE", "TRANSFER"];
  } else if (activePage === "Rent") {
    activeProducts = allProducts.filter(p => p.category === "RENTAL");
    categories = ["All Items", "RENTAL"];
  } else if (activePage === "Boat") {
    activeProducts = allProducts.filter(p => p.category === "ACTIVITY" || p.category === "TRANSFER");
    categories = ["All Items", "ACTIVITY", "TRANSFER"];
  } else if (activePage === "Buy") {
    activeProducts = allProducts.filter(p => p.category === "RETAIL");
    categories = ["All Items", "RETAIL"];
  }
  
  const visibleProducts = useMemo(() => activeProducts.filter((product) => (activeCategory === "All Items" || product.category === activeCategory) && product.name.toLowerCase().includes(query.toLowerCase())), [activeCategory, query, activeProducts]);
  const cartItems = activeProducts.filter((product) => cart[product.id]).map((product) => ({ ...product, quantity: cart[product.id] }));
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = 0;

  const updateQuantity = (id: string, change: number) => { setCart((current) => { const next = Math.max(0, (current[id] || 0) + change); const updated = { ...current }; if (next === 0) delete updated[id]; else updated[id] = next; return updated; }); };

  return (
    <main className="pos-shell">
      <aside className="navigation">
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brand-mark" style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}>
            <img src="/logo-gili.png" alt="Gili Amor Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          </div>
          <div><strong>GILI AMOR</strong><small>BOUTIQUE RESORT</small></div>
        </div>
        <nav className="nav-list">
          <p className="nav-label">WORKSPACE</p>
          {navItems.map((item) => (
            <button className={`nav-item ${item.label === activePage ? "active" : ""}`} key={item.label} onClick={() => { setActivePage(item.label); setActiveCategory("All Items"); setQuery(""); }}>
              <Icon name={item.icon} size={20} /><span>{item.label}</span>{item.label === activePage && <span className="active-dot" />}
            </button>
          ))}
        </nav>
        
        <div className="staff-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
            <div className="avatar">{currentStaff ? currentStaff.nama.slice(0, 2).toUpperCase() : "GA"}</div>
            <div style={{ overflow: 'hidden' }}>
              <strong style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{currentStaff ? currentStaff.nama : "Loading..."}</strong>
              <span style={{ fontSize: '11px' }}>{currentStaff ? `${currentStaff.posisi} • ${currentStaff.shift}` : "Staff"}</span>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', background: '#ef4444', color: '#fff', border: 'none', padding: '6px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </aside>

      {activePage === "Home" && <HomeDashboard transactions={initialTransactions} onLaunch={(page) => { setActivePage(page); setActiveCategory("All Items"); setQuery(""); }} />}
      {activePage === "Reports" && <ReportsDashboard transactions={initialTransactions} />}
      {activePage === "Case / Follow-up" && <CasesDashboard staffList={initialStaff} cases={initialCases} />}
      {activePage === "Shift Closing" && <ShiftClosingDashboard transactions={initialTransactions} shiftClosings={initialShiftClosings} currentStaff={currentStaff} />}
      {activePage === "Payment Database" && <PaymentDatabaseDashboard transactions={initialTransactions} />}
      {activePage === "Case Report" && <CaseReportDashboard cases={initialCases} />}
      {activePage === "Master Data" && <MasterDataDashboard products={initialProducts} />}
      {activePage === "Staff" && <StaffDashboard staffData={initialStaff} />}

      {isPosPage && <section className="catalog">
        <header className="catalog-header">
          <div className="top-row"><div><p className="eyebrow">GILI AMOR RESORT</p><h1>{activePage} POS</h1></div></div>
          <label className="search-field"><Icon name="search" size={21} /><input onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." type="search" value={query} /></label>
          <div className="category-row">{categories.map((category) => (<button className={activeCategory === category ? "active" : ""} key={category} onClick={() => setActiveCategory(category)}>{category}</button>))}</div>
        </header>
        <div className="catalog-body">
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <button className="product-card" key={product.id} onClick={() => updateQuantity(product.id, 1)}>
                <div className={`product-icon ${product.color}`}><Icon name={product.icon as IconName} size={27} strokeWidth={1.6} /></div>
                <div className="product-copy"><h3>{product.name}</h3><p>{product.category}</p></div>
                <strong>{formatIDR(product.price)}</strong><span className="add-product">+</span>
              </button>
            ))}
          </div>
        </div>
      </section>}

      {isPosPage && <aside className="order-panel">
        <div className="order-top">
          <div className="order-title"><div><h2>Current Order</h2></div></div>
          <div className="guest-fields" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label><span>Guest Name</span><input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Enter guest name" /></label>
            <label><span>Room Number</span><input id="room-input" placeholder="e.g. Room A-01" defaultValue="Walk-in" /></label>
          </div>
        </div>

        <div className="order-items">
          {cartItems.map((item) => (
            <div className="cart-item" key={item.id}>
              <div className={`cart-icon ${item.color}`}><Icon name={item.icon as IconName} size={19} strokeWidth={1.7} /></div>
              <div className="cart-item-copy"><h4>{item.name}</h4><p>{formatIDR(item.price)}</p></div>
              <div className="quantity"><button onClick={() => updateQuantity(item.id, -1)}>−</button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)}>+</button></div>
            </div>
          ))}
        </div>

        <div className="checkout">
          <div className="summary"><div className="grand-total"><span>Grand Total</span><strong>{formatIDR(subtotal - discount)}</strong></div></div>
          <div className="payment">
            <p>Payment Method</p>
            <div className="payment-options">
              {[{ label: "Cash", icon: "cash" as IconName }, { label: "Card", icon: "card" as IconName }, { label: "Room Charge", icon: "room" as IconName }].map((method) => (
                <button className={payment === method.label ? "active" : ""} key={method.label} onClick={() => setPayment(method.label)}><Icon name={method.icon} size={19} /><span>{method.label}</span></button>
              ))}
            </div>
          </div>

         <button className={`save-button ${saved ? "saved" : ""}`} disabled={cartItems.length === 0} onClick={async () => {
            const roomInputValue = (document.getElementById("room-input") as HTMLInputElement)?.value || "Walk-in";
            
            const finalOrderData = { 
              guestName: guestName || "Walk-in Guest", 
              paymentMethod: payment, 
              totalAmount: subtotal - discount, 
              room: roomInputValue,
              staffId: currentStaff ? currentStaff.id : undefined, 
              items: Object.entries(cart).map(([itemId, qty]) => { 
                const product = activeProducts.find((p) => String(p.id) === String(itemId)); 
                return { 
                  item_code: product ? String(product.id) : String(itemId), 
                  qty, 
                  rate: product ? product.price : 0, 
                  total: product ? (product.price * qty) : 0 
                }; 
              }) 
            };
            const result = await saveTransaction(finalOrderData as any);
            if (result.success) { setSaved(true); setCart({}); window.setTimeout(() => setSaved(false), 1800); window.location.reload(); } else { alert("Gagal menyimpan: " + result.error); }
          }}>
            {saved ? <><Icon name="check" size={22} strokeWidth={2.5} /> Transaction Saved</> : <>Save Transaction <span>{formatIDR(subtotal - discount)}</span></>}
          </button>
        </div>
      </aside>}
    </main>
  );
}