import React, { useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { Utensils, CameraOff, ChevronRight } from 'lucide-react';

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
    const path = collection(db, 'artifacts', 'homebase-delaware-events', 'public', 'data', 'catalog');
    return onSnapshot(path, (snap) => {
      setCatalog(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-20 text-center font-black uppercase tracking-widest text-slate-300">Loading...</div>;

  // Grouping logic (Safe Version)
  const categories = [...new Set(catalog.map(item => item.category || 'Other'))];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <header className="bg-white p-12 text-center border-b border-slate-100 sticky top-0 z-50">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Event Catalog</h1>
        <p className="text-[10px] font-bold tracking-[0.4em] text-slate-400 uppercase mt-2">Home Base Delaware</p>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        {categories.map(categoryName => (
          <section key={categoryName} className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-black uppercase text-slate-900 whitespace-nowrap">{categoryName}</h2>
              <div className="h-px bg-slate-200 w-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {catalog.filter(i => (i.category || 'Other') === categoryName).map(item => (
                <div key={item.id} className="bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm flex flex-col group">
                  <div className="h-60 bg-slate-100 relative">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300"><CameraOff /></div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 px-4 py-2 rounded-2xl font-black shadow-lg border border-white text-slate-900">
                      ${item.price}
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-1 text-center">
                    <h3 className="font-black text-xl uppercase mb-3">{item.name}</h3>
                    {item.description && (
                      <p className="text-slate-400 text-sm font-medium italic mb-6 leading-relaxed">"{item.description}"</p>
                    )}
                    <button className="mt-auto w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">
                      Add to Selection
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};

export default ClientMenu;