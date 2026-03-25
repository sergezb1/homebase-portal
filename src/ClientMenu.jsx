import React, { useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { Utensils, ShieldCheck, Clock, CameraOff } from 'lucide-react';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const ClientMenu = () => {
  const [catalog, setCatalog] = useState([]);

  useEffect(() => {
    const path = collection(db, 'artifacts', 'homebase-delaware-events', 'public', 'data', 'catalog');
    return onSnapshot(path, (snap) => {
      setCatalog(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-slate-200 p-10 text-center sticky top-0 z-10 shadow-sm">
        <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900">HOME BASE</h1>
        <div className="flex items-center justify-center gap-4 mt-2">
            <span className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Event Catalog</span>
            <div className="h-1 w-1 bg-slate-300 rounded-full" />
            <span className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Delaware</span>
        </div>
      </header>

      {/* --- MAIN GRID --- */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8 mt-4">
        {catalog.map((item) => (
          <div key={item.id} className="group bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
            
            {/* --- IMAGE CONTAINER --- */}
            <div className="h-64 w-full bg-slate-100 relative overflow-hidden">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                  <CameraOff className="w-10 h-10 mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Image Coming Soon</span>
                </div>
              )}
              {/* Price Badge Overlay */}
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl">
                <p className="font-black text-xl text-slate-900">${item.price}</p>
              </div>
            </div>

            {/* --- CONTENT --- */}
            <div className="p-8 text-center">
              <h3 className="font-black text-xl uppercase tracking-tight text-slate-900 mb-6">{item.name}</h3>
              <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all">
                Select for Quote
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- FOOTER --- */}
      <footer className="max-w-xl mx-auto mt-12 text-center p-8">
          <p className="text-slate-400 text-xs font-bold leading-relaxed">
            All rentals and catering services are subject to availability.<br/>
            Home Base Delaware © 2026
          </p>
      </footer>
    </div>
  );
};

export default ClientMenu;