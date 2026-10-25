"use client";
import { useState, useEffect } from "react";
import { getLaundryOrders, weighLaundryOrder } from "../../actions";
import { LAUNDRY_RATES, laundryPrice } from "../../config";

interface LaundryOrder {
  id: string;
  order_no: string;
  room: string;
  guest_name: string;
  items_detail: any;
  total_pcs: number;
  notes?: string | null;
  weight_kg?: number | null;
  service_type?: string | null;
  total_price?: number | null;
  status: string;
  created_at: string | Date;
}

const formatIDR = (v: number) => `Rp ${v.toLocaleString("id-ID")}`;

const css = `
  html, body { width: 100% !important; min-width: 0 !important; max-width: 100vw !important; margin: 0 !important; overflow-x: hidden; }
  .tb * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; min-width: 0; }
  .tb { width: 100%; overflow-x: hidden; min-height: 100dvh; background: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; }
  .tb-wrap { max-width: 520px; margin: 0 auto; padding-bottom: 40px; }
  .tb-hero { background: linear-gradient(135deg, #0369a1, #0ea5e9); color: #fff; padding: 24px 20px 56px; border-radius: 0 0 28px 28px; }
  .tb-hero-in { max-width: 520px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .tb-hero h1 { margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 1px; }
  .tb-hero p { margin: 4px 0 0; font-size: 12px; opacity: .85; }
  .tb-refresh { flex-shrink: 0; padding: 12px 16px; border: none; border-radius: 12px; background: #fff; color: #0369a1; font-size: 13px; font-weight: 800; cursor: pointer; touch-action: manipulation; }
  .tb-body { padding: 0 16px; margin-top: -36px; }
  .tb-info { background: #fff; border-radius: 16px; padding: 14px 16px; margin-bottom: 14px; box-shadow: 0 4px 16px rgba(15,23,42,.06); font-size: 13px; color: #334155; line-height: 1.6; }
  .tb-info b { color: #0369a1; }
  .tb-card { background: #fff; border-radius: 18px; padding: 16px; margin-bottom: 14px; box-shadow: 0 4px 16px rgba(15,23,42,.06); border-top: 5px solid #f59e0b; }
  .tb-card.weighed { border-top-color: #10b981; }
  .tb-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
  .tb-no { font-size: 11px; font-weight: 800; letter-spacing: .8px; color: #94a3b8; }
  .tb-top h3 { margin: 3px 0 0; font-size: 17px; font-weight: 800; line-height: 1.3; word-break: break-word; }
  .tb-pcs { flex-shrink: 0; background: #e0f2fe; color: #0369a1; font-size: 12px; font-weight: 800; padding: 5px 10px; border-radius: 999px; }
  .tb-badge { display: inline-block; margin-bottom: 10px; background: #d1fae5; color: #065f46; font-size: 12px; font-weight: 800; padding: 5px 10px; border-radius: 999px; }
  .tb-items { background: #f8fafc; border-radius: 12px; padding: 10px 12px; margin-bottom: 12px; font-size: 13px; color: #475569; }
  .tb-item { display: flex; justify-content: space-between; gap: 10px; padding: 3px 0; }
  .tb-item b { color: #0369a1; flex-shrink: 0; }
  .tb-notes { background: #fef3c7; color: #92400e; border-radius: 12px; padding: 10px 12px; margin-bottom: 12px; font-size: 13px; line-height: 1.5; }
  .tb-label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 700; color: #334155; }
  .tb-input { display: block; width: 100%; padding: 14px; font-size: 20px; font-weight: 800; font-family: inherit; color: #0f172a; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; outline: none; margin-bottom: 12px; }
  .tb-input:focus { border-color: #0ea5e9; background: #fff; box-shadow: 0 0 0 3px rgba(14,165,233,.15); }
  .tb-seg { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
  .tb-seg button { padding: 12px 8px; border: 2px solid #e2e8f0; border-radius: 12px; background: #fff; color: #475569; font-size: 14px; font-weight: 800; cursor: pointer; touch-action: manipulation; }
  .tb-seg button small { display: block; margin-top: 2px; font-size: 11px; font-weight: 600; color: #94a3b8; }
  .tb-seg button.on { border-color: #0ea5e9; background: #f0f9ff; color: #0369a1; }
  .tb-price { display: flex; align-items: center; justify-content: space-between; background: #f0f9ff; border-radius: 12px; padding: 12px 14px; margin-bottom: 12px; }
  .tb-price span { font-size: 12px; font-weight: 800; color: #0369a1; letter-spacing: .8px; }
  .tb-price b { font-size: 22px; font-weight: 900; color: #0369a1; }
  .tb-save { width: 100%; padding: 16px; border: none; border-radius: 14px; background: #0284c7; color: #fff; font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 6px 16px rgba(2,132,199,.3); touch-action: manipulation; }
  .tb-save:active { transform: scale(.98); }
  .tb-save:disabled { background: #94a3b8; box-shadow: none; }
  .tb-empty { background: #fff; border-radius: 18px; padding: 40px 20px; text-align: center; color: #64748b; font-size: 15px; box-shadow: 0 4px 16px rgba(15,23,42,.06); }
`;

function WeighCard({ order, onSaved }: { order: LaundryOrder; onSaved: () => void }) {
  const [kg, setKg] = useState(order.weight_kg ? String(order.weight_kg) : "");
  const [service, setService] = useState(order.service_type === "Express" ? "Express" : "Normal");
  const [saving, setSaving] = useState(false);

  const kgNum = Number(kg.replace(",", ".")) || 0;
  const price = laundryPrice(kgNum, service);

  const save = async () => {
    if (kgNum <= 0) return alert("Isi berat (kg) dulu.");
    setSaving(true);
    const res = await weighLaundryOrder(order.id, { weight_kg: kgNum, service_type: service });
    setSaving(false);
    if (res && res.success) {
      alert("Tersimpan: " + kgNum + " Kg - " + formatIDR(price));
      onSaved();
    } else {
      alert("Gagal menyimpan: " + (res?.error || "Unknown error"));
    }
  };

  const weighed = !!order.weight_kg;

  return (
    <div className={"tb-card" + (weighed ? " weighed" : "")}>
      <div className="tb-top">
        <div>
          <span className="tb-no">{order.order_no}</span>
          <h3>Room {order.room} - {order.guest_name}</h3>
        </div>
        <span className="tb-pcs">{order.total_pcs} Pcs</span>
      </div>

      {weighed && (
        <span className="tb-badge">✓ Sudah ditimbang: {order.weight_kg} Kg · {order.service_type} · {formatIDR(order.total_price || 0)}</span>
      )}

      <div className="tb-items">
        {order.items_detail && typeof order.items_detail === "object" && Object.entries(order.items_detail).map(([item, qty]) => (
          <div className="tb-item" key={item}><span>{item}</span><b>{String(qty)}x</b></div>
        ))}
      </div>

      {order.notes && <div className="tb-notes"><strong>Catatan:</strong> {order.notes}</div>}

      <label className="tb-label">Berat (Kg)</label>
      <input className="tb-input" inputMode="decimal" placeholder="contoh: 3.5" value={kg} onChange={(e) => setKg(e.target.value.replace(/[^0-9.,]/g, ""))} />

      <label className="tb-label">Layanan</label>
      <div className="tb-seg">
        <button type="button" className={service === "Normal" ? "on" : ""} onClick={() => setService("Normal")}>
          Regular<small>{formatIDR(LAUNDRY_RATES.Normal)}/Kg · 24 Jam</small>
        </button>
        <button type="button" className={service === "Express" ? "on" : ""} onClick={() => setService("Express")}>
          Express<small>{formatIDR(LAUNDRY_RATES.Express)}/Kg · 5 Jam</small>
        </button>
      </div>

      <div className="tb-price"><span>TOTAL HARGA</span><b>{formatIDR(price)}</b></div>

      <button className="tb-save" onClick={save} disabled={saving}>
        {saving ? "MENYIMPAN..." : weighed ? "UPDATE BERAT" : "SIMPAN BERAT"}
      </button>
    </div>
  );
}

export default function LaundryWeighPage() {
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await getLaundryOrders();
    if (res.success && res.data) {
      setOrders(res.data as any);
    } else {
      alert("Gagal memuat data laundry: " + (res.error || "Unknown error"));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const pending = orders.filter((o) => o.status !== "DONE");

  return (
    <div className="tb">
      <style>{css}</style>

      <div className="tb-hero">
        <div className="tb-hero-in">
          <div>
            <h1>Laundry - Input Berat</h1>
            <p>Isi berat (kg), harga terhitung otomatis</p>
          </div>
          <button className="tb-refresh" onClick={fetchOrders} disabled={loading}>
            {loading ? "Memuat..." : "↻ Refresh"}
          </button>
        </div>
      </div>

      <div className="tb-wrap">
        <div className="tb-body">
          <div className="tb-info">
            Harga: <b>Regular {formatIDR(LAUNDRY_RATES.Normal)}/Kg</b> (24 jam) · <b>Express {formatIDR(LAUNDRY_RATES.Express)}/Kg</b> (5 jam). Setelah disimpan, pesanan siap diproses kasir.
          </div>

          {loading ? (
            <div className="tb-empty">Memuat data pesanan...</div>
          ) : pending.length === 0 ? (
            <div className="tb-empty">Tidak ada pesanan yang menunggu ditimbang.</div>
          ) : (
            pending.map((order) => <WeighCard key={order.id} order={order} onSaved={fetchOrders} />)
          )}
        </div>
      </div>
    </div>
  );
}
