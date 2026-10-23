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
      <div style={{ width: "100%", minHeight: "100vh", backgroundColor: "#fff", padding: "40px 24px", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "90px", height: "90px", background: "#10b981", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "50px", margin: "0 auto 24px" }}>✓</div>
        <h2 style={{ color: "#0f172a", marginBottom: "16px", fontSize: "28px", marginTop: 0, textAlign: "center", fontWeight: "900" }}>Order Submitted!</h2>
        <p style={{ color: "#64748b", fontSize: "18px", lineHeight: "1.6", marginBottom: "40px", textAlign: "center" }}>Thank you. Our housekeeping team will pick up your laundry shortly.</p>
        <button onClick={() => { setIsSuccess(false); setClothes(CLOTHES_LIST.reduce((acc, item) => ({ ...acc, [item]: 0 }), {})); setFormData({ room: "", guest_name: "", whatsapp: "", notes: "" }); }} style={{ width: "100%", padding: "20px", background: "#0284c7", color: "#fff", border: "none", borderRadius: "14px", fontWeight: "bold", cursor: "pointer", fontSize: "18px" }}>
          Make Another Order
        </button>
      </div>
    );
  }

  return (
    <>
      {/* MENGUNCI VIEWPORT AGAR PAS DI HP DAN TIDAK ZOOM IN/OUT */}
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>

      <div style={{ width: "100%", minHeight: "100vh", backgroundColor: "#f8fafc", margin: 0, padding: "16px 16px 60px 16px", boxSizing: "border-box", fontFamily: "sans-serif" }}>
        
        {/* HEADER UTAMA */}
        <div style={{ textAlign: "center", marginBottom: "24px", paddingTop: "10px" }}>
          <h1 style={{ fontSize: "26px", margin: "0 0 4px 0", color: "#0284c7", fontWeight: "900", letterSpacing: "1px" }}>GILIAMOR</h1>
          <p style={{ fontSize: "12px", color: "#64748b", margin: 0, fontWeight: "bold", letterSpacing: "1px" }}>LAUNDRY DIGITAL FORM</p>
        </div>

        {/* INFORMASI HARGA */}
        <div style={{ backgroundColor: "#e0f2fe", borderRadius: "14px", padding: "16px", marginBottom: "24px", border: "1px solid #bae6fd", boxSizing: "border-box" }}>
          <strong style={{ display: "block", color: "#0284c7", fontSize: "14px", marginBottom: "8px", borderBottom: "1px dashed #7dd3fc", paddingBottom: "6px" }}>
            📢 SERVICE & PRICE:
          </strong>
          <div style={{ fontSize: "13px", color: "#0369a1", lineHeight: "1.5" }}>
            <div style={{ marginBottom: "6px" }}>☕ <strong>Regular :</strong> $ 1.66 (Rp 30k) / Kg (24 Hours)</div>
            <div>⚡ <strong>Express :</strong> $ 2.77 (Rp 50k) / Kg (5 Hours)</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ width: "100%", boxSizing: "border-box" }}>
          <h3 style={{ fontSize: "15px", borderBottom: "2px solid #cbd5e1", paddingBottom: "8px", marginBottom: "16px", color: "#0f172a", fontWeight: "900" }}>GUEST INFORMATION</h3>
          
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px", width: "100%" }}>
            <label style={{ display: "flex", flexDirection: "column", fontSize: "13px", fontWeight: "700", color: "#334155", width: "30%" }}>
              Room *
              <input required value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} placeholder="27" style={{ marginTop: "6px", padding: "14px 10px", border: "1px solid #cbd5e1", borderRadius: "10px", fontSize: "16px", width: "100%", boxSizing: "border-box", background: "#fff" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", fontSize: "13px", fontWeight: "700", color: "#334155", width: "70%" }}>
              Full Name *
              <input required value={formData.guest_name} onChange={e => setFormData({...formData, guest_name: e.target.value})} placeholder="Nama Tamu" style={{ marginTop: "6px", padding: "14px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", fontSize: "16px", width: "100%", boxSizing: "border-box", background: "#fff" }} />
            </label>
          </div>
          
          <label style={{ display: "flex", flexDirection: "column", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "24px", width: "100%" }}>
            WhatsApp / No HP *
            <input required type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="+62..." style={{ marginTop: "6px", padding: "14px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", fontSize: "16px", width: "100%", boxSizing: "border-box", background: "#fff" }} />
          </label>

          <h3 style={{ fontSize: "15px", borderBottom: "2px solid #cbd5e1", paddingBottom: "8px", marginBottom: "16px", color: "#0f172a", fontWeight: "900" }}>CLOTHES CHECKLIST</h3>
          
          {/* DAFTAR CHECKLIST 1 KOLOM KE BAWAH */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px", width: "100%", boxSizing: "border-box" }}>
            {CLOTHES_LIST.map((item) => (
              <div key={item} style={{ border: "1px solid #cbd5e1", borderRadius: "12px", padding: "14px 16px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", boxSizing: "border-box", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#334155", flex: 1, paddingRight: "10px" }}>{item}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                  <button type="button" onClick={() => handleQtyChange(item, -1)} style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#ef4444", color: "#fff", border: "none", fontSize: "22px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
                  <span style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", width: "24px", textAlign: "center" }}>{clothes[item]}</span>
                  <button type="button" onClick={() => handleQtyChange(item, 1)} style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#10b981", color: "#fff", border: "none", fontSize: "22px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
              </div>
            ))}
            
            {/* KOTAK TOTAL */}
            <div style={{ border: "2px dashed #f59e0b", borderRadius: "12px", padding: "20px", textAlign: "center", background: "#fef3c7", boxSizing: "border-box", marginTop: "10px" }}>
              <span style={{ fontSize: "13px", fontWeight: "800", color: "#92400e", display: "block", marginBottom: "6px", letterSpacing: "1px" }}>TOTAL PAKAIAN</span>
              <strong style={{ fontSize: "32px", color: "#dc2626", fontWeight: "900" }}>{totalItems} Pcs</strong>
            </div>
          </div>

          <h3 style={{ fontSize: "15px", borderBottom: "2px solid #cbd5e1", paddingBottom: "8px", marginBottom: "16px", color: "#0f172a", fontWeight: "900", marginTop: "30px" }}>SPECIAL REQUEST</h3>
          
          <label style={{ display: "flex", flexDirection: "column", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "30px", width: "100%" }}>
            Notes (Optional):
            <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Tulis catatan di sini..." style={{ marginTop: "6px", padding: "14px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", fontSize: "16px", width: "100%", boxSizing: "border-box", fontFamily: "inherit", background: "#fff" }} />
          </label>

          <button type="submit" disabled={isSubmitting} style={{ width: "100%", padding: "18px", background: "#0284c7", color: "#fff", border: "none", borderRadius: "14px", fontSize: "18px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 20px rgba(2, 132, 199, 0.3)", boxSizing: "border-box" }}>
            {isSubmitting ? "MENGIRIM..." : "SUBMIT ORDER"}
          </button>
        </form>
      </div>
    </>
  );
}