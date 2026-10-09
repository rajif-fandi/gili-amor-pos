"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyStaffLogin } from "../actions";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

 const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;

    setIsLoading(true);
    const result = await verifyStaffLogin(pin);

    if (result.success && result.data) {
      const staff: any = result.data;
      // SIMPAN SESI STAF KE BROWSER LOCALSTORAGE
      localStorage.setItem("gili_amor_staff", JSON.stringify({
        id: staff.staff_id,
        nama: staff.nama,
        posisi: staff.posisi,
        shift: staff.shift
      }));

      alert(`Selamat datang, ${staff.nama}!`);
      router.push("/");
    } else {
      alert(result.error || "PIN salah atau staf tidak ditemukan.");
    }
    setIsLoading(false);
  };

  return (
    <main style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', width: '380px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          
          {/* LOGO GILI AMOR BARU */}
          <img 
            src="/logo-gili.png" 
            alt="Logo Gili Amor" 
            style={{ width: 'auto', height: '72px', margin: '0 auto 12px auto', display: 'block', objectFit: 'contain' }} 
          />
          
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>GILI AMOR</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Boutique Resort · Staff Portal</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Masukkan PIN Staf
            </label>
            <input 
              type="password" 
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', textAlign: 'center', letterSpacing: '4px' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{ width: '100%', padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '15px', cursor: 'pointer' }}
          >
            {isLoading ? "Memeriksa..." : "Masuk ke Sistem"}
          </button>
        </form>
      </div>
    </main>
  );
}