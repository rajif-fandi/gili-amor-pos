"use client";
import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@supabase/supabase-js";
import { submitBikeRental } from "../actions";

const SignatureCanvas = dynamic(() => import("react-signature-canvas"), { ssr: false });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const PROJECT_URL = "https://havaerpmltfzuupgwnzu.supabase.co";

const css = `
  html, body { width: 100% !important; min-width: 0 !important; max-width: 100vw !important; margin: 0 !important; overflow-x: hidden; }
  .bk * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; min-width: 0; }
  .bk { width: 100%; overflow-x: hidden; min-height: 100dvh; background: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; }
  .bk-wrap { max-width: 480px; margin: 0 auto; padding-bottom: calc(110px + env(safe-area-inset-bottom)); }
  .bk-hero { background: linear-gradient(135deg, #0369a1, #0ea5e9); color: #fff; padding: 24px 20px 56px; text-align: center; border-radius: 0 0 28px 28px; }
  .bk-logo { display: inline-flex; background: #fff; border-radius: 14px; padding: 8px 14px; margin-bottom: 12px; }
  .bk-logo img { height: 40px; object-fit: contain; display: block; }
  .bk-hero h1 { margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 3px; }
  .bk-hero p { margin: 6px 0 0; font-size: 12px; font-weight: 700; letter-spacing: 2px; opacity: .85; }
  .bk-body { padding: 0 16px; margin-top: -36px; }
  .bk-card { background: #fff; border-radius: 18px; padding: 18px; margin-bottom: 16px; box-shadow: 0 4px 16px rgba(15,23,42,.06); }
  .bk-title { margin: 0 0 14px; font-size: 13px; font-weight: 800; letter-spacing: 1.2px; color: #0369a1; text-transform: uppercase; }
  .bk-field { display: block; margin-bottom: 14px; font-size: 13px; font-weight: 700; color: #334155; }
  .bk-field:last-child { margin-bottom: 0; }
  .bk-input { display: block; width: 100%; margin-top: 6px; padding: 14px; font-size: 16px; font-family: inherit; color: #0f172a; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; outline: none; }
  .bk-input:focus { border-color: #0ea5e9; background: #fff; box-shadow: 0 0 0 3px rgba(14,165,233,.15); }
  .bk-row { display: grid; grid-template-columns: 96px 1fr; gap: 10px; margin-bottom: 14px; }
  .bk-row .bk-field { margin-bottom: 0; }
  .bk-opt { position: relative; display: flex; align-items: center; gap: 12px; padding: 14px; margin-bottom: 10px; border: 2px solid #e2e8f0; border-radius: 14px; background: #fff; cursor: pointer; transition: all .15s; }
  .bk-opt:last-child { margin-bottom: 0; }
  .bk-opt.on { border-color: #0ea5e9; background: #f0f9ff; }
  .bk-opt input { position: absolute; opacity: 0; pointer-events: none; }
  .bk-emoji { width: 46px; height: 46px; border-radius: 12px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
  .bk-opt.on .bk-emoji { background: #e0f2fe; }
  .bk-opt-text { flex: 1; }
  .bk-opt-text strong { display: block; font-size: 15px; color: #0f172a; }
  .bk-opt-text span { font-size: 13px; color: #64748b; }
  .bk-dot { width: 22px; height: 22px; border-radius: 50%; border: 2px solid #cbd5e1; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
  .bk-opt.on .bk-dot { border-color: #0ea5e9; }
  .bk-opt.on .bk-dot::after { content: ""; width: 10px; height: 10px; border-radius: 50%; background: #0ea5e9; }
  .bk-dur { display: flex; align-items: center; justify-content: space-between; background: #f1f5f9; border-radius: 16px; padding: 6px; }
  .bk-dur-btn { width: 52px; height: 52px; border: none; border-radius: 12px; font-size: 26px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; touch-action: manipulation; }
  .bk-dur-btn:active { transform: scale(.92); }
  .bk-dur-minus { background: #fff; color: #ef4444; }
  .bk-dur-plus { background: #0ea5e9; color: #fff; }
  .bk-dur-num { text-align: center; }
  .bk-dur-num b { display: block; font-size: 26px; font-weight: 900; line-height: 1; }
  .bk-dur-num small { font-size: 12px; color: #64748b; font-weight: 700; }
  .bk-photo { display: block; padding: 22px 12px; text-align: center; border: 2px dashed #bae6fd; border-radius: 14px; background: #f0f9ff; cursor: pointer; color: #0369a1; font-size: 14px; font-weight: 700; }
  .bk-photo img { width: 100%; max-height: 220px; object-fit: contain; border-radius: 8px; display: block; }
  .bk-photo-icon { font-size: 30px; display: block; margin-bottom: 6px; }
  .bk-terms { font-size: 12px; color: #7f1d1d; line-height: 1.6; padding: 14px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 14px; }
  .bk-terms strong.h { display: block; margin-bottom: 4px; font-size: 12px; letter-spacing: .5px; }
  .bk-sig-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 13px; font-weight: 700; color: #334155; }
  .bk-clear { border: none; background: #fee2e2; color: #dc2626; font-size: 12px; font-weight: 800; padding: 8px 14px; border-radius: 10px; cursor: pointer; }
  .bk-sig { border: 1.5px solid #cbd5e1; border-radius: 14px; background: #f8fafc; overflow: hidden; position: relative; }
  .bk-note { margin: 8px 0 0; font-size: 12px; color: #64748b; line-height: 1.5; }
  .bk-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 50; background: rgba(255,255,255,.96); backdrop-filter: blur(10px); border-top: 1px solid #e2e8f0; padding: 12px 16px calc(12px + env(safe-area-inset-bottom)); }
  .bk-bar-in { max-width: 480px; margin: 0 auto; display: flex; align-items: center; gap: 14px; }
  .bk-total small { display: block; font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 1px; }
  .bk-total b { font-size: 18px; font-weight: 900; color: #0369a1; white-space: nowrap; }
  .bk-submit { flex: 1; padding: 16px 10px; border: none; border-radius: 14px; background: #0284c7; color: #fff; font-size: 15px; font-weight: 800; letter-spacing: .5px; cursor: pointer; box-shadow: 0 6px 16px rgba(2,132,199,.3); touch-action: manipulation; }
  .bk-submit:active { transform: scale(.98); }
  .bk-submit:disabled { background: #94a3b8; box-shadow: none; }
  .bk-ok { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 24px; text-align: center; max-width: 480px; margin: 0 auto; }
  .bk-ok-icon { width: 96px; height: 96px; border-radius: 50%; background: #10b981; color: #fff; font-size: 52px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 10px 30px rgba(16,185,129,.35); }
  .bk-ok h2 { margin: 0 0 12px; font-size: 28px; font-weight: 900; }
  .bk-ok p { margin: 0 0 36px; color: #64748b; font-size: 16px; line-height: 1.6; }
  .bk-ok button { width: 100%; padding: 18px; border: none; border-radius: 14px; background: #0284c7; color: #fff; font-size: 16px; font-weight: 800; cursor: pointer; }
`;

export default function BikeRentalForm() {
  const [formData, setFormData] = useState({
    room: "", guest_name: "", whatsapp: "", bike_type: "Standard Bicycle", duration_days: 1
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const sigCanvas = useRef<any>(null);

  useEffect(() => {
    document.body.style.overflowX = "hidden";
    document.documentElement.style.overflowX = "hidden";
    return () => {
      document.body.style.overflowX = "auto";
      document.documentElement.style.overflowX = "auto";
    };
  }, []);

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
    if (!photo) return alert("Wajib melampirkan foto kondisi sepeda!");
    if (sigCanvas.current?.isEmpty()) return alert("Tanda tangan wajib diisi!");

    setIsSubmitting(true);
    try {
      const photoName = `bike-${Date.now()}.jpg`;
      await supabase.storage.from("gili-storage").upload(photoName, photo);
      const photoUrl = `${PROJECT_URL}/storage/v1/object/public/gili-storage/${photoName}`;

      const sigDataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
      const sigBlob = await (await fetch(sigDataUrl)).blob();
      const sigName = `sig-${Date.now()}.png`;
      await supabase.storage.from("gili-storage").upload(sigName, sigBlob);
      const sigUrl = `${PROJECT_URL}/storage/v1/object/public/gili-storage/${sigName}`;

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
      <div className="bk">
        <style>{css}</style>
        <div className="bk-ok">
          <div className="bk-ok-icon">✓</div>
          <h2>Order Submitted!</h2>
          <p>Thank you. Please bring your device and show this screen to the Front Desk to collect your bike key.</p>
          <button onClick={() => { setIsSuccess(false); setPhoto(null); setPhotoPreview(null); }}>
            Rent Another Bike
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bk">
      <style>{css}</style>
      <div className="bk-wrap">
        <div className="bk-hero">
          <div className="bk-logo"><img src="/logo-gili.png" alt="Gili Amor" /></div>
          <h1>GILIAMOR BIKE</h1>
          <p>DIGITAL RENTAL & AGREEMENT FORM</p>
        </div>

        <div className="bk-body">
          <form onSubmit={handleSubmit}>
            {/* DATA TAMU */}
            <div className="bk-card">
              <h3 className="bk-title">Guest Information</h3>
              <div className="bk-row">
                <label className="bk-field">
                  Room *
                  <input className="bk-input" required inputMode="numeric" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} placeholder="27" />
                </label>
                <label className="bk-field">
                  Full Name *
                  <input className="bk-input" required value={formData.guest_name} onChange={e => setFormData({...formData, guest_name: e.target.value})} placeholder="Guest Name" />
                </label>
              </div>
              <label className="bk-field">
                WhatsApp Number *
                <input className="bk-input" required type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="+62..." />
              </label>
            </div>

            {/* PILIH SEPEDA */}
            <div className="bk-card">
              <h3 className="bk-title">Bicycle Selection</h3>
              <label className={"bk-opt" + (formData.bike_type === "Standard Bicycle" ? " on" : "")}>
                <input type="radio" value="Standard Bicycle" checked={formData.bike_type === "Standard Bicycle"} onChange={e => setFormData({...formData, bike_type: e.target.value})} />
                <div className="bk-emoji">🚲</div>
                <div className="bk-opt-text"><strong>Standard Bicycle</strong><span>IDR 50,000 / Day</span></div>
                <div className="bk-dot" />
              </label>
              <label className={"bk-opt" + (formData.bike_type === "Electric Bike" ? " on" : "")}>
                <input type="radio" value="Electric Bike" checked={formData.bike_type === "Electric Bike"} onChange={e => setFormData({...formData, bike_type: e.target.value})} />
                <div className="bk-emoji">⚡</div>
                <div className="bk-opt-text"><strong>Electric Bike (E-Bike)</strong><span>IDR 200,000 / Day</span></div>
                <div className="bk-dot" />
              </label>
            </div>

            {/* DURASI */}
            <div className="bk-card">
              <h3 className="bk-title">Rental Duration</h3>
              <div className="bk-dur">
                <button type="button" className="bk-dur-btn bk-dur-minus" onClick={() => setFormData({...formData, duration_days: Math.max(1, formData.duration_days - 1)})} aria-label="Kurangi hari">−</button>
                <div className="bk-dur-num">
                  <b>{formData.duration_days}</b>
                  <small>{formData.duration_days > 1 ? "DAYS" : "DAY"}</small>
                </div>
                <button type="button" className="bk-dur-btn bk-dur-plus" onClick={() => setFormData({...formData, duration_days: formData.duration_days + 1})} aria-label="Tambah hari">+</button>
              </div>
            </div>

            {/* FOTO + PERJANJIAN */}
            <div className="bk-card">
              <h3 className="bk-title">Documentation & Agreement</h3>

              <div className="bk-field">
                Pre-rental bike condition photo *
                <label className="bk-photo" style={{ marginTop: 8 }}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" />
                  ) : (
                    <>
                      <span className="bk-photo-icon">📷</span>
                      Tap to take photo / upload condition
                    </>
                  )}
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} style={{ display: "none" }} />
                </label>
              </div>

              <div className="bk-terms" style={{ marginBottom: 16 }}>
                <strong className="h">TERMS OF LOSS AGREEMENT</strong>
                1. Guests are fully responsible for the bicycle during the rental period.<br />
                2. Bike damages will be charged based on local workshop pricing.<br />
                3. Lost unit replacement fee: <strong>IDR 2,700,000 (Standard)</strong> or <strong>IDR 10,000,000 (E-Bike)</strong>.
              </div>

              <div className="bk-sig-head">
                <span>Guest Signature *</span>
                <button type="button" className="bk-clear" onClick={clearSignature}>Clear</button>
              </div>
              <div className="bk-sig">
                {/* @ts-ignore */}
                <SignatureCanvas ref={sigCanvas} penColor="black" clearOnResize={false} canvasProps={{ style: { width: "100%", height: "160px", touchAction: "none", maxWidth: "100%" } }} />
              </div>
              <p className="bk-note">I have read, understand, and certify my compliance by signature.</p>
            </div>

            {/* BAR BAWAH: HARGA + SUBMIT */}
            <div className="bk-bar">
              <div className="bk-bar-in">
                <div className="bk-total">
                  <small>ESTIMATED PRICE</small>
                  <b>Rp {estimatedPrice.toLocaleString("id-ID")}</b>
                </div>
                <button type="submit" className="bk-submit" disabled={isSubmitting}>
                  {isSubmitting ? "UPLOADING..." : "CONFIRM & AGREE"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}