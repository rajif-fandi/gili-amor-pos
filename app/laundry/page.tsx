"use client";
import { useState, useEffect } from "react";
import { submitLaundryOrder } from "../actions";

const CLOTHES_LIST = [
  "Shorts (Celana Pendek)", "Long Pants (Celana Panjang)", 
  "Underpants (Celana Dalam)", "Long Shirt (Kemeja Panjang)",
  "T-Shirt (Baju Kaos)", "Singlet (Kaos Kutang)",
  "Bra (Beha)", "Socks (Kaos Kaki)",
  "Shoes (Sepatu)", "Towel (Handuk)",
  "Blanket (Selimut)", "Sarong (Sarung)",
  "Dress (Gaun/Rok)", "Swimwear (Baju Renang)",
  "Jeans (Levis Panjang)", "Singlet Top",
  "Jacket (Jaket)", "Fabric Pants (Celana Kain)",
  "Hand Towel (Handuk Tangan)", "Short Shirt (Kemeja Pendek)",
  "Long Skirt (Rok Panjang)"
];

export default function LaundryForm() {
  const [formData, setFormData] = useState({ room: "", guest_name: "", whatsapp: "", notes: "" });
  const [clothes, setClothes] = useState<Record<string, number>>(
    CLOTHES_LIST.reduce((acc, item) => ({ ...acc, [item]: 0 }), {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // VAKSIN ANTI-ZOOM OUT & ANTI-GESER UNTUK HP
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');

    document.body.style.overflowX = "hidden";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.documentElement.style.overflowX = "hidden";
    
    return () => {
      document.body.style.overflowX = "auto";
      document.documentElement.style.overflowX = "auto";
    };
  }, []);

  const totalItems = Object.values(clothes).reduce((sum, qty) => sum + qty, 0);

  const handleQtyChange = (item: string, delta: number) => {
    setClothes(prev => {
      const newQty = Math.max(0, prev[item] + delta);
      return { ...prev, [item]: newQty };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalItems === 0) return alert("Silakan masukkan minimal 1 pakaian!");
    
    setIsSubmitting(true);
    try {
      const activeItems = Object.fromEntries(
        Object.entries(clothes).filter(([_, qty]) => qty > 0)
      );

      const res = await submitLaundryOrder({
        room: formData.room,
        guest_name: formData.guest_name,
        whatsapp: formData.whatsapp,
        items_detail: activeItems,
        total_pcs: totalItems,
        notes: formData.notes
      });

      if (res && res.success) {
        setIsSuccess(true);
      } else {
        alert("Gagal mengirim pesanan: " + (res?.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    }
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div style={{ width: "100%", position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc", padding: "20px", boxSizing: "border-box" }}>
        <div style={{ background: "#fff", padding: "40px 20px", borderRadius: "16px", textAlign: "center", width: "100%", maxWidth: "400px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", boxSizing: "border-box" }}>
          <div style={{ width: "70px", height: "70px", background: "#10b981", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "35px", margin: "0 auto 24px" }}>✓</div>
          <h2 style={{ color: "#0f172a", marginBottom: "12px", fontSize: "22px", marginTop: 0 }}>Order Submitted!</h2>
          <p style={{ color: "#64748b", fontSize: "15px", lineHeight: "1.6", marginBottom: "30px" }}>Thank you. Our housekeeping team will pick up your laundry shortly.</p>
          <button onClick={() => { setIsSuccess(false); setClothes(CLOTHES_LIST.reduce((acc, item) => ({ ...acc, [item]: 0 }), {})); setFormData({ room: "", guest_name: "", whatsapp: "", notes: "" }); }} style={{ width: "100%", padding: "16px", background: "#0284c7", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", fontSize: "16px" }}>
            Make Another Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", maxWidth: "100%", position: "relative", minHeight: "100vh", overflowX: "hidden", backgroundColor: "#f8fafc", margin: 0, padding: 0, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "500px", backgroundColor: "#fff", minHeight: "100vh", boxSizing: "border-box", boxShadow: "0 0 15px rgba(0,0,0,0.05)", padding: "24px 20px" }}>
        
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 style={{ fontSize: "26px", margin: "0 0 6px 0", color: "#0284c7", fontWeight: "900", letterSpacing: "1.5px" }}>GILIAMOR</h1>
          <p style={{ fontSize: "12px", color: "#64748b", margin: 0, fontWeight: "bold", letterSpacing: "0.5px" }}>LAUNDRY DIGITAL FORM</p>
        </div>

        <div style={{ backgroundColor: "#e0f2fe", borderRadius: "12px", padding: "16px", marginBottom: "28px", border: "1px solid #bae6fd" }}>
          <strong style={{ display: "block", color: "#0284c7", fontSize: "13px", marginBottom: "12px", borderBottom: "1px dashed #7dd3fc", paddingBottom: "8px" }}>
            📢 SERVICE & PRICE INFORMATION:
          </strong>
          <div style={{ fontSize: "13px", color: "#0369a1", lineHeight: "1.6" }}>
            <div style={{ marginBottom: "8px" }}>☕ <strong>Regular :</strong> $ 1.66 (Rp 30k) / Kg <br/><span style={{ fontSize: "11px", opacity: 0.8 }}>Ready in 24 Hours</span></div>
            <div>⚡ <strong>Express :</strong> $ 2.77 (Rp 50k) / Kg <br/><span style={{ fontSize: "11px", opacity: 0.8 }}>Ready in 5 Hours (Kilat)</span></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ width: "100%", boxSizing: "border-box" }}>
          <h3 style={{ fontSize: "14px", borderBottom: "2px solid #f1f5f9", paddingBottom: "8px", marginBottom: "20px", color: "#0f172a", fontWeight: "900" }}>GUEST INFORMATION</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "12px", marginBottom: "16px", width: "100%" }}>
            <label style={{ display: "flex", flexDirection: "column", fontSize: "13px", fontWeight: "600", color: "#334155" }}>
              Room *
              <input required value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} placeholder="27" style={{ marginTop: "8px", padding: "14px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "15px", width: "100%", boxSizing: "border-box", background: "#f8fafc" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", fontSize: "13px", fontWeight: "600", color: "#334155" }}>
              Full Name *
              <input required value={formData.guest_name} onChange={e => setFormData({...formData, guest_name: e.target.value})} placeholder="e.g. Sasak" style={{ marginTop: "8px", padding: "14px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "15px", width: "100%", boxSizing: "border-box", background: "#f8fafc" }} />
            </label>
          </div>
          
          <label style={{ display: "flex", flexDirection: "column", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "32px", width: "100%" }}>
            WhatsApp / No HP *
            <input required type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="e.g. +62812345678" style={{ marginTop: "8px", padding: "14px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "15px", width: "100%", boxSizing: "border-box", background: "#f8fafc" }} />
          </label>

          <h3 style={{ fontSize: "14px", borderBottom: "2px solid #f1f5f9", paddingBottom: "8px", marginBottom: "20px", color: "#0f172a", fontWeight: "900" }}>CLOTHES CHECKLIST</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", marginBottom: "20px", width: "100%", boxSizing: "border-box" }}>
            {CLOTHES_LIST.map((item) => (
              <div key={item} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 8px", textAlign: "center", background: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "12px", display: "block", minHeight: "30px", lineHeight: "1.3", wordBreak: "break-word" }}>{item}</span>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
                  <button type="button" onClick={() => handleQtyChange(item, -1)} style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#ef4444", color: "#fff", border: "none", fontSize: "18px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
                  <span style={{ fontSize: "16px", fontWeight: "bold", color: "#0f172a", width: "24px", textAlign: "center" }}>{clothes[item]}</span>
                  <button type="button" onClick={() => handleQtyChange(item, 1)} style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#10b981", color: "#fff", border: "none", fontSize: "18px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
              </div>
            ))}
            
            <div style={{ border: "2px dashed #f59e0b", borderRadius: "10px", padding: "12px", textAlign: "center", background: "#fef3c7", display: "flex", flexDirection: "column", justifyContent: "center", boxSizing: "border-box", gridColumn: "1 / -1", marginTop: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "800", color: "#92400e", marginBottom: "6px", letterSpacing: "0.5px" }}>TOTAL PAKAIAN</span>
              <strong style={{ fontSize: "24px", color: "#dc2626" }}>{totalItems} Pcs</strong>
            </div>
          </div>

          <h3 style={{ fontSize: "14px", borderBottom: "2px solid #f1f5f9", paddingBottom: "8px", marginBottom: "20px", color: "#0f172a", fontWeight: "900", marginTop: "32px" }}>SPECIAL REQUEST</h3>
          
          <label style={{ display: "flex", flexDirection: "column", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "32px", width: "100%" }}>
            Notes / Catatan Khusus (Optional):
            <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="e.g. Tolong pisahkan baju putih..." style={{ marginTop: "8px", padding: "14px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", width: "100%", boxSizing: "border-box", fontFamily: "inherit", background: "#f8fafc" }} />
          </label>

          <button type="submit" disabled={isSubmitting} style={{ width: "100%", padding: "18px", background: "#0284c7", color: "#fff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 15px rgba(2, 132, 199, 0.3)", boxSizing: "border-box", marginBottom: "20px" }}>
            {isSubmitting ? "MENGIRIM PESANAN..." : "SUBMIT LAUNDRY ORDER"}
          </button>
        </form>
      </div>
    </div>
  );
}