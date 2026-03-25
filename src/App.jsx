import React, { useState, useEffect, useRef } from 'react';
import ClientMenu from './ClientMenu';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, query } from 'firebase/firestore';
import { 
  Calendar as CalendarIcon, Users, Utensils, LayoutDashboard, 
  Plus, Trash2, LogOut, Camera, Edit2, Check, X, ChevronLeft, ChevronRight,
  FileText, DollarSign, Image as ImageIcon
} from 'lucide-react';

// --- FIREBASE CONFIG ---
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'homebase-delaware-events';

// --- CALENDAR COMPONENT ---
const EventCalendar = ({ leads }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDay = (y, m) => new Date(y, m, 1).getDay();
  
  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const days = [];
  for (let i = 0; i < firstDay(y, m); i++) days.push(null);
  for (let i = 1; i <= daysInMonth(y, m); i++) days.push(i);

  const getEvents = (d) => {
    if (!d) return [];
    const ds = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return leads.filter(l => l.date === ds);
  };

  return (
    <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
        <h2 className="text-2xl font-black uppercase tracking-tighter">{monthName} <span className="text-slate-300">{y}</span></h2>
        <div className="flex gap-2">
          <button onClick={() => setCurrentDate(new Date(y, m - 1, 1))} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"><ChevronLeft className="w-5 h-5"/></button>
          <button onClick={() => setCurrentDate(new Date(y, m + 1, 1))} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"><ChevronRight className="w-5 h-5"/></button>
        </div>
      </div>
      <div className="grid grid-cols-7 auto-rows-[120px]">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="p-4 text-[10px] font-black uppercase text-slate-400 text-center border-b border-slate-100 tracking-widest">{d}</div>
        ))}
        {days.map((d, i) => (
          <div key={i} className={`p-3 border-r border-b border-slate-50 transition-colors hover:bg-slate-50/50 ${!d ? 'bg-slate-50/30' : ''}`}>
            {d && <span className="text-xs font-black text-slate-300">{d}</span>}
            <div className="mt-2 space-y-1">
              {getEvents(d).map(e => (
                <div key={e.id} className="px-2 py-1.5 rounded-lg bg-slate-900 text-white text-[9px] font-black uppercase truncate shadow-md border border-slate-800">{e.name}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MENU CMS WITH EDIT & DESCRIPTIONS ---
const MenuCMS = ({ catalog, db, appId }) => {
  const [newItem, setNewItem] = useState({ name: '', price: '', image: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleSave = async () => {
    if (newItem.name && newItem.price) {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'catalog'), {
        ...newItem, 
        price: parseFloat(newItem.price), 
        category: 'Inventory',
        createdAt: new Date().toISOString()
      });
      setNewItem({ name: '', price: '', image: '', description: '' });
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const saveEdit = async (id) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'catalog', id), {
        ...editForm,
        price: parseFloat(editForm.price)
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-10">
      <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-slate-400 flex items-center gap-3"><Plus className="w-4 h-4 text-slate-900"/> New Catalog Entry</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input className="p-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-slate-900 transition-all" placeholder="Item Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
          <input className="p-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-slate-900 transition-all" placeholder="Price ($)" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
          <textarea className="p-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-slate-900 transition-all md:col-span-2 min-h-[100px]" placeholder="Detailed Description (e.g. Dimensions, serving size, specific details...)" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
          <input className="p-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-slate-900 transition-all md:col-span-2" placeholder="Image URL (Paste .jpg or .png link here)" value={newItem.image} onChange={e => setNewItem({...newItem, image: e.target.value})} />
          <button onClick={handleSave} className="bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs py-5 md:col-span-2 shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all">Add to Public Menu</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {catalog.map(item => (
          <div key={item.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col group transition-all hover:shadow-2xl">
            {editingId === item.id ? (
              <div className="p-8 space-y-4">
                <input className="w-full p-3 border-2 border-slate-100 rounded-xl text-sm font-bold" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                <input className="w-full p-3 border-2 border-slate-100 rounded-xl text-sm font-bold" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} />
                <textarea className="w-full p-3 border-2 border-slate-100 rounded-xl text-sm font-bold min-h-[80px]" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                <input className="w-full p-3 border-2 border-slate-100 rounded-xl text-sm font-bold" value={editForm.image} onChange={e => setEditForm({...editForm, image: e.target.value})} />
                <div className="flex gap-3">
                  <button onClick={() => saveEdit(item.id)} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">Update</button>
                  <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="h-48 bg-slate-100 relative overflow-hidden">
                  {item.image ? <img src={item.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-10 h-10"/></div>}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl font-black text-slate-900 shadow-xl border border-white">${item.price}</div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="font-black uppercase text-lg tracking-tight mb-2">{item.name}</h3>
                  <p className="text-slate-400 text-xs font-bold leading-relaxed mb-6 flex-1">{item.description || "No description provided."}</p>
                  <div className="flex gap-2 pt-4 border-t border-slate-50">
                    <button onClick={() => startEdit(item)} className="flex-1 flex items-center justify-center gap-2 p-3 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors font-black text-[10px] uppercase tracking-widest"><Edit2 className="w-3 h-3"/> Edit</button>
                    <button onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'catalog', item.id))} className="flex-1 flex items-center justify-center gap-2 p-3 text-red-400 hover:bg-red-50 rounded-xl transition-colors font-black text-[10px] uppercase tracking-widest"><Trash2 className="w-3 h-3"/> Delete</button>
                  </div>
                </div>
              </>
            )}
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState([]);
  const [catalog, setCatalog] = useState([]);

  useEffect(() => {
    const handleLocationChange = () => setIsClientView(window.location.pathname === '/menu');
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubLeads = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'leads'), snap => setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubCatalog = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'catalog'), snap => setCatalog(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubLeads(); unsubCatalog(); };
  }, [user]);

  if (isClientView) return <ClientMenu />;
  if (!user) return <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6"><div className="bg-white p-12 rounded-[50px] shadow-2xl text-center border border-slate-100 max-w-sm w-full"><div className="w-16 h-16 bg-slate-900 rounded-[20px] mx-auto flex items-center justify-center mb-8"><Utensils className="text-white w-8 h-8"/></div><h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-10">Home Base Auth</h2><button onClick={() => signInAnonymously(auth)} className="w-full bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-all">Staff Login</button></div></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="p-10 border-b flex items-center gap-4">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center"><Utensils className="text-white w-4 h-4"/></div>
            <span className="font-black tracking-tighter text-slate-900 uppercase">Home Base</span>
        </div>
        <nav className="flex-1 p-6 space-y-3 mt-6">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-5 px-6 py-4.5 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}><LayoutDashboard className="w-5 h-5"/> Ops Central</button>
          <button onClick={() => setActiveTab('calendar')} className={`w-full flex items-center gap-5 px-6 py-4.5 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'calendar' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}><CalendarIcon className="w-5 h-5"/> Schedule</button>
          <button onClick={() => setActiveTab('cms')} className={`w-full flex items-center gap-5 px-6 py-4.5 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'cms' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}><Utensils className="w-5 h-5"/> Inventory</button>
        </nav>
        <button onClick={() => signOut(auth)} className="p-10 text-[10px] font-black uppercase text-slate-400 hover:text-red-500 flex items-center gap-3 transition-colors"><LogOut className="w-4 h-4"/> Sign Out</button>
      </aside>

      <main className="flex-1 p-16 max-w-7xl mx-auto">
        <header className="mb-16 flex justify-between items-center">
            <div className="flex items-center gap-3 text-slate-300 font-black text-[10px] uppercase tracking-widest"><span>{activeTab}</span><ChevronRight className="w-4 h-4"/><span>Live System</span></div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-2 gap-10">
            <div className="bg-white p-12 rounded-[50px] shadow-sm border border-slate-100 border-b-[10px] border-b-slate-900"><p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Active Leads</p><h3 className="text-6xl font-black mt-4 tracking-tighter text-slate-900">{leads.length}</h3></div>
            <div className="bg-white p-12 rounded-[50px] shadow-sm border border-slate-100 border-b-[10px] border-b-slate-400"><p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Public Items</p><h3 className="text-6xl font-black mt-4 tracking-tighter text-slate-900">{catalog.length}</h3></div>
          </div>
        )}
        {activeTab === 'calendar' && <EventCalendar leads={leads} />}
        {activeTab === 'cms' && <MenuCMS catalog={catalog} db={db} appId={appId} />}
      </main>
    </div>
  );
};

export default App;