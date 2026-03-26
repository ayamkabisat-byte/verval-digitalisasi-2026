import React, { useState, useEffect } from 'react';
import { FileText, Printer, Save, AlertCircle, Moon, Sun, Send, Search, Loader2, CloudDownload, Link, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';

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

const wilayahMap = {
  "Jawa Barat": ["Kota Bekasi", "Kab. Ciamis"],
  "Jawa Tengah": ["Kab. Klaten", "Kab. Wonosobo"],
  "Jawa Timur": ["Kab. Ngawi"],
  "Kalimantan Barat": ["Kab. Sambas"],
  "Kepulauan Bangka Belitung": ["Kab. Belitung"],
  "Papua Barat Daya": ["Kab. Sorong"],
  "Sulawesi Tengah": ["Kab. Donggala"]
};

const provinsiList = Object.keys(wilayahMap);

// URL Script Google
const scriptURL = 'https://script.google.com/macros/s/AKfycbxoC2TjU71W1ya6xL7b47zx8zUqg8ipy9nuXjwDaTJzSTmSX1IAf0g6PgDbl9hzsKU9KQ/exec';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingServer, setIsFetchingServer] = useState(false);
  const [activeTab, setActiveTab] = useState('Bagian I'); 
  
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
    const name = e.target.name;
    
    if (name === 'npsn') {
      value = value.replace(/[^0-9]/g, '').slice(0, 8);
    }
    
    setFormData(prev => {
      const newProfil = { ...prev.profil, [name]: value };
      if (name === 'provinsi') {
        newProfil.kabupaten = '';
      }
      return { ...prev, profil: newProfil };
    });
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
        ruangKondisi: value !== 'Lainnya' ? value : '' 
      }
    }));
  };

  const handleKesimpulanChange = (e) => {
    setFormData({ ...formData, kesimpulan: { ...formData.kesimpulan, [e.target.name]: e.target.value } });
  };

  const isSectionComplete = (section) => {
    switch (section) {
      case 'Bagian I':
        if (formData.profil.npsn.length !== 8) return false;
        for (let key in formData.profil) {
          if (formData.profil[key].trim() === '') return false;
        }
        return true;
      case 'Bagian II.A':
        return formData.administrasi.every(item => item.status !== '');
      case 'Bagian II.B':
        return formData.lahan.every(item => item.status !== '');
      case 'Bagian II.C':
        const keysDigi = ['rombelDapodik', 'rombelFakta', 'ruangDapodik', 'ruangFakta', 'analisisIfp', 'rekomendasiIfp', 'listrikDaya', 'listrikAsumsi', 'listrikKesimpulan', 'internetStatus', 'internetProvider', 'ruangKondisiOpsi', 'ruangKesimpulan'];
        const isBasicFilled = keysDigi.every(k => formData.digitalisasi[k].trim() !== '');
        const isOpsiLainnyaFilled = formData.digitalisasi.ruangKondisiOpsi === 'Lainnya' ? formData.digitalisasi.ruangKondisi.trim() !== '' : true;
        return isBasicFilled && isOpsiLainnyaFilled;
      case 'Bagian III':
        for (let key in formData.kesimpulan) {
          if (formData.kesimpulan[key].trim() === '') return false;
        }
        return true;
      default:
        return false;
    }
  };

  const validateForm = () => {
    return ['Bagian I', 'Bagian II.A', 'Bagian II.B', 'Bagian II.C', 'Bagian III'].every(tab => isSectionComplete(tab));
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert("PENGIRIMAN GAGAL: Mohon lengkapi seluruh isian form secara benar pada setiap tab sebelum mengirim data.");
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

  const tabs = ['Bagian I', 'Bagian II.A', 'Bagian II.B', 'Bagian II.C', 'Bagian III'];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'} print:bg-white print:text-black font-sans relative z-0`}>
      
      {/* Latar Belakang Pattern (Hanya Tampil di Web) */}
      <div 
        className="fixed inset-0 z-[-1] opacity-[0.08] dark:opacity-[0.15] dark:invert pointer-events-none print:hidden"
        style={{ backgroundImage: "url('/Pattern.png')", backgroundRepeat: 'repeat', backgroundSize: '250px' }}
      ></div>

      {/* ========================================================================= */}
      {/* TAMPILAN WEB FORM (INTERAKTIF) - Disembunyikan saat di-print (print:hidden) */}
      {/* ========================================================================= */}
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden transition-colors duration-300 relative border-t-8 border-[#f9a703] z-10 my-4 md:my-8 print:hidden">
        
        {/* Header Web */}
        <div className="bg-white dark:bg-gray-900 p-6 text-center border-b border-gray-200 dark:border-gray-700 relative">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-[#067ac1] dark:text-[#f9a703]" title="Toggle Dark Mode">
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          <div className="flex justify-center mb-6">
             <img src={isDarkMode ? "/Header Itjen Kemendikdasmen Dark.png" : "/Header Itjen Kemendikdasmen.png"} alt="Header Kemendikdasmen" className="h-24 md:h-32 lg:h-36 object-contain" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1 uppercase text-[#067ac1] dark:text-[#f9a703]">Instrumen Verifikasi Kesiapan</h1>
          <h2 className="text-lg md:text-xl font-semibold text-gray-600 dark:text-gray-400">Satuan Pendidikan Calon Penerima Bantuan Revitalisasi & Digitalisasi Tahun 2026</h2>
        </div>

        {/* Navigasi Tab Web */}
        <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 overflow-x-auto whitespace-nowrap sticky top-0 z-20 shadow-sm">
          <div className="flex gap-2 min-w-max mx-auto max-w-5xl px-2">
            {tabs.map((tab, idx) => {
              const isComplete = isSectionComplete(tab);
              const isActive = activeTab === tab;
              let btnClass = "flex items-center px-4 py-2.5 rounded-lg font-bold text-sm transition-all border-2 ";
              if (isComplete) {
                btnClass += isActive ? "bg-[#f9a703] text-white border-[#f9a703] shadow-md" : "bg-[#f9a703]/10 text-[#d08c02] dark:text-[#f9a703] border-[#f9a703]/30 hover:bg-[#f9a703]/20";
              } else {
                btnClass += isActive ? "bg-[#067ac1] text-white border-[#067ac1] shadow-md" : "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200";
              }
              return (
                <button key={tab} onClick={() => setActiveTab(tab)} className={btnClass}>
                  <span className="mr-1">{idx + 1}.</span> {tab}
                  {isComplete && <CheckCircle size={16} className="ml-2" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Konten Tab Web */}
        <div className="p-6 md:p-10 space-y-10">
          
          {/* TAB 1: PROFIL */}
          <section className={`${activeTab === 'Bagian I' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'}`}>
            <h3 className="text-xl font-bold border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-4 flex items-center text-gray-800 dark:text-gray-100">
              <span className="bg-[#067ac1]/10 text-[#067ac1] dark:bg-[#f9a703]/20 dark:text-[#f9a703] px-3 py-1 rounded mr-3 text-sm">Bagian I</span>
              Profil dan Data Umum
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">NPSN <span className="text-red-500">*</span> <span className="text-xs text-gray-400 font-normal">(Harus 8 digit angka)</span></label>
                <div className="flex gap-2">
                  <input type="text" name="npsn" value={formData.profil.npsn} onChange={handleProfilChange} className={`w-full p-2 border ${formData.profil.npsn.length > 0 && formData.profil.npsn.length !== 8 ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'} rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1]`} placeholder="Ketik 8 digit NPSN..." />
                  <div className="flex flex-col gap-1">
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
                { label: 'Provinsi', name: 'provinsi', type: 'select', options: provinsiList },
                { label: 'Kabupaten / Kota', name: 'kabupaten', type: 'select', options: formData.profil.provinsi ? wilayahMap[formData.profil.provinsi] : [] },
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
            <div className="flex justify-end mt-8">
              <button onClick={() => setActiveTab('Bagian II.A')} className="flex items-center px-6 py-2.5 bg-[#067ac1] text-white rounded-lg hover:bg-[#056099] transition font-bold shadow-md">
                Lanjut ke Bagian II.A <ChevronRight size={20} className="ml-1" />
              </button>
            </div>
          </section>

          {/* TAB 2.A: ADMINISTRASI */}
          <section className={`${activeTab === 'Bagian II.A' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'}`}>
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
                        <input type="radio" name={`admin-${idx}`} checked={formData.administrasi[idx].status === 'Ya'} onChange={() => handleArrayChange('administrasi', idx, 'status', 'Ya')} className="w-5 h-5 text-[#067ac1] focus:ring-[#067ac1] dark:bg-gray-600 dark:border-gray-500 cursor-pointer" />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center align-top">
                        <input type="radio" name={`admin-${idx}`} checked={formData.administrasi[idx].status === 'Tidak'} onChange={() => handleArrayChange('administrasi', idx, 'status', 'Tidak')} className="w-5 h-5 text-red-600 focus:ring-red-500 dark:bg-gray-600 dark:border-gray-500 cursor-pointer" />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 align-top">
                        <textarea value={formData.administrasi[idx].keterangan} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 min-h-[100px] resize-y focus:ring-[#067ac1] focus:border-[#067ac1]" placeholder="Detail keterangan..." onChange={(e) => handleArrayChange('administrasi', idx, 'keterangan', e.target.value)}></textarea>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={() => setActiveTab('Bagian I')} className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium">
                <ChevronLeft size={20} className="mr-1" /> Kembali
              </button>
              <button onClick={() => setActiveTab('Bagian II.B')} className="flex items-center px-6 py-2.5 bg-[#067ac1] text-white rounded-lg hover:bg-[#056099] transition font-bold shadow-md">
                Lanjut ke Bagian II.B <ChevronRight size={20} className="ml-1" />
              </button>
            </div>
          </section>

          {/* TAB 2.B: LAHAN */}
          <section className={`${activeTab === 'Bagian II.B' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'}`}>
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
                        <input type="radio" name={`lahan-${idx}`} checked={formData.lahan[idx].status === 'Ya'} onChange={() => handleArrayChange('lahan', idx, 'status', 'Ya')} className="w-5 h-5 text-[#067ac1] focus:ring-[#067ac1] dark:bg-gray-600 dark:border-gray-500 cursor-pointer" />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center align-top">
                        <input type="radio" name={`lahan-${idx}`} checked={formData.lahan[idx].status === 'Tidak'} onChange={() => handleArrayChange('lahan', idx, 'status', 'Tidak')} className="w-5 h-5 text-red-600 focus:ring-red-500 dark:bg-gray-600 dark:border-gray-500 cursor-pointer" />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 align-top">
                        <textarea value={formData.lahan[idx].keterangan} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 min-h-[100px] resize-y focus:ring-[#067ac1] focus:border-[#067ac1]" placeholder="Catatan kondisi..." onChange={(e) => handleArrayChange('lahan', idx, 'keterangan', e.target.value)}></textarea>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={() => setActiveTab('Bagian II.A')} className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium">
                <ChevronLeft size={20} className="mr-1" /> Kembali
              </button>
              <button onClick={() => setActiveTab('Bagian II.C')} className="flex items-center px-6 py-2.5 bg-[#067ac1] text-white rounded-lg hover:bg-[#056099] transition font-bold shadow-md">
                Lanjut ke Bagian II.C <ChevronRight size={20} className="ml-1" />
              </button>
            </div>
          </section>

          {/* TAB 2.C: DIGITALISASI */}
          <section className={`${activeTab === 'Bagian II.C' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'}`}>
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
                      <select name="ruangKondisiOpsi" value={formData.digitalisasi.ruangKondisiOpsi} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1] mb-2" onChange={handleRuangKondisiOpsi}>
                        <option value="">-- Pilih Fasilitas Keamanan --</option>
                        <option value="Gembok Ganda & Teralis Besi">Gembok Ganda & Teralis Besi</option>
                        <option value="Atap Aman (Tidak Bocor/Rawan)">Atap Aman (Tidak Bocor/Rawan)</option>
                        <option value="Terdapat CCTV Aktif">Terdapat CCTV Aktif</option>
                        <option value="Dijaga Penjaga Sekolah / Satpam">Dijaga Penjaga Sekolah / Satpam</option>
                        <option value="Kombinasi Lengkap (Gembok, Teralis, CCTV, Satpam)">Kombinasi Lengkap (Gembok, Teralis, CCTV, Satpam)</option>
                        <option value="Lainnya">Lainnya (Isi Manual)</option>
                      </select>
                      {formData.digitalisasi.ruangKondisiOpsi === 'Lainnya' && (
                        <input type="text" name="ruangKondisi" value={formData.digitalisasi.ruangKondisi} placeholder="Ketik manual kondisi keamanan..." className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1] mb-2" onChange={handleDigiChange}/>
                      )}

                      <select name="ruangKesimpulan" value={formData.digitalisasi.ruangKesimpulan} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-[#067ac1] focus:border-[#067ac1]" onChange={handleDigiChange}>
                        <option value="">-- Kesimpulan Ruang --</option>
                        <option value="Aman">Aman</option>
                        <option value="Cukup">Cukup</option>
                        <option value="Rawan">Rawan</option>
                      </select>
                    </div>
                 </div>
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={() => setActiveTab('Bagian II.B')} className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium">
                <ChevronLeft size={20} className="mr-1" /> Kembali
              </button>
              <button onClick={() => setActiveTab('Bagian III')} className="flex items-center px-6 py-2.5 bg-[#067ac1] text-white rounded-lg hover:bg-[#056099] transition font-bold shadow-md">
                Lanjut ke Bagian III <ChevronRight size={20} className="ml-1" />
              </button>
            </div>
          </section>

          {/* TAB 3: KESIMPULAN */}
          <section className={`${activeTab === 'Bagian III' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-500' : 'hidden'} bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner`}>
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
            
            <div className="flex justify-start mt-8">
              <button onClick={() => setActiveTab('Bagian II.C')} className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium">
                <ChevronLeft size={20} className="mr-1" /> Kembali ke Bagian II.C
              </button>
            </div>
          </section>

        </div>

        {/* Floating Actions Web */}
        <div className="bg-gray-100 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 p-4 flex flex-wrap justify-end gap-3 sticky bottom-0 z-30">
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
      {/* END TAMPILAN WEB */}


      {/* ========================================================================= */}
      {/* TAMPILAN CETAK PDF (NARATIF) - Hanya tampil saat diprint (hidden print:block) */}
      {/* ========================================================================= */}
      <div className="hidden print:block font-serif w-full max-w-none text-black bg-white pt-4 pb-12 px-8 text-[11pt] leading-snug">
        
        {/* Kop Surat Dokumen Cetak */}
        <div className="border-b-4 border-black pb-4 mb-4 text-center">
           <img src="/Header Itjen Kemendikdasmen.png" alt="Header Kemendikdasmen" className="h-20 mx-auto object-contain mb-3" />
           <h1 className="text-[13pt] font-bold uppercase">INSTRUMEN VERIFIKASI KESIAPAN SATUAN PENDIDIKAN</h1>
           <h2 className="text-[12pt] font-bold uppercase">CALON PENERIMA BANTUAN REVITALISASI & DIGITALISASI TAHUN 2026</h2>
        </div>

        {/* Bagian I - Cetak */}
        <h3 className="font-bold text-[12pt] mb-2 uppercase">BAGIAN I: PROFIL DAN DATA UMUM SATUAN PENDIDIKAN</h3>
        <table className="w-full mb-6 text-[11pt]">
          <tbody>
            <tr><td className="w-1/3 py-1 align-top">Nama Satuan Pendidikan</td><td className="w-2/3 py-1 align-top">: {formData.profil.namaSekolah || '..............................................................'}</td></tr>
            <tr><td className="w-1/3 py-1 align-top">Jenjang Pendidikan</td><td className="w-2/3 py-1 align-top">: {formData.profil.jenjang || '..............................................................'}</td></tr>
            <tr><td className="w-1/3 py-1 align-top">NPSN</td><td className="w-2/3 py-1 align-top">: {formData.profil.npsn || '..............................................................'}</td></tr>
            <tr><td className="w-1/3 py-1 align-top">Provinsi</td><td className="w-2/3 py-1 align-top">: {formData.profil.provinsi || '..............................................................'}</td></tr>
            <tr><td className="w-1/3 py-1 align-top">Kabupaten / Kota</td><td className="w-2/3 py-1 align-top">: {formData.profil.kabupaten || '..............................................................'}</td></tr>
            <tr><td className="w-1/3 py-1 align-top">Alamat Lengkap Satuan Pendidikan</td><td className="w-2/3 py-1 align-top">: {formData.profil.alamat || '..............................................................'}</td></tr>
            <tr><td className="w-1/3 py-1 align-top">Nama Kepala Sekolah</td><td className="w-2/3 py-1 align-top">: {formData.profil.namaKepsek || '..............................................................'}</td></tr>
            <tr><td className="w-1/3 py-1 align-top">No. HP / WhatsApp Kepala Sekolah</td><td className="w-2/3 py-1 align-top">: {formData.profil.hpKepsek || '..............................................................'}</td></tr>
            <tr><td className="w-1/3 py-1 align-top">Nama Petugas Verifikasi</td><td className="w-2/3 py-1 align-top">: {formData.profil.namaVerifikator || '..............................................................'}</td></tr>
            <tr><td className="w-1/3 py-1 align-top">Tanggal Verifikasi</td><td className="w-2/3 py-1 align-top">: {formData.profil.tanggal || '..............................................................'}</td></tr>
          </tbody>
        </table>

        {/* Bagian II - Cetak */}
        <h3 className="font-bold text-[12pt] mb-1 uppercase break-before-auto">BAGIAN II: VERIFIKASI KESIAPAN SASARAN (PRA-PELAKSANAAN)</h3>
        <p className="mb-4 text-justify">Instrumen ini diisi secara objektif oleh petugas verifikator (Dinas Pendidikan/Inspektorat/Tim Pusat) melalui observasi lapangan dan pemeriksaan dokumen pembuktian fisik sebelum penetapan SK Penerima Bantuan Tahun 2026 diterbitkan.</p>
        
        {/* II.A */}
        <h4 className="font-bold mb-2">A. Kelayakan Administrasi Umum dan Ekosistem Kelembagaan</h4>
        <table className="w-full border-collapse border border-black mb-6 text-[10pt]">
          <thead>
            <tr>
              <th className="border border-black p-1.5 w-8 text-center">No</th>
              <th className="border border-black p-1.5 w-1/2">Indikator Pemeriksaan Kelayakan Administrasi</th>
              <th className="border border-black p-1.5 w-12 text-center">Sesuai</th>
              <th className="border border-black p-1.5 w-12 text-center">Tidak</th>
              <th className="border border-black p-1.5">Keterangan / Bukti</th>
            </tr>
          </thead>
          <tbody>
            {adminQuestions.map((q, idx) => (
              <tr key={idx} className="break-inside-avoid">
                <td className="border border-black p-1.5 text-center align-top">{idx + 1}</td>
                <td className="border border-black p-1.5 align-top">{q}</td>
                <td className="border border-black p-1.5 text-center align-top font-sans font-bold">{formData.administrasi[idx].status === 'Ya' ? '✓' : ''}</td>
                <td className="border border-black p-1.5 text-center align-top font-sans font-bold">{formData.administrasi[idx].status === 'Tidak' ? '✓' : ''}</td>
                <td className="border border-black p-1.5 align-top">{formData.administrasi[idx].keterangan}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* II.B */}
        <h4 className="font-bold mb-2 break-before-auto">B. Verifikasi Lahan, Tata Ruang, dan Kesiapan Swakelola (Fokus Bantuan Fisik/Revitalisasi)</h4>
        <table className="w-full border-collapse border border-black mb-6 text-[10pt]">
          <thead>
            <tr>
              <th className="border border-black p-1.5 w-8 text-center">No</th>
              <th className="border border-black p-1.5 w-1/2">Indikator Pemeriksaan Lahan, Fisik, dan Swakelola</th>
              <th className="border border-black p-1.5 w-12 text-center">Sesuai</th>
              <th className="border border-black p-1.5 w-12 text-center">Tidak</th>
              <th className="border border-black p-1.5">Analisis Kondisi Lapangan</th>
            </tr>
          </thead>
          <tbody>
            {lahanQuestions.map((q, idx) => (
              <tr key={idx} className="break-inside-avoid">
                <td className="border border-black p-1.5 text-center align-top">{idx + 1}</td>
                <td className="border border-black p-1.5 align-top">{q}</td>
                <td className="border border-black p-1.5 text-center align-top font-sans font-bold">{formData.lahan[idx].status === 'Ya' ? '✓' : ''}</td>
                <td className="border border-black p-1.5 text-center align-top font-sans font-bold">{formData.lahan[idx].status === 'Tidak' ? '✓' : ''}</td>
                <td className="border border-black p-1.5 align-top">{formData.lahan[idx].keterangan}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* II.C (Format Naratif) */}
        <div className="break-inside-avoid">
           <h4 className="font-bold mb-1">C. Analisis Pemetaan Kebutuhan Digitalisasi (IFP) dan Kapasitas Infrastruktur Kelistrikan</h4>
           <p className="italic text-[10pt] mb-3">Bagian ini wajib diisi dengan membandingkan data Dapodik dengan realitas kunjungan kelas guna menghindari over-supply bantuan digitalisasi.</p>
           
           <ol className="list-decimal ml-5 mb-6 space-y-3">
             <li>
                <span className="font-bold">Pemetaan Kuota Hak Interactive Flat Panel (IFP)</span>
                <ul className="list-[lower-alpha] ml-5 mt-1 space-y-1">
                   <li>Jumlah Rombongan Belajar (Rombel) yang aktif: Dapodik <span className="font-bold">({formData.digitalisasi.rombelDapodik || '...'})</span>, Fakta di Lapangan <span className="font-bold">({formData.digitalisasi.rombelFakta || '...'})</span>.</li>
                   <li>Jumlah Ruang Kelas fisik yang tersedia dan layak: Dapodik <span className="font-bold">({formData.digitalisasi.ruangDapodik || '...'})</span>, Fakta di Lapangan <span className="font-bold">({formData.digitalisasi.ruangFakta || '...'})</span>.</li>
                   <li>Analisis Kuota IFP Sasaran Baru 2026: <span className="font-bold">{formData.digitalisasi.analisisIfp || '..............................'}</span>.</li>
                   <li>Rekomendasi Verifikator: <span className="font-bold">{formData.digitalisasi.rekomendasiIfp || '............................................................'}</span>.</li>
                </ul>
             </li>
             <li>
                <span className="font-bold">Kesiapan Ekosistem Pendukung Digitalisasi</span>
                <ul className="list-[lower-alpha] ml-5 mt-1 space-y-1">
                   <li>Kapasitas Daya Listrik Eksisting saat ini (VA): <span className="font-bold">{formData.digitalisasi.listrikDaya || '..............................'}</span>.</li>
                   <li>Asumsi Beban Penambahan Daya berdasarkan Kuota IFP: <span className="font-bold">{formData.digitalisasi.listrikAsumsi || '..............................'}</span>.<br/>Kesimpulan: <span className="font-bold uppercase underline">{formData.digitalisasi.listrikKesimpulan || '..............................'}</span>.</li>
                   <li>Status ketersediaan dan kestabilan Internet: <span className="font-bold">{formData.digitalisasi.internetStatus || '..............................'}</span>.<br/>Provider dan Kecepatan Uji Coba: <span className="font-bold">{formData.digitalisasi.internetProvider || '..............................'}</span>.</li>
                   <li>Kondisi Ruang Penyimpanan Barang Digital: <span className="font-bold">{formData.digitalisasi.ruangKondisi || '..............................'}</span>.<br/>Kesimpulan Ruang: <span className="font-bold uppercase underline">{formData.digitalisasi.ruangKesimpulan || '..............................'}</span>.</li>
                </ul>
             </li>
           </ol>
        </div>

        {/* Bagian III - Cetak */}
        <div className="break-before-auto">
           <h3 className="font-bold text-[12pt] mb-1 uppercase">BAGIAN III: CATATAN KENDALA, KESIMPULAN, DAN REKOMENDASI VERIFIKATOR</h3>
           <p className="text-justify mb-4">Verifikator wajib menguraikan secara kualitatif terkait temuan anomali data, hambatan geografis, defisit daya listrik, potensi masalah hukum lahan, atau hal-hal spesifik lainnya yang membutuhkan perhatian khusus sebelum SK Penetapan diterbitkan.</p>
           
           <ol className="list-decimal ml-5 mb-6 space-y-3">
             <li>
                <span className="font-bold">Deskripsi Catatan Lapangan / Kendala Kesiapan Ekosistem:</span>
                <ul className="list-[lower-alpha] ml-5 mt-2 space-y-2">
                   <li><span className="font-semibold">Aspek Administrasi & Lahan:</span> <br/>{formData.kesimpulan.catatanAdmin || '........................................................................................................................'}</li>
                   <li><span className="font-semibold">Aspek Kelistrikan & Jaringan:</span> <br/>{formData.kesimpulan.catatanListrik || '........................................................................................................................'}</li>
                   <li><span className="font-semibold">Aspek Keamanan Ruang & SDM:</span> <br/>{formData.kesimpulan.catatanKeamanan || '........................................................................................................................'}</li>
                   <li><span className="font-semibold">Aspek Pemanfaatan bantuan yang sudah diterima:</span> <br/>{formData.kesimpulan.catatanPemanfaatan || '........................................................................................................................'}</li>
                   <li><span className="font-semibold">Tautan (Link) G-Drive Dokumentasi Bukti Fisik:</span> <br/><span className="text-blue-800 underline">{formData.kesimpulan.linkDrive || '........................................................................................................................'}</span></li>
                </ul>
             </li>
             <li className="break-inside-avoid">
                <span className="font-bold">Kesimpulan Uji Kelayakan:</span><br/>
                Berdasarkan verifikasi administrasi dan observasi lapangan yang dilaksanakan, maka Satuan Pendidikan ini dinyatakan:
                <div className="mt-3 space-y-3 ml-2">
                   <div className="flex items-start">
                      <span className="mr-3 font-sans font-bold">[{formData.kesimpulan.statusKelayakan === 'SANGAT SIAP DAN MEMENUHI SYARAT' ? '✓' : '  '}]</span> 
                      <span><span className="font-bold">SANGAT SIAP DAN MEMENUHI SYARAT</span><br/>(Direkomendasikan segera ditetapkan sebagai Penerima Bantuan Tahun 2026).</span>
                   </div>
                   <div className="flex items-start">
                      <span className="mr-3 font-sans font-bold">[{formData.kesimpulan.statusKelayakan === 'SIAP DENGAN CATATAN PENGKONDISIAN KHUSUS' ? '✓' : '  '}]</span> 
                      <span><span className="font-bold">SIAP DENGAN CATATAN PENGKONDISIAN KHUSUS</span><br/>(Dapat ditetapkan, asalkan sekolah segera menyelesaikan catatan perbaikan di atas dalam waktu yang ditentukan).</span>
                   </div>
                   <div className="flex items-start">
                      <span className="mr-3 font-sans font-bold">[{formData.kesimpulan.statusKelayakan === 'TIDAK SIAP / TIDAK MEMENUHI SYARAT' ? '✓' : '  '}]</span> 
                      <span><span className="font-bold">TIDAK SIAP / TIDAK MEMENUHI SYARAT</span><br/>(Tidak direkomendasikan karena terkendala sengketa lahan / infrastruktur rusak berat yang belum terakomodasi rehab / ketidaksesuaian data fatal).</span>
                   </div>
                </div>
                
                <div className="mt-4">
                   <span className="font-semibold">Catatan Khusus Kesimpulan:</span><br/>
                   <p className="mt-1">{formData.kesimpulan.catatanKelayakan || '....................................................................................................................................................................................'}</p>
                </div>
             </li>
           </ol>
        </div>

      </div>
      {/* END TAMPILAN CETAK PDF */}

      {/* Footer Copyright Web */}
      <footer className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 print:hidden relative z-10 pb-4">
        <p>Copyright &copy; 2026 by Meldi Chaniko</p>
        <p>Mail to: <a href="mailto:meldi.chaniko@gmail.com" className="text-[#067ac1] dark:text-[#f9a703] hover:underline transition">meldi.chaniko@gmail.com</a></p>
      </footer>
      
    </div>
  );
}