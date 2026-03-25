import React, { useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { Utensils, ShieldCheck, Clock, CameraOff, ChevronRight, Info } from 'lucide-react';

// --- FIREBASE CONFIG (Must match your App.jsx) ---
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure the path matches your App.jsx exactly
    const path = collection(db, 'artifacts', 'homebase-delaware-events', 'public', 'data', 'catalog');
    
    const unsubscribe = onSnapshot(path, (snap) => {
      setCatalog(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Firestore error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl animate-bounce flex items-center justify-center mb-4">
            <Utensils className="text-white w-6 h-6" />
        </div>
        <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">Loading Menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900 pb-24">
      {/* --- HERO HEADER --- */}
      <header className="bg-white border-b border-slate-100 px-8 py-12 text-center sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-[1px] w-8 bg-slate-200" />
                <span className="text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase">Home Base Delaware</span>
                <div className="h-[1px] w-8 bg-slate-200" />
            </div>
            <h1 className="text-5xl font-black tracking-tighter uppercase text-slate-900 mb-2">Event Catalog</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-4">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Licensed</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> Professional</span>
            </p>
        </div>
      </header>

<main className="max-w-7xl mx-auto px-6 pt-12">
  {/* 1. This logic groups your items by category automatically */}
  {Object.entries(
    catalog.reduce((acc, item) => {
      // If an item has no category, it goes into "Other"
      const cat = item.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {})
  ).map(([category, items]) => (
    <div key={category} className="mb-24">
      
      {/* 2. Category Section Header */}
      <div className="flex items-center gap-6 mb-12">
        <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 whitespace-nowrap">
          {category}
        </h2>
        <div className="h-[1px] w-full bg-slate-200" />
      </div>

      {/* 3. The Responsive Grid for this specific category */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-[45px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full group hover:shadow-2xl transition-all duration-500">
            
            {/* Image container */}
            <div className="h-72 w-full bg-slate-50 relative overflow-hidden">
              {item.image && (
                <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={item.name} />
              )}
              <div className="absolute bottom-6 right-6 bg-slate-900 text-white px-5 py-2 rounded-2xl font-black text-xl shadow-xl">
                ${item.price}
              </div>
            </div>

            {/* Item Details */}
            <div className="p-10 flex flex-col flex-1 text-center items-center">
              <h3 className="font-black text-2xl uppercase tracking-tighter mb-4">{item.name}</h3>
              {item.description && (
                <div className="bg-slate-50/50 rounded-3xl p-5 mb-8 w-full border border-slate-50">
                   <p className="text-slate-500 text-sm font-medium leading-relaxed italic">"{item.description}"</p>
                </div>
              )}
              <button className="mt-auto w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 active:scale-95 transition-all">
                Select for Quote
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  ))}
</main>
    </div>
  );
};

export default ClientMenu;