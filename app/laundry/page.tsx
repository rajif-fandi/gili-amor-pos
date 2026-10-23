"use client";
import { useState } from "react";
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
      <div style={{ width: "100%", minHeight: "100vh", backgroundColor: "#fff", padding: "40px 20px", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "80px", height: "80px", background: "#10b981", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", margin: "0 auto 24px" }}>✓</div>
        <h2 style={{ color: "#0f172a", marginBottom: "12px", fontSize: "24px", marginTop: 0, textAlign: "center" }}>Order Submitted!</h2>
        <p style={{ color: "#64748b", fontSize: "16px", lineHeight: "1.6", marginBottom: "40px", textAlign: "center" }}>Thank you. Our housekeeping team will pick up your laundry shortly.</p>
        <button onClick={() => { setIsSuccess(false); setClothes(CLOTHES_LIST.reduce((acc, item) => ({ ...acc, [item]: 0 }), {})); setFormData({ room: "", guest_name: "", whatsapp: "", notes: "" }); }} style={{ width: "100%", padding: "18px", background: "#0284c7", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", fontSize: "16px" }}>
          Make Another Order
        </button>
      </div>
    );
  }

  return (
    // FULL WIDTH CONTAINER
    <div style={{ width: "100%", minHeight: "100vh", backgroundColor: "#fff", margin: 0, padding: "24px 20px 40px 20px", boxSizing: "border-box", overflowX: "hidden", fontFamily: "sans-serif" }}>
      
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", margin: "0 0 6px 0", color: "#0284c7", fontWeight: "900", letterSpacing: "1px" }}>GILIAMOR</h1>
        <p style={{ fontSize: "13px", color: "#64748b", margin: 0, fontWeight: "bold", letterSpacing: "1px" }}>LAUNDRY DIGITAL FORM</p>
      </div>

      <div style={{ backgroundColor: "#e0f2fe", borderRadius: "12px", padding: "20px", marginBottom: "32px", border: "1px solid #bae6fd" }}>
        <strong style={{ display: "block", color: "#0284c7", fontSize: "14px", marginBottom: "12px", borderBottom: "1px dashed #7dd3fc", paddingBottom: "10px" }}>
          📢 SERVICE & PRICE:
        </strong>
        <div style={{ fontSize: "14px", color: "#0369a1", lineHeight: "1.6" }}>
          <div style={{ marginBottom: "12px" }}>☕ <strong>Regular :</strong> $ 1.66 (Rp 30k) / Kg <br/><span style={{ fontSize: "12px", opacity: 0.8 }}>Ready in 24 Hours</span></div>
          <div>⚡ <strong>Express :</strong> $ 2.77 (Rp 50k) / Kg <br/><span style={{ fontSize: "12px", opacity: 0.8 }}>Ready in 5 Hours</span></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ width: "100%", boxSizing: "border-box" }}>
        <h3 style={{ fontSize: "16px", borderBottom: "2px solid #f1f5f9", paddingBottom: "10px", marginBottom: "20px", color: "#0f172a", fontWeight: "900" }}>GUEST INFORMATION</h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "16px", marginBottom: "20px", width: "100%" }}>
          <label style={{ display: "flex", flexDirection: "column", fontSize: "14px", fontWeight: "600", color: "#334155" }}>
            Room *
            <input required value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} placeholder="27" style={{ marginTop: "10px", padding: "16px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", fontSize: "16px", width: "100%", boxSizing: "border-box", background: "#f8fafc" }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", fontSize: "14px", fontWeight: "600", color: "#334155" }}>
            Full Name *
            <input required value={formData.guest_name} onChange={e => setFormData({...formData, guest_name: e.target.value})} placeholder="e.g. Sasak" style={{ marginTop: "10px", padding: "16px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", fontSize: "16px", width: "100%", boxSizing: "border-box", background: "#f8fafc" }} />
          </label>
        </div>
        
        <label style={{ display: "flex", flexDirection: "column", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "36px", width: "100%" }}>
          WhatsApp / No HP *
          <input required type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="+62..." style={{ marginTop: "10px", padding: "16px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", fontSize: "16px", width: "100%", boxSizing: "border-box", background: "#f8fafc" }} />
        </label>

        <h3 style={{ fontSize: "16px", borderBottom: "2px solid #f1f5f9", paddingBottom: "10px", marginBottom: "20px", color: "#0f172a", fontWeight: "900" }}>CLOTHES CHECKLIST</h3>
        
        {/* GRID BAJU FULL WIDTH */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px", marginBottom: "24px", width: "100%", boxSizing: "border-box" }}>
          {CLOTHES_LIST.map((item) => (
            <div key={item} style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px 10px", textAlign: "center", background: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "16px", display: "block", minHeight: "36px", lineHeight: "1.4" }}>{item}</span>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 6px" }}>
                <button type="button" onClick={() => handleQtyChange(item, -1)} style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#ef4444", color: "#fff", border: "none", fontSize: "20px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
                <span style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a" }}>{clothes[item]}</span>
                <button type="button" onClick={() => handleQtyChange(item, 1)} style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#10b981", color: "#fff", border: "none", fontSize: "20px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              </div>
            </div>
          ))}
          
          <div style={{ border: "2px dashed #f59e0b", borderRadius: "12px", padding: "20px", textAlign: "center", background: "#fef3c7", display: "flex", flexDirection: "column", justifyContent: "center", boxSizing: "border-box", gridColumn: "1 / -1", marginTop: "12px" }}>
            <span style={{ fontSize: "14px", fontWeight: "800", color: "#92400e", marginBottom: "8px", letterSpacing: "1px" }}>TOTAL PAKAIAN</span>
            <strong style={{ fontSize: "32px", color: "#dc2626" }}>{totalItems} Pcs</strong>
          </div>
        </div>

        <h3 style={{ fontSize: "16px", borderBottom: "2px solid #f1f5f9", paddingBottom: "10px", marginBottom: "20px", color: "#0f172a", fontWeight: "900", marginTop: "40px" }}>SPECIAL REQUEST</h3>
        
        <label style={{ display: "flex", flexDirection: "column", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "40px", width: "100%" }}>
          Notes (Optional):
          <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Pisahkan baju putih..." style={{ marginTop: "10px", padding: "16px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", fontSize: "16px", width: "100%", boxSizing: "border-box", fontFamily: "inherit", background: "#f8fafc" }} />
        </label>

        <button type="submit" disabled={isSubmitting} style={{ width: "100%", padding: "20px", background: "#0284c7", color: "#fff", border: "none", borderRadius: "14px", fontSize: "18px", fontWeight: "900", cursor: "pointer", boxShadow: "0 8px 20px rgba(2, 132, 199, 0.3)", boxSizing: "border-box" }}>
          {isSubmitting ? "MENGIRIM..." : "SUBMIT ORDER"}
        </button>
      </form>
    </div>
  );
}