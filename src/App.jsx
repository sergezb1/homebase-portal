import React, { useState, useEffect, useRef } from 'react';
import ClientMenu from './ClientMenu';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query
} from 'firebase/firestore';
import { 
  Calendar, Users, FileText, CreditCard, Plus, Search, ChevronRight, 
  ChevronLeft, CheckCircle, Clock, Filter, DollarSign, Mail, Phone, 
  LayoutDashboard, Settings, MoreVertical, X, ShieldCheck, Eye, 
  UserCircle, Utensils, Image as ImageIcon, Trash2, ShoppingCart, 
  Upload, Building2, QrCode, PenTool, Eraser, Check, LogOut, Lock, Camera
} from 'lucide-react';

// --- FIREBASE CONFIGURATION ---
const getFirebaseConfig = () => {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
  };
};

const firebaseConfig = getFirebaseConfig();
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'homebase-delaware-events';

// --- BRANDING ---
const BrandingElement = ({ size = "md", theme = "dark" }) => {
  const iconColor = theme === "dark" ? "#0f172a" : "#ffffff";
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
        <Utensils className="text-white w-5 h-5" />
      </div>
      <div className="flex flex-col">
        <span className="font-black tracking-tighter leading-none text-slate-900">HOME BASE</span>
        <span className="text-[10px] font-bold tracking-widest opacity-60 text-slate-900 uppercase">Delaware</span>
      </div>
    </div>
  );
};

// --- LOGIN SCREEN ---
const LoginScreen = ({ onLogin }) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div className="bg-white rounded-[50px] shadow-2xl p-12 w-full max-w-md text-center border border-slate-100">
      <BrandingElement />
      <h2 className="text-xl font-black text-slate-900 mt-8 uppercase">Staff Authorization</h2>
      <button onClick={onLogin} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl mt-10 hover:scale-105 transition-all">Secure Entry</button>
    </div>
  </div>
);

// --- MENU CMS (WITH IMAGE SUPPORT) ---
const MenuCMS = ({ catalog, db, appId }) => {
  const [newItem, setNewItem] = useState({ name: '', price: '', image: '' });

  const handleSave = async () => {
    if (newItem.name && newItem.price) {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'catalog'), {
        ...newItem,
        price: parseFloat(newItem.price),
        category: 'Inventory',
        createdAt: new Date().toISOString()
      });
      setNewItem({ name: '', price: '', image: '' });
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
        <h2 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New Item to Public Menu
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-slate-900" placeholder="Item Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
          <input type="number" className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-slate-900" placeholder="Price ($)" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
          <input className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-slate-900" placeholder="Image URL (Unsplash/Imgur)" value={newItem.image} onChange={e => setNewItem({...newItem, image: e.target.value})} />
          <button onClick={handleSave} className="bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-colors">Save to Catalog</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {catalog.map(item => (
          <div key={item.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col group">
            <div className="h-40 bg-slate-100 relative">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300"><Camera className="w-8 h-8" /></div>
              )}
            </div>
            <div className="p-6 flex justify-between items-center bg-white">
              <div>
                <p className="font-black uppercase text-slate-900 text-sm">{item.name}</p>
                <p className="text-xs font-bold text-slate-400 mt-1">${item.price}</p>
              </div>
              <button onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'catalog', item.id))} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [user, setUser] = useState(null);
  const [isClientView, setIsClientView] = useState(window.location.pathname === '/menu');

  useEffect(() => {
    const handleLocationChange = () => setIsClientView(window.location.pathname === '/menu');
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // --- TRAFFIC CONTROLLER ---
  if (isClientView) {
    return <ClientMenu />;
  }

  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState([]);
  const [catalog, setCatalog] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubLeads = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'leads'), (snap) => {
      setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubCatalog = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'catalog'), (snap) => {
      setCatalog(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubLeads(); unsubCatalog(); };
  }, [user]);

  if (!user) return <LoginScreen onLogin={() => signInAnonymously(auth)} />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="p-10 border-b border-slate-50"><BrandingElement /></div>
        <nav className="flex-1 p-6 space-y-2 mt-4">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}><LayoutDashboard className="w-4 h-4" /> Dashboard</button>
          <button onClick={() => setActiveTab('cms')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'cms' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}><Utensils className="w-4 h-4" /> Menu CMS</button>
          <button onClick={() => setActiveTab('leads')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'leads' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}><Users className="w-4 h-4" /> Leads</button>
        </nav>
        <div className="p-6 border-t border-slate-50">
          <button onClick={() => signOut(auth)} className="w-full text-slate-400 font-black text-[10px] uppercase py-4 flex items-center gap-2 justify-center hover:text-red-500 transition-colors"><LogOut className="w-4 h-4" /> Logout</button>
        </div>
      </aside>

      <main className="flex-1 p-12 max-w-7xl mx-auto">
        <header className="mb-12 flex justify-between items-center">
            <h1 className="text-3xl font-black uppercase tracking-tighter">{activeTab}</h1>
            <div className="bg-slate-900 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Admin Control</div>
        </header>

        {activeTab === 'dashboard' && (
            <div className="grid grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leads</p><h3 className="text-4xl font-black mt-2">{leads.length}</h3></div>
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Catalog Items</p><h3 className="text-4xl font-black mt-2">{catalog.length}</h3></div>
            </div>
        )}

        {activeTab === 'cms' && <MenuCMS catalog={catalog} db={db} appId={appId} />}
        
        {activeTab === 'leads' && (
            <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50"><tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100"><th className="p-8">Name</th><th className="p-8">Status</th></tr></thead>
                    <tbody>{leads.map(l => (<tr key={l.id} className="border-b border-slate-50 last:border-0"><td className="p-8 font-black uppercase">{l.name}</td><td className="p-8"><span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase">{l.status}</span></td></tr>))}</tbody>
                </table>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;