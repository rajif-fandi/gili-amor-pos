"use client";
import { useState, useEffect } from "react";
import { getLaundryOrders } from "../../actions";

interface LaundryOrder {
  id: string;
  order_no: string;
  room: string;
  guest_name: string;
  whatsapp: string;
  items_detail: any; // Menggunakan 'any' sementara agar aman dari error tipe data JSON Prisma
  total_pcs: number;
  notes?: string | null;
  status: string;
  created_at: string | Date;
}

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
  .ld-tabs { display: flex; gap: 8px; margin-bottom: 16px; overflow-x: auto; padding-bottom: 2px; }
  .ld-tab { flex-shrink: 0; padding: 10px 18px; border: 1.5px solid #e2e8f0; border-radius: 999px; background: #fff; color: #475569; font-size: 13px; font-weight: 700; cursor: pointer; touch-action: manipulation; }
  .ld-tab.on { background: #0284c7; border-color: #0284c7; color: #fff; }
  .ld-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: 14px; }
  .ld-card { background: #fff; border-radius: 18px; padding: 16px; box-shadow: 0 4px 16px rgba(15,23,42,.06); border-top: 5px solid #f59e0b; }
  .ld-card.done { border-top-color: #10b981; }
  .ld-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
  .ld-no { font-size: 11px; font-weight: 800; letter-spacing: .8px; color: #94a3b8; }
  .ld-top h3 { margin: 3px 0 0; font-size: 16px; font-weight: 800; line-height: 1.3; word-break: break-word; }
  .ld-badge { flex-shrink: 0; padding: 5px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; background: #fef3c7; color: #92400e; }
  .ld-card.done .ld-badge { background: #d1fae5; color: #065f46; }
  .ld-wa { display: flex; align-items: center; justify-content: space-between; gap: 10px; background: #f8fafc; border-radius: 12px; padding: 10px 12px; margin-bottom: 12px; font-size: 13px; font-weight: 600; color: #334155; }
  .ld-wa a { flex-shrink: 0; padding: 8px 14px; border-radius: 10px; background: #22c55e; color: #fff; font-size: 12px; font-weight: 800; text-decoration: none; }
  .ld-items { background: #f0f9ff; border-radius: 12px; padding: 12px; margin-bottom: 12px; }
  .ld-items-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 12px; font-weight: 800; color: #0369a1; letter-spacing: .5px; }
  .ld-items-title span { background: #0284c7; color: #fff; padding: 3px 10px; border-radius: 999px; }
  .ld-item { display: flex; justify-content: space-between; gap: 10px; padding: 6px 0; border-bottom: 1px dashed #bae6fd; font-size: 13px; color: #334155; }
  .ld-item:last-child { border-bottom: none; }
  .ld-item b { color: #0369a1; flex-shrink: 0; }
  .ld-notes { background: #fef3c7; color: #92400e; border-radius: 12px; padding: 10px 12px; margin-bottom: 12px; font-size: 13px; line-height: 1.5; }
  .ld-date { font-size: 11px; color: #94a3b8; text-align: right; }
  .ld-empty { background: #fff; border-radius: 18px; padding: 40px 20px; text-align: center; color: #64748b; font-size: 15px; box-shadow: 0 4px 16px rgba(15,23,42,.06); }
`;

const waLink = (num: string) => {
  const digits = (num || "").replace(/\D/g, "");
  const intl = digits.startsWith("0") ? "62" + digits.slice(1) : digits;
  return "https://wa.me/" + intl;
};

export default function LaundryDashboard() {
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "DONE">("ALL");

  const fetchOrders = async () => {
    setLoading(true);
    const res = await getLaundryOrders();
    if (res.success && res.data) {
      setOrders(res.data);
    } else {
      alert("Gagal memuat data laundry: " + (res.error || "Unknown error"));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const doneCount = orders.filter(o => o.status === "DONE").length;
  const pendingCount = orders.length - doneCount;

  const visible = orders.filter(o =>
    filter === "ALL" ? true : filter === "DONE" ? o.status === "DONE" : o.status !== "DONE"
  );

  return (
    <div className="ld">
      <style>{css}</style>

      <div className="ld-hero">
        <div className="ld-hero-in">
          <div>
            <h1>Laundry Dashboard</h1>
            <p>Kelola dan pantau pesanan laundry tamu secara real-time</p>
          </div>
          <button className="ld-refresh" onClick={fetchOrders} disabled={loading}>
            {loading ? "Memuat..." : "↻ Refresh"}
          </button>
        </div>
      </div>

      <div className="ld-wrap">
        <div className="ld-body">
          <div className="ld-stats">
            <div className="ld-stat"><b style={{ color: "#0369a1" }}>{orders.length}</b><small>TOTAL</small></div>
            <div className="ld-stat"><b style={{ color: "#d97706" }}>{pendingCount}</b><small>PROSES</small></div>
            <div className="ld-stat"><b style={{ color: "#059669" }}>{doneCount}</b><small>SELESAI</small></div>
          </div>

          <div className="ld-tabs">
            <button className={"ld-tab" + (filter === "ALL" ? " on" : "")} onClick={() => setFilter("ALL")}>Semua</button>
            <button className={"ld-tab" + (filter === "PENDING" ? " on" : "")} onClick={() => setFilter("PENDING")}>Proses</button>
            <button className={"ld-tab" + (filter === "DONE" ? " on" : "")} onClick={() => setFilter("DONE")}>Selesai</button>
          </div>

          {loading ? (
            <div className="ld-empty">Memuat data pesanan...</div>
          ) : orders.length === 0 ? (
            <div className="ld-empty">Belum ada pesanan laundry yang masuk saat ini.</div>
          ) : visible.length === 0 ? (
            <div className="ld-empty">Tidak ada pesanan di kategori ini.</div>
          ) : (
            <div className="ld-grid">
              {visible.map((order) => (
                <div key={order.id} className={"ld-card" + (order.status === "DONE" ? " done" : "")}>
                  <div className="ld-top">
                    <div>
                      <span className="ld-no">{order.order_no}</span>
                      <h3>Room {order.room} - {order.guest_name}</h3>
                    </div>
                    <span className="ld-badge">{order.status}</span>
                  </div>

                  <div className="ld-wa">
                    <span>📱 {order.whatsapp}</span>
                    <a href={waLink(order.whatsapp)} target="_blank" rel="noopener noreferrer">Chat</a>
                  </div>

                  <div className="ld-items">
                    <div className="ld-items-title">
                      RINCIAN PAKAIAN <span>{order.total_pcs} Pcs</span>
                    </div>
                    {order.items_detail && typeof order.items_detail === "object" && Object.entries(order.items_detail).map(([item, qty]) => (
                      <div className="ld-item" key={item}>
                        <span>{item}</span>
                        <b>{String(qty)}x</b>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="ld-notes">
                      <strong>Catatan:</strong> {order.notes}
                    </div>
                  )}

                  <div className="ld-date">{new Date(order.created_at).toLocaleString("id-ID")}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}