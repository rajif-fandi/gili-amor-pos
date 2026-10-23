"use client";
import { useState, useEffect } from "react";
import { getLaundryOrders } from "../../actions";

interface LaundryOrder {
  id: string;
  order_no: string;
  room: string;
  guest_name: string;
  whatsapp: string;
  items_detail: Record<string, number>;
  total_pcs: number;
  notes?: string;
  status: string;
  created_at: string;
}

export default function LaundryDashboard() {
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await getLaundryOrders();
    if (res.success && res.data) {
      setOrders(res.data);
    } else {
      alert("Gagal memuat data laundry: " + res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: "20px", fontFamily: "sans-serif", boxSizing: "border-box" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div>
            <h1 style={{ fontSize: "22px", color: "#0f172a", margin: "0 0 4px 0" }}>Laundry Dashboard</h1>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Kelola dan pantau pesanan laundry tamu secara real-time</p>
          </div>
          <button onClick={fetchOrders} style={{ padding: "10px 16px", background: "#0284c7", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
            Refresh Data
          </button>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b", fontSize: "15px" }}>Memuat data pesanan...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", background: "#fff", borderRadius: "12px", color: "#64748b", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            Belum ada pesanan laundry yang masuk saat ini.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
            {orders.map((order) => (
              <div key={order.id} style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderLeft: order.status === "DONE" ? "5px solid #10b981" : "5px solid #f59e0b", boxSizing: "border-box" }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: "bold", color: "#64748b" }}>{order.order_no}</span>
                    <h3 style={{ fontSize: "16px", color: "#0f172a", margin: "2px 0 0 0" }}>Room {order.room} - {order.guest_name}</h3>
                  </div>
                  <span style={{ padding: "4px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold", background: order.status === "DONE" ? "#d1fae5" : "#fef3c7", color: order.status === "DONE" ? "#065f46" : "#92400e" }}>
                    {order.status}
                  </span>
                </div>

                <div style={{ fontSize: "13px", color: "#334155", marginBottom: "12px" }}>
                  <strong>WhatsApp:</strong> {order.whatsapp}
                </div>

                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", marginBottom: "12px", fontSize: "12px" }}>
                  <strong style={{ display: "block", marginBottom: "6px", color: "#475569" }}>Rincian Pakaian ({order.total_pcs} Pcs):</strong>
                  <ul style={{ margin: 0, paddingLeft: "16px", color: "#334155" }}>
                    {order.items_detail && Object.entries(order.items_detail).map(([item, qty]) => (
                      <li key={item}>{item}: <strong>{qty as number}x</strong></li>
                    ))}
                  </ul>
                </div>

                {order.notes && (
                  <div style={{ fontSize: "12px", color: "#b45309", background: "#fef3c7", padding: "8px", borderRadius: "6px", marginBottom: "12px" }}>
                    <strong>Catatan:</strong> {order.notes}
                  </div>
                )}

                <div style={{ fontSize: "11px", color: "#94a3b8", textAlign: "right" }}>
                  {new Date(order.created_at).toLocaleString("id-ID")}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}