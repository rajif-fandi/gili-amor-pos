"use client";
import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@supabase/supabase-js";
import { submitBikeRental } from "../actions";

// Menghindari error SSR pada canvas tanda tangan
const SignatureCanvas = dynamic(() => import("react-signature-canvas"), { ssr: false });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function BikeRentalForm() {
  const [formData, setFormData] = useState({
    room: "", guest_name: "", whatsapp: "", bike_type: "Standard Bicycle", duration_days: 1
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const sigCanvas = useRef<any>(null);

  const pricePerDay = formData.bike_type === "Standard Bicycle" ? 50000 : 200000;
  const estimatedPrice = pricePerDay * formData.duration_days;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const clearSignature = () => sigCanvas.current?.clear();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) return alert("Wajib melampirkan foto kondisi sepeda sebelum menyewa!");
    if (sigCanvas.current?.isEmpty()) return alert("Tanda tangan digital wajib diisi!");

    setIsSubmitting(true);
    try {
     // 1. Upload Foto Sepeda ke Supabase
      const photoName = `bike-${Date.now()}-${photo.name}`;
      await supabase.storage.from("gili-storage").upload(photoName, photo);
      const photoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gili-storage/${photoName}`;

      // 2. Upload Tanda Tangan ke Supabase
      const sigDataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
      const sigBlob = await (await fetch(sigDataUrl)).blob();
      const sigName = `sig-${Date.now()}.png`;
      await supabase.storage.from("gili-storage").upload(sigName, sigBlob);
      const sigUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gili-storage/${sigName}`;

      // 3. Simpan Data ke Database (Prisma)
      const res = await submitBikeRental({
        ...formData,
        photo_url: photoUrl,
        signature_url: sigUrl
      });

      if (res.success) setIsSuccess(true);
      else alert("Gagal mengirim data: " + res.error);
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    }
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc", padding: "20px", fontFamily: "sans-serif" }}>
        <div style={{ background: "#fff", padding: "40px", borderRadius: "16px", textAlign: "center", maxWidth: "400px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
          <div style={{ width: "60px", height: "60px", background: "#10b981", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", margin: "0 auto 20px" }}>✓</div>
          <h2 style={{ color: "#0f172a", marginBottom: "10px" }}>Order Submitted!</h2>
          <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>Thank you. Please bring your device and show this screen to the Front Desk to collect your bike key.</p>
          
          {/* TOMBOL UNTUK KEMBALI MENGISI FORM BARU */}
          <button 
            onClick={() => { setIsSuccess(false); setPhoto(null); setPhotoPreview(null); }} 
            style={{ width: "100%", padding: "12px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
            Rent Another Bike
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", background: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
        
        <div style={{ backgroundColor: "#0f172a", padding: "24px", color: "#fff", textAlign: "center" }}>
          <img src="/logo-gili.png" alt="Gili Amor" style={{ height: "50px", marginBottom: "12px", objectFit: "contain" }} />
          <h1 style={{ fontSize: "18px", margin: "0 0 4px 0", letterSpacing: "1px" }}>GILIAMOR BIKE</h1>
          <p style={{ fontSize: "12px", opacity: 0.8, margin: 0 }}>DIGITAL RENTAL & AGREEMENT FORM</p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "14px", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px", marginBottom: "16px", color: "#334155" }}>GUEST INFORMATION</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px", marginBottom: "12px" }}>
            <label style={{ display: "flex", flexDirection: "column", fontSize: "12px", fontWeight: "bold" }}>
              ROOM NUMBER
              <input required value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} placeholder="e.g. 27" style={{ marginTop: "4px", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", fontSize: "12px", fontWeight: "bold" }}>
              FULL NAME
              <input required value={formData.guest_name} onChange={e => setFormData({...formData, guest_name: e.target.value})} placeholder="Guest Name" style={{ marginTop: "4px", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
            </label>
          </div>
          
          <label style={{ display: "flex", flexDirection: "column", fontSize: "12px", fontWeight: "bold", marginBottom: "24px" }}>
            WHATSAPP NUMBER
            <input required type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="e.g. +628..." style={{ marginTop: "4px", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
          </label>

          <h3 style={{ fontSize: "14px", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px", marginBottom: "16px", color: "#334155" }}>BICYCLE SELECTION</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
            <label style={{ display: "flex", alignItems: "center", padding: "12px", border: formData.bike_type === "Standard Bicycle" ? "2px solid #3b82f6" : "1px solid #cbd5e1", borderRadius: "8px", background: formData.bike_type === "Standard Bicycle" ? "#eff6ff" : "#fff", cursor: "pointer" }}>
              <input type="radio" value="Standard Bicycle" checked={formData.bike_type === "Standard Bicycle"} onChange={e => setFormData({...formData, bike_type: e.target.value})} style={{ marginRight: "12px" }} />
              <div><strong style={{ display: "block", fontSize: "14px" }}>Standard Bicycle</strong><span style={{ fontSize: "12px", color: "#64748b" }}>IDR 50,000 / Day</span></div>
            </label>
            <label style={{ display: "flex", alignItems: "center", padding: "12px", border: formData.bike_type === "Electric Bike" ? "2px solid #3b82f6" : "1px solid #cbd5e1", borderRadius: "8px", background: formData.bike_type === "Electric Bike" ? "#eff6ff" : "#fff", cursor: "pointer" }}>
              <input type="radio" value="Electric Bike" checked={formData.bike_type === "Electric Bike"} onChange={e => setFormData({...formData, bike_type: e.target.value})} style={{ marginRight: "12px" }} />
              <div><strong style={{ display: "block", fontSize: "14px" }}>Electric Bike (E-Bike)</strong><span style={{ fontSize: "12px", color: "#64748b" }}>IDR 200,000 / Day (Dynamic)</span></div>
            </label>
          </div>

          <label style={{ display: "flex", flexDirection: "column", fontSize: "12px", fontWeight: "bold", marginBottom: "16px" }}>
            RENTAL DURATION (DAYS)
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
              <button type="button" onClick={() => setFormData({...formData, duration_days: Math.max(1, formData.duration_days - 1)})} style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid #cbd5e1", background: "#fff", fontSize: "18px", cursor: "pointer" }}>-</button>
              <span style={{ fontSize: "16px", fontWeight: "bold", width: "40px", textAlign: "center" }}>{formData.duration_days}</span>
              <button type="button" onClick={() => setFormData({...formData, duration_days: formData.duration_days + 1})} style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid #cbd5e1", background: "#fff", fontSize: "18px", cursor: "pointer" }}>+</button>
            </div>
          </label>

          <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1", marginBottom: "24px", textAlign: "center" }}>
            <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Estimated Price:</span>
            <strong style={{ fontSize: "20px", color: "#0f172a" }}>Rp {estimatedPrice.toLocaleString("id-ID")}</strong>
          </div>

          <h3 style={{ fontSize: "14px", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px", marginBottom: "16px", color: "#334155" }}>DOCUMENTATION & AGREEMENT</h3>

          <div style={{ marginBottom: "20px" }}>
            <span style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "8px" }}>PRE-RENTAL BIKE CONDITION PHOTO *</span>
            <label style={{ display: "block", padding: "20px", textAlign: "center", border: "2px dashed #cbd5e1", borderRadius: "8px", cursor: "pointer", background: "#f8fafc" }}>
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" style={{ width: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "4px" }} />
              ) : (
                <div style={{ color: "#64748b", fontSize: "13px" }}>📷 Tap to Take Photo / Upload Condition</div>
              )}
              <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} style={{ display: "none" }} />
            </label>
          </div>

          <div style={{ fontSize: "11px", color: "#475569", lineHeight: "1.5", marginBottom: "20px", padding: "12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px" }}>
            <strong>TERMS OF LOSS AGREEMENT:</strong><br />
            1. Guests are fully responsible for the bicycle during the rental period until it is returned.<br />
            2. Bike damages occurring during hiring will be advised in accordance to local bike repair site pricing.<br />
            3. If the unit is lost, the guest agrees to pay a replacement fee of <strong>IDR 2,700,000 (Standard)</strong> or <strong>IDR 10,000,000 (E-Bike)</strong> directly to the Front Office.
          </div>

          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "bold" }}>GUEST SIGNATURE *</span>
              <button type="button" onClick={clearSignature} style={{ fontSize: "11px", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: "bold" }}>Clear Signature</button>
            </div>
            <div style={{ border: "1px solid #cbd5e1", borderRadius: "8px", background: "#f8fafc", overflow: "hidden" }}>
            {/* @ts-ignore */}
            <SignatureCanvas ref={sigCanvas} penColor="black" canvasProps={{ width: 500, height: 150, style: { width: "100%", display: "block" } }} />
          </div>
            <p style={{ fontSize: "11px", color: "#64748b", marginTop: "6px" }}>I have read, understand, and certify my compliance by signature.</p>
          </div>

          <button type="submit" disabled={isSubmitting} style={{ width: "100%", padding: "16px", background: "#10b981", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 6px rgba(16, 185, 129, 0.2)" }}>
            {isSubmitting ? "Uploading Securely..." : "CONFIRM & AGREE RENTAL"}
          </button>
        </form>
      </div>
    </main>
  );
}