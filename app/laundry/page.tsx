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

const css = `
  .lf * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  .lf { min-height: 100dvh; background: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; }
  .lf-wrap { max-width: 480px; margin: 0 auto; padding-bottom: calc(110px + env(safe-area-inset-bottom)); }
  .lf-hero { background: linear-gradient(135deg, #0369a1, #0ea5e9); color: #fff; padding: 28px 20px 56px; text-align: center; border-radius: 0 0 28px 28px; }
  .lf-hero h1 { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 3px; }
  .lf-hero p { margin: 6px 0 0; font-size: 12px; font-weight: 700; letter-spacing: 2px; opacity: .85; }
  .lf-body { padding: 0 16px; margin-top: -36px; }
  .lf-card { background: #fff; border-radius: 18px; padding: 18px; margin-bottom: 16px; box-shadow: 0 4px 16px rgba(15,23,42,.06); }
  .lf-title { margin: 0 0 14px; font-size: 13px; font-weight: 800; letter-spacing: 1.2px; color: #0369a1; text-transform: uppercase; }
  .lf-price { display: flex; gap: 10px; }
  .lf-price div { flex: 1; border-radius: 14px; padding: 12px; }
  .lf-price small { display: block; font-size: 11px; font-weight: 700; opacity: .8; }
  .lf-price b { display: block; font-size: 15px; margin: 2px 0; }
  .lf-price span { font-size: 12px; }
  .lf-field { display: block; margin-bottom: 14px; font-size: 13px; font-weight: 700; color: #334155; }
  .lf-field:last-child { margin-bottom: 0; }
  .lf-input { display: block; width: 100%; margin-top: 6px; padding: 14px; font-size: 16px; font-family: inherit; color: #0f172a; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; outline: none; }
  .lf-input:focus { border-color: #0ea5e9; background: #fff; box-shadow: 0 0 0 3px rgba(14,165,233,.15); }
  .lf-row { display: flex; gap: 10px; }
  .lf-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; transition: background .15s; }
  .lf-item:last-child { border-bottom: none; }
  .lf-item.on { background: #f0f9ff; margin: 0 -18px; padding: 10px 18px; }
  .lf-name { flex: 1; font-size: 14px; font-weight: 600; line-height: 1.3; color: #334155; }
  .lf-item.on .lf-name { color: #0369a1; font-weight: 800; }
  .lf-stepper { display: flex; align-items: center; background: #f1f5f9; border-radius: 14px; padding: 4px; flex-shrink: 0; }
  .lf-item.on .lf-stepper { background: #fff; box-shadow: inset 0 0 0 1.5px #bae6fd; }
  .lf-btn { width: 40px; height: 40px; border: none; border-radius: 11px; font-size: 22px; font-weight: 700; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; touch-action: manipulation; }
  .lf-btn:active { transform: scale(.92); }
  .lf-minus { background: #fff; color: #ef4444; }
  .lf-item.on .lf-minus { background: #fee2e2; }
  .lf-plus { background: #0ea5e9; color: #fff; }
  .lf-qty { min-width: 32px; text-align: center; font-size: 17px; font-weight: 900; color: #94a3b8; }
  .lf-item.on .lf-qty { color: #0f172a; }
  .lf-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 50; background: rgba(255,255,255,.96); backdrop-filter: blur(10px); border-top: 1px solid #e2e8f0; padding: 12px 16px calc(12px + env(safe-area-inset-bottom)); }
  .lf-bar-in { max-width: 480px; margin: 0 auto; display: flex; align-items: center; gap: 14px; }
  .lf-total small { display: block; font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 1px; }
  .lf-total b { font-size: 24px; font-weight: 900; color: #0369a1; }
  .lf-submit { flex: 1; padding: 16px; border: none; border-radius: 14px; background: #0284c7; color: #fff; font-size: 16px; font-weight: 800; letter-spacing: .5px; cursor: pointer; box-shadow: 0 6px 16px rgba(2,132,199,.3); touch-action: manipulation; }
  .lf-submit:active { transform: scale(.98); }
  .lf-submit:disabled { background: #94a3b8; box-shadow: none; }
  .lf-ok { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 24px; text-align: center; max-width: 480px; margin: 0 auto; }
  .lf-ok-icon { width: 96px; height: 96px; border-radius: 50%; background: #10b981; color: #fff; font-size: 52px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 10px 30px rgba(16,185,129,.35); }
  .lf-ok h2 { margin: 0 0 12px; font-size: 28px; font-weight: 900; }
  .lf-ok p { margin: 0 0 36px; color: #64748b; font-size: 16px; line-height: 1.6; }
  .lf-ok button { width: 100%; padding: 18px; border: none; border-radius: 14px; background: #0284c7; color: #fff; font-size: 16px; font-weight: 800; cursor: pointer; }
`;

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
      <div className="lf">
        <style>{css}</style>
        <div className="lf-ok">
          <div className="lf-ok-icon">✓</div>
          <h2>Order Submitted!</h2>
          <p>Thank you. Our housekeeping team will pick up your laundry shortly.</p>
          <button onClick={() => { setIsSuccess(false); setClothes(CLOTHES_LIST.reduce((acc, item) => ({ ...acc, [item]: 0 }), {})); setFormData({ room: "", guest_name: "", whatsapp: "", notes: "" }); }}>
            Make Another Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lf">
      <style>{css}</style>
      <div className="lf-wrap">
        <div className="lf-hero">
          <h1>GILIAMOR</h1>
          <p>LAUNDRY DIGITAL FORM</p>
        </div>

        <div className="lf-body">
          {/* HARGA */}
          <div className="lf-card">
            <h3 className="lf-title">Service & Price</h3>
            <div className="lf-price">
              <div style={{ background: "#e0f2fe", color: "#0369a1" }}>
                <small>☕ REGULAR</small>
                <b>$ 1.66 / Kg</b>
                <span>Rp 30k · 24 Hours</span>
              </div>
              <div style={{ background: "#fef3c7", color: "#92400e" }}>
                <small>⚡ EXPRESS</small>
                <b>$ 2.77 / Kg</b>
                <span>Rp 50k · 5 Hours</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* DATA TAMU */}
            <div className="lf-card">
              <h3 className="lf-title">Guest Information</h3>
              <div className="lf-row">
                <label className="lf-field" style={{ width: "32%" }}>
                  Room *
                  <input className="lf-input" required inputMode="numeric" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} placeholder="27" />
                </label>
                <label className="lf-field" style={{ width: "68%" }}>
                  Full Name *
                  <input className="lf-input" required value={formData.guest_name} onChange={e => setFormData({...formData, guest_name: e.target.value})} placeholder="Nama Tamu" />
                </label>
              </div>
              <label className="lf-field">
                WhatsApp / No HP *
                <input className="lf-input" required type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="+62..." />
              </label>
            </div>

            {/* CHECKLIST */}
            <div className="lf-card">
              <h3 className="lf-title">Clothes Checklist</h3>
              {CLOTHES_LIST.map((item) => (
                <div key={item} className={"lf-item" + (clothes[item] > 0 ? " on" : "")}>
                  <span className="lf-name">{item}</span>
                  <div className="lf-stepper">
                    <button type="button" className="lf-btn lf-minus" onClick={() => handleQtyChange(item, -1)} aria-label={"Kurangi " + item}>−</button>
                    <span className="lf-qty">{clothes[item]}</span>
                    <button type="button" className="lf-btn lf-plus" onClick={() => handleQtyChange(item, 1)} aria-label={"Tambah " + item}>+</button>
                  </div>
                </div>
              ))}
            </div>

            {/* NOTES */}
            <div className="lf-card">
              <h3 className="lf-title">Special Request</h3>
              <label className="lf-field">
                Notes (Optional)
                <textarea className="lf-input" rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Tulis catatan di sini..." />
              </label>
            </div>

            {/* BAR BAWAH: TOTAL + SUBMIT (selalu terlihat) */}
            <div className="lf-bar">
              <div className="lf-bar-in">
                <div className="lf-total">
                  <small>TOTAL</small>
                  <b>{totalItems} Pcs</b>
                </div>
                <button type="submit" className="lf-submit" disabled={isSubmitting}>
                  {isSubmitting ? "MENGIRIM..." : "SUBMIT ORDER"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}