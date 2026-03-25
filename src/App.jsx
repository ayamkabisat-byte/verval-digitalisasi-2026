import React, { useState, useEffect } from 'react';
import { FileText, Printer, Save, AlertCircle, Moon, Sun, Send, Search, Loader2, CloudDownload, Link } from 'lucide-react';

const adminQuestions = [
  "Satuan pendidikan memiliki Nomor Pokok Sekolah Nasional (NPSN) yang aktif dan sinkron.",
  "Merupakan penerima Dana Bantuan Operasional Satuan Pendidikan (BOSP) pada tahun anggaran berjalan.",
  "Satuan pendidikan aktif melakukan pemutakhiran Data Pokok Pendidikan (Dapodik) secara berkala minimal dalam 2 tahun terakhir.",
  "Memiliki ketersediaan Pendidik/Tenaga Kependidikan yang melek IT untuk dilatih mengelola perangkat digitalisasi.",
  "Diketahui secara jelas pihak pengusul sasaran bantuan ini (Tuliskan di keterangan: Dinas / Kepala Sekolah / Yayasan / Aspirasi Dewan)."
];

const lahanQuestions = [
  "Status kepemilikan hak atas tanah adalah sah (Sertifikat/Izin Pemanfaatan/Pelepasan Hak Adat) dan dipastikan TIDAK dalam status sengketa.",
  "Kondisi bangunan eksisting diusulkan memiliki tingkat kerusakan minimal 'Sedang' atau tersedianya lahan kosong siap bangun untuk usulan RKB (Ruang Kelas Baru).",
  "Satuan pendidikan memiliki Master Plan atau Site Plan pengembangan sekolah sebagai acuan penambahan tata ruang.",
  "Bangunan atau lahan yang akan direvitalisasi dipastikan bukan merupakan status Kawasan Cagar Budaya yang dilarang dibongkar total.",
  "Aksesibilitas distribusi logistik: Lebar jalan masuk (Kelas Jalan) memadai untuk dilalui kendaraan angkut material/truk pengiriman barang elektronik."
];

// URL Script Google
const scriptURL = 'https://script.google.com/macros/s/AKfycbxoC2TjU71W1ya6xL7b47zx8zUqg8ipy9nuXjwDaTJzSTmSX1IAf0g6PgDbl9hzsKU9KQ/exec';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingServer, setIsFetchingServer] = useState(false);
  
  const initialData = {
    profil: {
      namaSekolah: '', jenjang: '', npsn: '', provinsi: '', kabupaten: '', alamat: '', namaKepsek: '', hpKepsek: '', namaVerifikator: '', tanggal: ''
    },
    administrasi: adminQuestions.map(q => ({ status: '', keterangan: '' })),
    lahan: lahanQuestions.map(q => ({ status: '', keterangan: '' })),
    digitalisasi: {
      rombelDapodik: '', rombelFakta: '',
      ruangDapodik: '', ruangFakta: '',
      analisisIfp: '', rekomendasiIfp: '',
      listrikDaya: '', listrikAsumsi: '', listrikKesimpulan: '',
      internetStatus: '', internetProvider: '',
      ruangKondisiOpsi: '', ruangKondisi: '', ruangKesimpulan: ''
    },
    kesimpulan: {
      catatanAdmin: '', catatanListrik: '', catatanKeamanan: '', catatanPemanfaatan: '', statusKelayakan: '', catatanKelayakan: '', linkDrive: ''
    }
  };

  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = '/favicon.png';
  }, [isDarkMode]);

  const handleProfilChange = (e) => {
    let value = e.target.value;
    // Validasi NPSN: Hanya angka dan maksimal 8 digit saat diketik
    if (e.target.name === 'npsn') {
      value = value.replace(/[^0-9]/g, '').slice(0, 8);
    }
    setFormData({ ...formData, profil: { ...formData.profil, [e.target.name]: value } });
  };

  const handleArrayChange = (category, index, field, value) => {
    const newData = [...formData[category]];
    newData[index][field] = value;
    setFormData({ ...formData, [category]: newData });
  };

  const handleDigiChange = (e) => {
    setFormData({ ...formData, digitalisasi: { ...formData.digitalisasi, [e.target.name]: e.target.value } });
  };

  const handleRuangKondisiOpsi = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      digitalisasi: {
        ...prev.digitalisasi,
        ruangKondisiOpsi: value,
        // Jika pilih selain "Lainnya", langsung jadikan sebagai nilai ruangKondisi
        ruangKondisi: value !== 'Lainnya' ? value : '' 
      }
    }));
  };

  const handleKesimpulanChange = (e) => {
    setFormData({ ...formData, kesimpulan: { ...formData.kesimpulan, [e.target.name]: e.target.value } });
  };

  const handleSaveDraft = () => {
    const npsn = formData.profil.npsn.trim();
    if (!npsn) { alert("NPSN wajib diisi untuk menyimpan draft!"); return; }
    localStorage.setItem(`draft_${npsn}`, JSON.stringify(formData));
    alert(`Draft berhasil disimpan secara offline untuk NPSN: ${npsn}`);
  };

  const handleLoadDraft = () => {
    const npsn = formData.profil.npsn.trim();
    if (!npsn) { alert("Silakan isi NPSN terlebih dahulu untuk mencari draft."); return; }
    const savedData = localStorage.getItem(`draft_${npsn}`);
    if (savedData) {
      setFormData(JSON.parse(savedData));
      alert(`Data draft lokal untuk NPSN ${npsn} berhasil dimuat.`);
    } else {
      alert(`Tidak ada draft offline tersimpan untuk NPSN ${npsn}.`);
    }
  };

  const handleFetchServer = async () => {
    const npsn = formData.profil.npsn.trim();
    if (!npsn) { alert("Silakan isi NPSN terlebih dahulu untuk menarik data dari server."); return; }
    
    setIsFetchingServer(true);
    try {
      const response = await fetch(`${scriptURL}?npsn=${npsn}`);
      const data = await response.json();
      
      if (data.status === 'not_found') {
        alert(`Data dengan NPSN ${npsn} belum pernah dikirim/tidak ditemukan di Server.`);
      } else if (data.profil) {
        setFormData(data); 
        alert(`Berhasil menarik data NPSN ${npsn} dari Google Sheets!`);
      }
    } catch (error) {
      console.error(error);
      alert("Gagal menarik data. Pastikan Google Apps Script Anda sudah diperbarui dengan kode 'doGet' dan telah dideploy ulang.");
    } finally {
      setIsFetchingServer(false);
    }
  };

  const validateForm = () => {
    // Validasi ketat NPSN
    if (formData.profil.npsn.length !== 8) {
      alert("PENGIRIMAN GAGAL: NPSN harus terdiri dari tepat 8 digit angka.");
      return false;
    }
    for (let key in formData.profil) { if (formData.profil[key].trim() === '') return false; }
    if (formData.administrasi.some(item => item.status === '')) return false;
    if (formData.lahan.some(item => item.status === '')) return false;
    for (let key in formData.digitalisasi) { 
      // Skip validasi ruangKondisiOpsi jika ruangKondisi sudah terisi
      if (key !== 'ruangKondisiOpsi' && formData.digitalisasi[key].trim() === '') return false; 
    }
    for (let key in formData.kesimpulan) { if (formData.kesimpulan[key].trim() === '') return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert("PENGIRIMAN GAGAL: Mohon lengkapi seluruh isian form secara benar (termasuk pilihan Ya/Tidak) sebelum mengirim data.");
      return;
    }
    setIsLoading(true);
    try {
      await fetch(scriptURL, { 
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(formData) 
      });
      alert("Permintaan terkirim ke server!\nSilakan cek Google Sheet Anda.");
      const npsn = formData.profil.npsn.trim();
      if(npsn) localStorage.removeItem(`draft_${npsn}`);
    } catch (error) {
      alert("Gagal mengirim data! Pastikan koneksi internet Anda stabil.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      alert("Gunakan CTRL + P (Windows) atau CMD + P (Mac) untuk mencetak dokumen ini.");
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'} p-4 md:p-8 font-sans`}>
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden print:shadow-none print:w-full transition-colors duration-300 relative border-t-8 border-[#f9a703]">
        
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 p-6 text-center print:bg-white print:text-black border-b border-gray-200 dark:border-gray-700 print:border-b-2 print:border-black relative">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition print:hidden text-[#067ac1] dark:text-[#f9a703]" title="Toggle Dark Mode">
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          
          <div className="flex justify-center mb-6">
             <img src={isDarkMode ? "/Header Itjen Kemendikdasmen Dark.png" : "/Header Itjen Kemendikdasmen.png"} alt="Header Kemendikdasmen" className="h-16 md:h-20 object-contain print:hidden" />
             <img src="/Header Itjen Kemendikdasmen.png" alt="Header Kemendikdasmen" className="h-16 md:h-20 object-contain hidden print:block" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-1 uppercase text-[#067ac1] dark:text-[#f9a703] print:text-black">Instrumen Verifikasi Kesiapan</h1>
          <h2 className="text-lg md:text-xl font-semibold text-gray-600 dark:text-gray-400 print:text-gray-800">Satuan Pendidikan Calon Penerima Bantuan Revitalisasi & Digitalisasi Tahun 2026</h2>
        </div>

        <div className="p-6 md:p-10 space-y-10">
          
          {/* BAGIAN I: PROFIL */}
          <section>
            <h3 className="text-xl font-bold border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-4 flex items-center text-gray-800 dark:text-gray-100">
              <span className="bg-[#067ac1]/10 text-[#067ac1] dark:bg-[#f9a703]/20 dark:text-[#f9a703] px-3 py-1 rounded mr-3 text-sm">Bagian I</span>
              Profil dan Data Umum
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">NPSN <span className="text-red-500">*</span> <span className="text-xs text-gray-400 font-normal">(Harus 8 digit angka)</span></label>
                <div className="flex gap-2">
                  <input type="text" name="npsn" value={formData.profil.npsn} onChange={handleProfilChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1]" placeholder="Ketik 8 digit NPSN..." />
                  <div className="flex flex-col gap-1 print:hidden">
                    <button onClick={handleLoadDraft} className="flex justify-center items-center px-2 py-1 bg-[#067ac1]/10 text-[#067ac1] dark:bg-[#067ac1]/20 dark:text-[#6cb4e4] rounded hover:bg-[#067ac1]/20 transition text-xs font-semibold" title="Cari di penyimpanan offline perangkat ini">
                      <Search size={14} className="mr-1" /> Draft Lokal
                    </button>
                    <button onClick={handleFetchServer} disabled={isFetchingServer} className="flex justify-center items-center px-2 py-1 bg-[#f9a703]/10 text-[#d08c02] dark:bg-[#f9a703]/20 dark:text-[#f9a703] rounded hover:bg-[#f9a703]/20 transition text-xs font-semibold disabled:opacity-50" title="Tarik data dari Google Sheets">
                      {isFetchingServer ? <Loader2 size={14} className="animate-spin mr-1" /> : <CloudDownload size={14} className="mr-1" />} 
                      Tarik Server
                    </button>
                  </div>
                </div>
              </div>

              {[
                { label: 'Nama Satuan Pendidikan', name: 'namaSekolah', type: 'text' },
                { label: 'Jenjang Pendidikan', name: 'jenjang', type: 'select', options: ['PAUD', 'SD', 'SMP', 'SMA'] },
                { label: 'Provinsi', name: 'provinsi', type: 'text' },
                { label: 'Kabupaten / Kota', name: 'kabupaten', type: 'text' },
                { label: 'Alamat Lengkap', name: 'alamat', type: 'text', colSpan: true },
                { label: 'Nama Kepala Sekolah', name: 'namaKepsek', type: 'text' },
                { label: 'No. HP / WhatsApp Kepala Sekolah', name: 'hpKepsek', type: 'text' },
                { label: 'Nama Petugas Verifikasi', name: 'namaVerifikator', type: 'text' },
                { label: 'Tanggal Verifikasi', name: 'tanggal', type: 'date' },
              ].map((field, idx) => (
                <div key={idx} className={field.colSpan ? "md:col-span-2" : ""}>
                  <label className="block text-sm font-medium mb-1">{field.label} <span className="text-red-500">*</span></label>
                  {field.type === 'select' ? (
                    <select name={field.name} value={formData.profil[field.name]} onChange={handleProfilChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1]">
                      <option value="">-- Pilih --</option>
                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input type={field.type} name={field.name} value={formData.profil[field.name]} onChange={handleProfilChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1]" />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* BAGIAN II.A & II.B */}
          <section>
            <h3 className="text-xl font-bold border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-4 flex items-center text-gray-800 dark:text-gray-100">
              <span className="bg-[#067ac1]/10 text-[#067ac1] dark:bg-[#f9a703]/20 dark:text-[#f9a703] px-3 py-1 rounded mr-3 text-sm">Bagian II.A</span>
              Kelayakan Administrasi Umum <span className="text-red-500 ml-1">*</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse border border-gray-300 dark:border-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="border border-gray-300 dark:border-gray-600 p-2 w-10 text-center">No</th>
                    <th className="border border-gray-300 dark:border-gray-600 p-2 w-1/2">Indikator Pemeriksaan</th>
                    <th className="border border-gray-300 dark:border-gray-600 p-2 w-20 text-center">Ya</th>
                    <th className="border border-gray-300 dark:border-gray-600 p-2 w-20 text-center">Tidak</th>
                    <th className="border border-gray-300 dark:border-gray-600 p-2">Keterangan / Bukti</th>
                  </tr>
                </thead>
                <tbody>
                  {adminQuestions.map((q, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center align-top">{idx + 1}</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 align-top pr-4">{q}</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center align-top">
                        <input type="radio" name={`admin-${idx}`} checked={formData.administrasi[idx].status === 'Ya'} onChange={() => handleArrayChange('administrasi', idx, 'status', 'Ya')} className="w-4 h-4 text-[#067ac1] focus:ring-[#067ac1] dark:bg-gray-600 dark:border-gray-500 cursor-pointer" />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center align-top">
                        <input type="radio" name={`admin-${idx}`} checked={formData.administrasi[idx].status === 'Tidak'} onChange={() => handleArrayChange('administrasi', idx, 'status', 'Tidak')} className="w-4 h-4 text-red-600 focus:ring-red-500 dark:bg-gray-600 dark:border-gray-500 cursor-pointer" />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 align-top">
                        <textarea value={formData.administrasi[idx].keterangan} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 min-h-[100px] resize-y focus:ring-[#067ac1] focus:border-[#067ac1]" placeholder="Detail keterangan..." onChange={(e) => handleArrayChange('administrasi', idx, 'keterangan', e.target.value)}></textarea>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
             <h3 className="text-xl font-bold border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-4 flex items-center text-gray-800 dark:text-gray-100">
              <span className="bg-[#067ac1]/10 text-[#067ac1] dark:bg-[#f9a703]/20 dark:text-[#f9a703] px-3 py-1 rounded mr-3 text-sm">Bagian II.B</span>
              Lahan, Tata Ruang, dan Swakelola <span className="text-red-500 ml-1">*</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse border border-gray-300 dark:border-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="border border-gray-300 dark:border-gray-600 p-2 w-10 text-center">No</th>
                    <th className="border border-gray-300 dark:border-gray-600 p-2 w-1/2">Indikator Pemeriksaan</th>
                    <th className="border border-gray-300 dark:border-gray-600 p-2 w-20 text-center">Ya</th>
                    <th className="border border-gray-300 dark:border-gray-600 p-2 w-20 text-center">Tidak</th>
                    <th className="border border-gray-300 dark:border-gray-600 p-2">Analisis Lapangan</th>
                  </tr>
                </thead>
                <tbody>
                  {lahanQuestions.map((q, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center align-top">{idx + 1}</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 align-top pr-4">{q}</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center align-top">
                        <input type="radio" name={`lahan-${idx}`} checked={formData.lahan[idx].status === 'Ya'} onChange={() => handleArrayChange('lahan', idx, 'status', 'Ya')} className="w-4 h-4 text-[#067ac1] focus:ring-[#067ac1] dark:bg-gray-600 dark:border-gray-500 cursor-pointer" />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center align-top">
                        <input type="radio" name={`lahan-${idx}`} checked={formData.lahan[idx].status === 'Tidak'} onChange={() => handleArrayChange('lahan', idx, 'status', 'Tidak')} className="w-4 h-4 text-red-600 focus:ring-red-500 dark:bg-gray-600 dark:border-gray-500 cursor-pointer" />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 align-top">
                        <textarea value={formData.lahan[idx].keterangan} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 min-h-[100px] resize-y focus:ring-[#067ac1] focus:border-[#067ac1]" placeholder="Catatan kondisi..." onChange={(e) => handleArrayChange('lahan', idx, 'keterangan', e.target.value)}></textarea>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* BAGIAN II.C */}
          <section>
            <h3 className="text-xl font-bold border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-4 flex items-center text-gray-800 dark:text-gray-100">
              <span className="bg-[#067ac1]/10 text-[#067ac1] dark:bg-[#f9a703]/20 dark:text-[#f9a703] px-3 py-1 rounded mr-3 text-sm">Bagian II.C</span>
              Pemetaan Kebutuhan (IFP) & Kelistrikan
            </h3>
            
            <div className="bg-[#067ac1]/5 dark:bg-[#067ac1]/20 border border-[#067ac1]/30 dark:border-[#067ac1]/50 p-4 rounded-lg mb-4 text-sm text-[#067ac1] dark:text-[#6cb4e4] flex items-start">
              <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
              <p>Bandingkan data Dapodik dengan realitas kunjungan kelas guna menghindari over-supply bantuan digitalisasi.</p>
            </div>

            <div className="space-y-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                 <h4 className="font-bold text-lg mb-3 text-gray-800 dark:text-gray-200">1. Pemetaan Kuota Hak IFP</h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded border border-gray-200 dark:border-gray-600">
                      <label className="block text-sm font-semibold mb-2">a. Rombel (Aktif) <span className="text-red-500">*</span></label>
                      <input type="number" name="rombelDapodik" value={formData.digitalisasi.rombelDapodik} placeholder="Data Dapodik" className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1] mb-2" onChange={handleDigiChange}/>
                      <input type="number" name="rombelFakta" value={formData.digitalisasi.rombelFakta} placeholder="Fakta Lapangan" className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1]" onChange={handleDigiChange}/>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded border border-gray-200 dark:border-gray-600">
                      <label className="block text-sm font-semibold mb-2">b. Ruang Kelas (Layak) <span className="text-red-500">*</span></label>
                      <input type="number" name="ruangDapodik" value={formData.digitalisasi.ruangDapodik} placeholder="Data Dapodik" className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1] mb-2" onChange={handleDigiChange}/>
                      <input type="number" name="ruangFakta" value={formData.digitalisasi.ruangFakta} placeholder="Fakta Lapangan" className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1]" onChange={handleDigiChange}/>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded border border-gray-200 dark:border-gray-600">
                      <label className="block text-sm font-semibold mb-2">c. Analisis & Rekomendasi <span className="text-red-500">*</span></label>
                      <input type="text" name="analisisIfp" value={formData.digitalisasi.analisisIfp} placeholder="Analisis Kuota..." className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1] mb-2" onChange={handleDigiChange}/>
                      <textarea name="rekomendasiIfp" value={formData.digitalisasi.rekomendasiIfp} placeholder="Tuliskan rekomendasi jumlah unit..." className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1] min-h-[100px] resize-y" onChange={handleDigiChange}></textarea>
                    </div>
                 </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                 <h4 className="font-bold text-lg mb-3 text-gray-800 dark:text-gray-200">2. Kesiapan Ekosistem Pendukung</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-1">a. Kapasitas Daya Listrik (VA) <span className="text-red-500">*</span></label>
                      <select name="listrikDaya" value={formData.digitalisasi.listrikDaya} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1] mb-3" onChange={handleDigiChange}>
                        <option value="">-- Pilih Daya Listrik --</option>
                        <option value="Tidak ada listrik">Tidak ada listrik</option>
                        <option value="450 VA">450 VA</option>
                        <option value="900 VA">900 VA</option>
                        <option value="1300 VA">1300 VA</option>
                        <option value="2200 VA">2200 VA</option>
                        <option value="3500 VA">3500 VA</option>
                        <option value="Diatas 3500 VA">Diatas 3500 VA</option>
                      </select>
                      
                      <label className="block text-sm font-semibold mb-1">b. Asumsi Beban Penambahan Daya <span className="text-red-500">*</span></label>
                      <input type="text" name="listrikAsumsi" value={formData.digitalisasi.listrikAsumsi} placeholder="Analisis asumsi daya..." className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1] mb-2" onChange={handleDigiChange}/>
                      <select name="listrikKesimpulan" value={formData.digitalisasi.listrikKesimpulan} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1]" onChange={handleDigiChange}>
                        <option value="">-- Kesimpulan Listrik --</option>
                        <option value="Memadai">Memadai</option>
                        <option value="Perlu Tambah Daya PLN">Perlu Tambah Daya PLN</option>
                        <option value="Butuh Panel Surya">Butuh Panel Surya</option>
                      </select>
                    </div>
                    <div>
                      <div className="flex gap-2 mb-3">
                        <div className="w-1/2">
                           <label className="block text-sm font-semibold mb-1">c. Status Internet <span className="text-red-500">*</span></label>
                           <select name="internetStatus" value={formData.digitalisasi.internetStatus} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1]" onChange={handleDigiChange}>
                              <option value="">-- Pilih Akses --</option>
                              <option value="Kabel Fiber (Indihome/Biznet/dll)">Kabel Fiber Optik</option>
                              <option value="Seluler (Telkomsel/XL/dll)">Jaringan Seluler</option>
                              <option value="Satelit / VSAT">Satelit / VSAT</option>
                              <option value="Blank Spot (Tidak Ada Sinyal)">Blank Spot</option>
                           </select>
                        </div>
                        <div className="w-1/2">
                           <label className="block text-sm font-semibold mb-1">Provider & Kecepatan <span className="text-red-500">*</span></label>
                           <input type="text" name="internetProvider" value={formData.digitalisasi.internetProvider} placeholder="Cth: Telkomsel 10Mbps" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1]" onChange={handleDigiChange}/>
                        </div>
                      </div>

                      <label className="block text-sm font-semibold mb-1">d. Kondisi Ruang Penyimpanan <span className="text-red-500">*</span></label>
                      {/* Opsi Ruang Penyimpanan Terbaru */}
                      <select name="ruangKondisiOpsi" value={formData.digitalisasi.ruangKondisiOpsi} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1] mb-2" onChange={handleRuangKondisiOpsi}>
                        <option value="">-- Pilih Fasilitas Keamanan Keamanan --</option>
                        <option value="Gembok Ganda & Teralis Besi">Gembok Ganda & Teralis Besi</option>
                        <option value="Atap Aman (Tidak Bocor/Rawan)">Atap Aman (Tidak Bocor/Rawan)</option>
                        <option value="Terdapat CCTV Aktif">Terdapat CCTV Aktif</option>
                        <option value="Dijaga Penjaga Sekolah / Satpam">Dijaga Penjaga Sekolah / Satpam</option>
                        <option value="Kombinasi (Gembok, Teralis, CCTV, Satpam)">Kombinasi Lengkap (Gembok, Teralis, CCTV, Satpam)</option>
                        <option value="Lainnya">Lainnya (Isi Manual)</option>
                      </select>
                      {/* Input Manual jika memilih Lainnya */}
                      {formData.digitalisasi.ruangKondisiOpsi === 'Lainnya' && (
                        <input type="text" name="ruangKondisi" value={formData.digitalisasi.ruangKondisi} placeholder="Ketik manual kondisi keamanan..." className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1] mb-2" onChange={handleDigiChange}/>
                      )}

                      <select name="ruangKesimpulan" value={formData.digitalisasi.ruangKesimpulan} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1]" onChange={handleDigiChange}>
                        <option value="">-- Kesimpulan Ruang --</option>
                        {/* Pilihan Kesimpulan Ruang Terbaru */}
                        <option value="Aman">Aman</option>
                        <option value="Cukup">Cukup</option>
                        <option value="Rawan">Rawan</option>
                      </select>
                    </div>
                 </div>
              </div>
            </div>
          </section>

          {/* BAGIAN III */}
          <section className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner">
            <h3 className="text-xl font-bold pb-2 mb-4 flex items-center border-b-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100">
              <span className="bg-[#067ac1] text-white dark:bg-[#f9a703] dark:text-gray-900 px-3 py-1 rounded mr-3 text-sm">Bagian III</span>
              Catatan Kendala & Rekomendasi
            </h3>
            
            <div className="mb-6 space-y-4">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">1. Deskripsi Catatan Lapangan:</h4>
              <div>
                <label className="block text-sm font-medium mb-1">a. Aspek Administrasi & Lahan: <span className="text-red-500">*</span></label>
                <textarea name="catatanAdmin" value={formData.kesimpulan.catatanAdmin} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1] min-h-[120px] resize-y" onChange={handleKesimpulanChange} placeholder="Tuliskan catatan administrasi... (Isi '-' jika tidak ada)"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">b. Aspek Kelistrikan & Jaringan: <span className="text-red-500">*</span></label>
                <textarea name="catatanListrik" value={formData.kesimpulan.catatanListrik} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1] min-h-[120px] resize-y" onChange={handleKesimpulanChange} placeholder="Tuliskan catatan listrik... (Isi '-' jika tidak ada)"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">c. Aspek Keamanan Ruang & SDM: <span className="text-red-500">*</span></label>
                <textarea name="catatanKeamanan" value={formData.kesimpulan.catatanKeamanan} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1] min-h-[120px] resize-y" onChange={handleKesimpulanChange} placeholder="Tuliskan catatan keamanan... (Isi '-' jika tidak ada)"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">d. Aspek Pemanfaatan bantuan yang sudah diterima: <span className="text-red-500">*</span></label>
                <textarea name="catatanPemanfaatan" value={formData.kesimpulan.catatanPemanfaatan} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1] min-h-[120px] resize-y" onChange={handleKesimpulanChange} placeholder="Tuliskan catatan pemanfaatan bantuan... (Isi '-' jika tidak ada)"></textarea>
              </div>
              {/* Kolom Link Google Drive Baru */}
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                   <Link size={16} className="mr-2 text-[#067ac1] dark:text-[#f9a703]" />
                   e. Tautan (Link) G-Drive Dokumentasi Bukti Fisik: <span className="text-red-500 ml-1">*</span>
                </label>
                <input type="url" name="linkDrive" value={formData.kesimpulan.linkDrive} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1]" onChange={handleKesimpulanChange} placeholder="https://drive.google.com/drive/folders/..." />
                <p className="text-xs text-gray-500 mt-1">Pastikan akses link Google Drive telah diubah menjadi "Siapa saja yang memiliki tautan (Anyone with the link)".</p>
              </div>
            </div>

            <div className="mb-4 bg-white dark:bg-gray-700 p-5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm">
               <label className="block font-semibold mb-2 text-gray-800 dark:text-gray-200">2. Kesimpulan Uji Kelayakan: <span className="text-red-500">*</span></label>
               <select name="statusKelayakan" value={formData.kesimpulan.statusKelayakan} className="w-full p-3 border border-[#067ac1]/50 dark:border-[#f9a703]/50 rounded-lg bg-[#067ac1]/5 dark:bg-gray-800 focus:ring-[#067ac1] dark:focus:ring-[#f9a703] font-semibold mb-4 text-[#067ac1] dark:text-[#f9a703]" onChange={handleKesimpulanChange}>
                  <option value="">-- Pilih Kesimpulan Akhir --</option>
                  <option value="SANGAT SIAP DAN MEMENUHI SYARAT">SANGAT SIAP DAN MEMENUHI SYARAT (Direkomendasikan segera ditetapkan)</option>
                  <option value="SIAP DENGAN CATATAN PENGKONDISIAN KHUSUS">SIAP DENGAN CATATAN (Dapat ditetapkan dengan syarat perbaikan)</option>
                  <option value="TIDAK SIAP / TIDAK MEMENUHI SYARAT">TIDAK SIAP / TIDAK MEMENUHI SYARAT (Tidak direkomendasikan)</option>
               </select>

               <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Catatan Khusus Kesimpulan: <span className="text-red-500">*</span></label>
               <textarea name="catatanKelayakan" value={formData.kesimpulan.catatanKelayakan} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-600 focus:ring-[#067ac1] focus:border-[#067ac1] min-h-[120px] resize-y" onChange={handleKesimpulanChange} placeholder="Berikan penjelasan atau syarat tambahan atas kesimpulan yang dipilih..."></textarea>
            </div>
          </section>

        </div>
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 z-20 flex flex-col justify-center items-center backdrop-blur-sm rounded-xl print:hidden">
            <Loader2 size={48} className="text-[#067ac1] dark:text-[#f9a703] animate-spin mb-4" />
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">Mengirim data ke Google Sheets...</p>
          </div>
        )}

        {/* Floating Actions */}
        <div className="bg-gray-100 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 p-4 flex flex-wrap justify-end gap-3 print:hidden sticky bottom-0 rounded-b-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
          <p className="w-full text-right text-xs text-gray-500 dark:text-gray-400 mb-1">Untuk mencetak, tekan <kbd className="bg-gray-200 dark:bg-gray-600 px-1 rounded">CTRL+P</kbd> jika tombol terblokir.</p>
          <button onClick={handleSaveDraft} disabled={isLoading || isFetchingServer} className="flex items-center px-4 md:px-6 py-2 bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition font-medium disabled:opacity-50">
            <Save size={18} className="mr-2" /> Simpan Draft
          </button>
          <button onClick={handlePrint} disabled={isLoading || isFetchingServer} className="flex items-center px-4 md:px-6 py-2 bg-[#f9a703] text-white rounded-lg hover:bg-[#e09602] transition font-medium disabled:opacity-50 shadow-md">
            <Printer size={18} className="mr-2" /> Cetak PDF
          </button>
          <button onClick={handleSubmit} disabled={isLoading || isFetchingServer} className="flex items-center px-4 md:px-6 py-2 bg-[#067ac1] text-white rounded-lg hover:bg-[#056099] transition font-medium disabled:opacity-50 shadow-md">
            <Send size={18} className="mr-2" /> {isLoading ? "Mengirim..." : "Kirim ke Google Sheets"}
          </button>
        </div>

      </div>
    </div>
  );
}