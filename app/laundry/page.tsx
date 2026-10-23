"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://havaerpmltfzuupgwnzu.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

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
    document.body.style.overflowX = "hidden";
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

      const orderNo = `LND-${Date.now().toString().slice(-6)}`;

      // Menyimpan langsung ke tabel Supabase LaundryOrder
      const { error } = await supabase.from("LaundryOrder").insert([
        {
          order_no: orderNo,
          room: formData.room,
          guest_name: formData.guest_name,
          whatsapp: formData.whatsapp,
          items_detail: activeItems,
          total_pcs: totalItems,
          notes: formData.notes || "",
          status: "PENDING"
        }
      ]);

      if (error) {
        throw new Error(error.message);
      }

      setIsSuccess(true);
    } catch (err: any) {
      alert("Gagal mengirim pesanan: " + err.message);
    }
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div style={{ width: "100%", maxWidth: "100%", position: "relative", height: "100vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc", padding: "16px", boxSizing: "border-box", margin: 0 }}>
        <div style={{ background: "#fff", padding: "30px 20px", borderRadius: "16px", textAlign: "center", width: "100%", maxWidth: "400px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", boxSizing: "border-box" }}>
          <div style={{ width: "60px", height: "60px", background: "#10b981", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", margin: "0 auto 20px" }}>✓</div>
          <h2 style={{ color: "#0f172a", marginBottom: "10px", fontSize: "20px", marginTop: 0 }}>Order Submitted!</h2>
          <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>Thank you. Our housekeeping team will pick up your laundry shortly.</p>
          <button onClick={() => { setIsSuccess(false); setClothes(CLOTHES_LIST.reduce((acc, item) => ({ ...acc, [item]: 0 }), {})); setFormData({ room: "", guest_name: "", whatsapp: "", notes: "" }); }} style={{ width: "100%", padding: "14px", background: "#0284c7", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "15px" }}>
            Make Another Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: "100%", position: "relative", minHeight: "100vh", overflowX: "hidden", backgroundColor: "#f8fafc", margin: 0, padding: 0, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "500px", backgroundColor: "#fff", minHeight: "100vh", boxSizing: "border-box", boxShadow: "0 0 15px rgba(0,0,0,0.05)", overflowX: "hidden", padding: "20px" }}>
        
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "24px", margin: "0 0 4px 0", color: "#0284c7", fontWeight: "900", letterSpacing: "1px" }}>GILIAMOR</h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0, fontWeight: "bold" }}>LAUNDRY DIGITAL FORM</p>
        </div>

        <div style={{ backgroundColor: "#e0f2fe", borderRadius: "8px", padding: "16px", marginBottom: "24px", border: "1px solid #bae6fd" }}>
          <strong style={{ display: "block", color: "#0284c7", fontSize: "14px", marginBottom: "12px", borderBottom: "1px dashed #7dd3fc", paddingBottom: "8px" }}>
            📢 SERVICE & PRICE INFORMATION:
          </strong>
          <div style={{ fontSize: "13px", color: "#0369a1", lineHeight: "1.6" }}>
            <div style={{ marginBottom: "8px" }}>☕ <strong>Regular :</strong> $ 1.66 (Rp 30k) / Kg - Ready in 24 Hours</div>
            <div>⚡ <strong>Express :</strong> $ 2.77 (Rp 50k) / Kg - Ready in 5 Hours (Kilat)</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ width: "100%", boxSizing: "border-box" }}>
          <h3 style={{ fontSize: "15px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginBottom: "16px", color: "#1e293b" }}>GUEST INFORMATION</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px", marginBottom: "12px", width: "100%" }}>
            <label style={{ display: "flex", flexDirection: "column", fontSize: "13px", fontWeight: "600", color: "#334155" }}>
              Room *
              <input required value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} placeholder="e.g. 27" style={{ marginTop: "6px", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "15px", width: "100%", boxSizing: "border-box" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", fontSize: "13px", fontWeight: "600", color: "#334155" }}>
              Full Name *
              <input required value={formData.guest_name} onChange={e => setFormData({...formData, guest_name: e.target.value})} placeholder="e.g. Sasak" style={{ marginTop: "6px", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "15px", width: "100%", boxSizing: "border-box" }} />
            </label>
          </div>
          
          <label style={{ display: "flex", flexDirection: "column", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "24px", width: "100%" }}>
            WhatsApp / No HP *
            <input required type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="e.g. +62812345678" style={{ marginTop: "6px", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "15px", width: "100%", boxSizing: "border-box" }} />
          </label>

          <h3 style={{ fontSize: "15px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginBottom: "16px", color: "#1e293b" }}>CLOTHES CHECKLIST</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px", width: "100%", boxSizing: "border-box" }}>
            {CLOTHES_LIST.map((item) => (
              <div key={item} style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px", textAlign: "center", background: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "12px", display: "block", minHeight: "34px" }}>{item}</span>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <button type="button" onClick={() => handleQtyChange(item, -1)} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#ef4444", color: "#fff", border: "none", fontSize: "20px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
                  <span style={{ fontSize: "18px", fontWeight: "bold", color: "#0f172a", width: "30px", textAlign: "center" }}>{clothes[item]}</span>
                  <button type="button" onClick={() => handleQtyChange(item, 1)} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#10b981", color: "#fff", border: "none", fontSize: "20px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
              </div>
            ))}
            
            <div style={{ border: "2px dashed #f59e0b", borderRadius: "8px", padding: "12px", textAlign: "center", background: "#fef3c7", display: "flex", flexDirection: "column", justifyContent: "center", boxSizing: "border-box" }}>
              <span style={{ fontSize: "12px", fontWeight: "bold", color: "#92400e", marginBottom: "4px" }}>TOTAL ITEMS /<br/>TOTAL PAKAIAN</span>
              <strong style={{ fontSize: "22px", color: "#dc2626" }}>{totalItems} Pcs</strong>
            </div>
          </div>

          <h3 style={{ fontSize: "15px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginBottom: "16px", color: "#1e293b", marginTop: "24px" }}>SPECIAL REQUEST</h3>
          
          <label style={{ display: "flex", flexDirection: "column", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "24px", width: "100%" }}>
            Notes / Catatan Khusus (Optional):
            <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="e.g. No perfume..." style={{ marginTop: "6px", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", width: "100%", boxSizing: "border-box", fontFamily: "inherit", maxWidth: "100%" }} />
          </label>

          <button type="submit" disabled={isSubmitting} style={{ width: "100%", padding: "16px", background: "#0284c7", color: "#fff", border: "none", borderRadius: "30px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 6px rgba(2, 132, 199, 0.2)", boxSizing: "border-box", marginBottom: "20px" }}>
            {isSubmitting ? "Submitting Order..." : "SUBMIT LAUNDRY ORDER"}
          </button>
        </form>
      </div>
    </div>
  );
}