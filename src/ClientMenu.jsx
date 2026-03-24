import React, { useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { Utensils, ShieldCheck, Clock } from 'lucide-react';

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
    <div className="min-h-screen bg-[#F8FAFC] font-sans p-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900">HOME BASE</h1>
        <p className="text-xs font-bold tracking-[0.3em] text-slate-400 uppercase mt-2">Event Catalog</p>
      </header>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {catalog.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <h3 className="font-black text-lg uppercase text-slate-900">{item.name}</h3>
            <p className="font-black text-2xl text-blue-600 mt-2">${item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// THIS LINE IS THE FIX:
export default ClientMenu;