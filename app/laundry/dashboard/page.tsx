"use client";
import { useState, useEffect } from "react";
import { getLaundryOrders, weighLaundryOrder } from "../../actions";
import { withFee } from "../../config";

interface LaundryOrder {
  id: string;
  order_no: string;
  room: string;
  guest_name: string;
  whatsapp: string;
  items_detail: any; 
  total_pcs: number;
  notes?: string | null;
  weight_kg?: number | null;
  service_type?: string | null;
  total_price?: number | null;
  payment_method?: string | null;
  status: string;
  created_at: string | Date;
}

const formatIDR = (v: number) => `Rp ${v.toLocaleString("id-ID")}`;

const css = `
  html, body { width: 100% !important; min-width: 0 !important; max-width: 100vw !important; margin: 0 !important; overflow-x: hidden; }
  .ld * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; min-width: 0; }
  .ld { width: 100%; overflow-x: hidden; min-height: 100dvh; background: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; }
  .ld-wrap { max-width: 1000px; margin: 0 auto; padding-bottom: 40px; }
  .ld-hero { background: linear-gradient(135deg, #0369a1, #0ea5e9); color: #fff; padding: 24px 20px 64px; border-radius: 0 0 28px 28px; }
  .ld-hero-in { max-width: 1000px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .ld-hero h1 { margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 1px; }
  .ld-hero p { margin: 4px 0 0; font-size: 12px; opacity: .85; line-height: 1.4; }
  .ld-refresh { flex-shrink: 0; padding: 12px 16px; border: none; border-radius: 12px; background: #fff; color: #0369a1; font-size: 13px; font-weight: 800; cursor: pointer; touch-action: manipulation; }
  .ld-refresh:active { transform: scale(.96); }
  .ld-refresh:disabled { opacity: .6; }
  .ld-body { padding: 0 16px; margin-top: -40px; }
  .ld-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
  .ld-stat { background: #fff; border-radius: 16px; padding: 14px 10px; text-align: center; box-shadow: 0 4px 16px rgba(15,23,42,.06); }
  .ld-stat b { display: block; font-size: 26px; font-weight: 900; line-height: 1; }
  .ld-stat small { display: block; margin-top: 6px; font-size: 11px; font-weight: 700; letter-spacing: .8px; color: #64748b; }
  
  /* CSS Baru untuk Kotak Pencarian */
  .ld-search { width: 100%; padding: 14px 16px; border-radius: 14px; border: 1.5px solid #e2e8f0; font-size: 14px; margin-bottom: 16px; outline: none; box-shadow: 0 4px 16px rgba(15,23,42,.04); transition: all 0.2s; }
  .ld-search:focus { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14,165,233,.15); }

  .ld-tabs { display: flex; gap: 8px; margin-bottom: 16px; overflow-x: auto; padding-bottom: 2px; }
  .ld-tab { flex-shrink: 0; padding: 10px 18px; border: 1.5px solid #e2e8f0; border-radius: 999px; background: #fff; color: #475569; font-size: 13px; font-weight: 700; cursor: pointer; touch-action: manipulation; }
  .ld-tab.on { background: #0284c7; border-color: #0284c7; color: #fff; }
  .ld-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: 14px; align-items: start; }
  .ld-card { background: #fff; border-radius: 18px; padding: 16px; box-shadow: 0 4px 16px rgba(15,23,42,.06); border-top: 5px solid #f59e0b; }
  .ld-card.weighed { border-top-color: #0ea5e9; }
  .ld-card.done { border-top-color: #10b981; }
  .ld-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
  .ld-no { font-size: 11px; font-weight: 800; letter-spacing: .8px; color: #94a3b8; }
  .ld-top h3 { margin: 3px 0 0; font-size: 16px; font-weight: 800; line-height: 1.3; word-break: break-word; }
  .ld-badge { flex-shrink: 0; padding: 5px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; background: #fef3c7; color: #92400e; }
  .ld-card.weighed .ld-badge { background: #e0f2fe; color: #0369a1; }
  .ld-card.done .ld-badge { background: #d1fae5; color: #065f46; }
  .ld-items { background: #f8fafc; border-radius: 12px; padding: 12px; margin-bottom: 12px; }
  .ld-items-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 12px; font-weight: 800; color: #475569; letter-spacing: .5px; }
  .ld-items-title span { background: #0284c7; color: #fff; padding: 3px 10px; border-radius: 999px; }
  .ld-item { display: flex; justify-content: space-between; gap: 10px; padding: 6px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; color: #334155; }
  .ld-item:last-child { border-bottom: none; }
  .ld-item b { color: #0369a1; flex-shrink: 0; }
  .ld-notes { background: #fef3c7; color: #92400e; border-radius: 12px; padding: 10px 12px; margin-bottom: 12px; font-size: 13px; line-height: 1.5; }
  .ld-weigh { background: #f0f9ff; border-radius: 14px; padding: 12px; margin-bottom: 12px; }
  .ld-label { display: block; margin-bottom: 6px; font-size: 12px; font-weight: 800; color: #0369a1; letter-spacing: .5px; }
  .ld-input { display: block; width: 100%; padding: 13px; font-size: 20px; font-weight: 800; font-family: inherit; color: #0f172a; background: #fff; border: 1.5px solid #bae6fd; border-radius: 12px; outline: none; margin-bottom: 12px; }
  .ld-input:focus { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14,165,233,.15); }
  .ld-price { display: flex; align-items: center; justify-content: space-between; background: #fff; border-radius: 12px; padding: 11px 14px; margin-bottom: 12px; }
  .ld-price span { font-size: 12px; font-weight: 800; color: #0369a1; letter-spacing: .8px; }
  .ld-price b { font-size: 22px; font-weight: 900; color: #0369a1; }
  .ld-save { width: 100%; padding: 15px; border: none; border-radius: 14px; background: #0284c7; color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; box-shadow: 0 6px 16px rgba(2,132,199,.3); touch-action: manipulation; }
  .ld-save:active { transform: scale(.98); }
  .ld-save:disabled { background: #94a3b8; box-shadow: none; }
  .ld-summary { display: flex; align-items: center; justify-content: space-between; gap: 10px; background: #ecfdf5; border-radius: 12px; padding: 12px 14px; margin-bottom: 12px; font-size: 13px; color: #065f46; font-weight: 700; }
  .ld-summary b { font-size: 16px; font-weight: 900; flex-shrink: 0; }
  .ld-date { font-size: 11px; color: #94a3b8; text-align: right; }
  .ld-empty { background: #fff; border-radius: 18px; padding: 40px 20px; text-align: center; color: #64748b; font-size: 15px; box-shadow: 0 4px 16px rgba(15,23,42,.06); }
`;

function OrderCard({ order, onSaved }: { order: LaundryOrder; onSaved: () => void }) {
  const isDone = order.status === "DONE";
  const weighed = !!order.weight_kg;
  const [kg, setKg] = useState(order.weight_kg ? String(order.weight_kg) : "");
  const [saving, setSaving] = useState(false);
  const kgNum = Number(kg.replace(",", ".")) || 0;

  const save = async () => {
    if (kgNum <= 0) return alert("Isi berat (kg) dulu.");
    setSaving(true);
    const res = await weighLaundryOrder(order.id, { weight_kg: kgNum });
    setSaving(false);
    if (res && res.success) {
      alert("Tersimpan: " + kgNum + " Kg");
      onSaved();
    } else {
      alert("Gagal menyimpan: " + (res?.error || "Unknown error"));
    }
  };

  const badge = isDone ? "SELESAI" : weighed ? "SUDAH DITIMBANG" : "BELUM DITIMBANG";

  return (
    <div className={"ld-card" + (isDone ? " done" : weighed ? " weighed" : "")}>
      <div className="ld-top">
        <div>
          <span className="ld-no">{order.order_no}</span>
          <h3>Room {order.room} - {order.guest_name}</h3>
        </div>
        <span className="ld-badge">{badge}</span>
      </div>
      <div className="ld-items">
        <div className="ld-items-title">RINCIAN PAKAIAN <span>{order.total_pcs} Pcs</span></div>
        {order.items_detail && typeof order.items_detail === "object" && Object.entries(order.items_detail).map(([item, qty]) => (
          <div className="ld-item" key={item}><span>{item}</span><b>{String(qty)}x</b></div>
        ))}
      </div>
      {order.notes && <div className="ld-notes"><strong>Catatan:</strong> {order.notes}</div>}
      {isDone ? (
        <div className="ld-summary">
          <span>✓ {order.weight_kg} Kg · {order.service_type}{order.payment_method ? " · " + order.payment_method : ""}</span>
          <b>{formatIDR(withFee(order.total_price || 0, order.payment_method))}</b>
        </div>
      ) : (
        <div className="ld-weigh">
          <label className="ld-label">BERAT (KG)</label>
          <input className="ld-input" inputMode="decimal" placeholder="contoh: 3.5" value={kg} onChange={(e) => setKg(e.target.value.replace(/[^0-9.,]/g, ""))} />
          <button className="ld-save" onClick={save} disabled={saving}>{saving ? "MENYIMPAN..." : weighed ? "UPDATE BERAT" : "SIMPAN BERAT"}</button>
        </div>
      )}
      <div className="ld-date">{new Date(order.created_at).toLocaleString("id-ID")}</div>
    </div>
  );
}

export default function LaundryDashboard() {
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "TIMBANG" | "DITIMBANG" | "DONE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    const res = await getLaundryOrders();
    if (res.success && res.data) setOrders(res.data as any);
    else alert("Gagal memuat data laundry: " + (res.error || "Unknown error"));
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const doneCount = orders.filter(o => o.status === "DONE").length;
  const needWeighCount = orders.filter(o => o.status !== "DONE" && !o.weight_kg).length;

  const visible = orders.filter(o => {
    const matchSearch = o.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) || o.room.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;

    if (filter === "DONE") return o.status === "DONE";
    if (filter === "TIMBANG") return o.status !== "DONE" && !o.weight_kg;
    if (filter === "DITIMBANG") return o.status !== "DONE" && !!o.weight_kg;
    return true;
  });

  return (
    <div className="ld">
      <style>{css}</style>
      <div className="ld-hero">
        <div className="ld-hero-in">
          <div><h1>Laundry Dashboard</h1><p>Pantau pesanan dan isi berat (kg). Layanan dan harga diatur kasir.</p></div>
          <button className="ld-refresh" onClick={fetchOrders} disabled={loading}>{loading ? "Memuat..." : "↻ Refresh"}</button>
        </div>
      </div>
      <div className="ld-wrap">
        <div className="ld-body">
          <div className="ld-stats">
            <div className="ld-stat"><b style={{ color: "#0369a1" }}>{orders.length}</b><small>TOTAL</small></div>
            <div className="ld-stat"><b style={{ color: "#d97706" }}>{needWeighCount}</b><small>PERLU TIMBANG</small></div>
            <div className="ld-stat"><b style={{ color: "#059669" }}>{doneCount}</b><small>SELESAI</small></div>
          </div>
          
          {/* Fitur Kotak Pencarian Staf Laundry */}
          <input 
            type="search" 
            className="ld-search" 
            placeholder="🔍 Cari nama tamu atau nomor kamar..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />

          <div className="ld-tabs">
            <button className={"ld-tab" + (filter === "ALL" ? " on" : "")} onClick={() => setFilter("ALL")}>Semua</button>
            <button className={"ld-tab" + (filter === "TIMBANG" ? " on" : "")} onClick={() => setFilter("TIMBANG")}>Perlu Timbang</button>
            <button className={"ld-tab" + (filter === "DITIMBANG" ? " on" : "")} onClick={() => setFilter("DITIMBANG")}>Sudah Ditimbang</button>
            <button className={"ld-tab" + (filter === "DONE" ? " on" : "")} onClick={() => setFilter("DONE")}>Selesai</button>
          </div>

          {loading && orders.length === 0 ? <div className="ld-empty">Memuat data pesanan...</div> : 
           orders.length === 0 ? <div className="ld-empty">Belum ada pesanan laundry yang masuk saat ini.</div> : 
           visible.length === 0 ? <div className="ld-empty">Tidak ada pesanan yang cocok dengan pencarian Anda.</div> : (
            <div className="ld-grid">
              {visible.map((order) => <OrderCard key={order.id} order={order} onSaved={fetchOrders} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}