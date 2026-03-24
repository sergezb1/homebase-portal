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
  Upload, Building2, QrCode, PenTool, Eraser, Check, LogOut, Lock
} from 'lucide-react';

// --- FIREBASE CONFIGURATION ---
// This handles both the local Vite environment and the preview environment safely
const getFirebaseConfig = () => {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    return JSON.parse(__firebase_config);
  }
  
  // Fallback to environment variables for your local Vite deployment
  return {
    apiKey: (import.meta.env && import.meta.env.VITE_FIREBASE_API_KEY) || "",
    authDomain: (import.meta.env && import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) || "",
    projectId: (import.meta.env && import.meta.env.VITE_FIREBASE_PROJECT_ID) || "",
    storageBucket: (import.meta.env && import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) || "",
    messagingSenderId: (import.meta.env && import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || "",
    appId: (import.meta.env && import.meta.env.VITE_FIREBASE_APP_ID) || ""
  };
};

const firebaseConfig = getFirebaseConfig();
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'homebase-delaware-events';

// --- BRANDING CONFIG ---
const BRAND_CONFIG = {
  name: 'HOME BASE', 
  fullName: 'HOME BASE DELAWARE',
  primaryColor: 'bg-slate-900',
  accentColor: 'text-slate-900',
  buttonColor: 'bg-slate-900',
  zelleId: 'payments@homebasedelaware.com'
};

// --- LOGO COMPONENT ---
const BrandingElement = ({ size = "md", theme = "dark" }) => {
  const isLarge = size === "lg";
  const iconColor = theme === "dark" ? "#0f172a" : "#ffffff";
  const textColor = theme === "dark" ? "text-slate-900" : "text-white";

  return (
    <div className="flex items-center gap-4">
      <div className={`flex items-center justify-center ${isLarge ? 'w-24 h-24' : 'w-12 h-12'}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M50 12 L92 42 L92 48 L82 48 L82 42 L50 20 L18 42 L18 48 L8 48 L8 42 Z" fill={iconColor} />
          <path d="M31 52 L31 75 L71 75 L71 62" fill="none" stroke={iconColor} strokeWidth="3" strokeLinecap="square" />
          <path d="M27 75 L73 75" fill="none" stroke={iconColor} strokeWidth="3" />
          <text x="50" y="60" fontSize="18" fontWeight="bold" fill={iconColor} textAnchor="middle" style={{ fontFamily: 'Brush Script MT, cursive', transform: 'rotate(-5deg)' }}>Home Base</text>
        </svg>
      </div>
      <div className="flex flex-col">
        <span className={`font-black tracking-tighter leading-none ${isLarge ? "text-2xl" : "text-lg"} ${textColor}`}>HOME BASE</span>
        <span className={`text-[10px] font-bold tracking-widest opacity-60 ${textColor}`}>DELAWARE</span>
      </div>
    </div>
  );
};

// --- SIGNATURE PAD COMPONENT ---
const SignaturePad = ({ onSign }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';
  }, []);

  const getPointerPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e) => {
    const { x, y } = getPointerPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getPointerPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSigned(true);
    onSign(true);
  };

  const stopDrawing = () => setIsDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
    onSign(false);
  };

  return (
    <div className="space-y-3">
      <div className="relative bg-white border-2 border-slate-200 rounded-xl overflow-hidden cursor-crosshair shadow-inner">
        <canvas ref={canvasRef} width={600} height={150} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseOut={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className="w-full h-[150px] touch-none" />
        {!hasSigned && <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20"><PenTool className="w-8 h-8 mr-2" /><span className="font-bold uppercase tracking-widest text-sm text-slate-900">Sign Here</span></div>}
        <button onClick={clear} className="absolute bottom-2 right-2 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors"><Eraser className="w-4 h-4" /></button>
      </div>
    </div>
  );
};

// --- LOGIN SCREEN ---
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(); 
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-[50px] shadow-2xl p-12 w-full max-w-md border border-slate-100 text-center">
        <div className="flex justify-center mb-8"><BrandingElement size="lg" /></div>
        <h2 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Staff Authorization</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10">Access Management Control</p>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <input type="email" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 outline-none transition-all font-bold" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 outline-none transition-all font-bold" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl mt-6 hover:scale-[1.02] active:scale-[0.98] transition-all">Secure Entry</button>
        </form>
      </div>
    </div>
  );
};

// --- NEW LEAD MODAL ---
const NewLeadModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: '', event: '', date: '', value: '', email: '', phone: '' });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
          <h2 className="text-2xl font-black uppercase tracking-tighter">New Lead Inquiry</h2>
          <button onClick={onClose}><X className="w-6 h-6 text-slate-400" /></button>
        </div>
        <div className="p-8 space-y-4">
          <input className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none" placeholder="Client Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <input className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none" placeholder="Event Type" value={formData.event} onChange={(e) => setFormData({...formData, event: e.target.value})} />
            <input type="date" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
          </div>
          <input className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <input type="number" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none" placeholder="Est. Value ($)" value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} />
        </div>
        <div className="p-8 pt-0">
          <button onClick={() => onSave(formData)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs">Save Inquiry</button>
        </div>
      </div>
    </div>
  );
};

// --- EVENT CALENDAR ---
const EventCalendar = ({ leads, onSelectLead }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 5, 1));
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDay = (y, m) => new Date(y, m, 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();

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
      <div className="p-8 border-b border-slate-100 flex justify-between bg-slate-50/30">
        <h2 className="text-3xl font-black text-slate-900 uppercase">{monthName} <span className="text-slate-300">{y}</span></h2>
        <div className="flex gap-2">
          <button onClick={() => setCurrentDate(new Date(y, m - 1, 1))} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => setCurrentDate(new Date(y, m + 1, 1))} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 auto-rows-[120px]">
        {days.map((d, i) => (
          <div key={i} className={`p-4 border-r border-b border-slate-100 ${!d ? 'bg-slate-50/50' : 'bg-white'}`}>
            {d && <><span className="text-sm font-black text-slate-900 opacity-30">{d}</span>
            <div className="mt-2 space-y-1">
              {getEvents(d).map(e => (
                <div key={e.id} onClick={() => onSelectLead(e)} className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase truncate cursor-pointer ${e.status === 'Booked' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>{e.name}</div>
              ))}
            </div></>}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- DASHBOARD ---
const Dashboard = ({ leads }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 border-b-8 border-b-slate-900 text-center">
      <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Active Inquiries</span>
      <h3 className="text-4xl font-black text-slate-900 mt-2">{leads.filter(l => l.status === 'New').length}</h3>
    </div>
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 border-b-8 border-b-slate-900 text-center">
      <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Booked Events</span>
      <h3 className="text-4xl font-black text-slate-900 mt-2">{leads.filter(l => l.status === 'Booked').length}</h3>
    </div>
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 border-b-8 border-b-slate-900 text-center">
      <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Projected Revenue</span>
      <h3 className="text-4xl font-black text-slate-900 mt-2">${leads.reduce((acc,l) => acc + (parseFloat(l.value) || 0), 0).toLocaleString()}</h3>
    </div>
  </div>
);

// --- MENU CMS ---
const MenuCMS = ({ catalog, db, appId }) => (
  <div className="space-y-6">
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
      <h2 className="text-lg font-black uppercase mb-6 flex items-center gap-3"><Utensils className="w-5 h-5" /> Add Menu Item</h2>
      <div className="grid grid-cols-4 gap-4">
        <input id="new-name" placeholder="Item Name" className="p-4 bg-slate-50 border rounded-2xl font-bold outline-none" />
        <input id="new-price" type="number" placeholder="Price" className="p-4 bg-slate-50 border rounded-2xl font-bold outline-none" />
        <button onClick={async () => {
          const n = document.getElementById('new-name').value;
          const p = document.getElementById('new-price').value;
          if(n && p) {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'catalog'), { name: n, price: parseFloat(p), category: 'Food' });
            document.getElementById('new-name').value = '';
            document.getElementById('new-price').value = '';
          }
        }} className="bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Save Item</button>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-6">
      {catalog.map(item => (
        <div key={item.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex justify-between items-center transition-all hover:shadow-lg">
          <div><p className="font-black uppercase tracking-tight">{item.name}</p><p className="text-xs font-bold text-slate-400">${item.price}</p></div>
          <button onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'catalog', item.id))} className="p-2 text-red-400 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  </div>
);

// --- MAIN APP COMPONENT ---
const App = () => {
  const [user, setUser] = useState(null);

  // --- TRAFFIC CONTROLLER ---
  if (window.location.pathname === '/menu') {
    return <ClientMenu />;
  }

  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      // Use custom token if provided, otherwise anonymous
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const leadsPath = collection(db, 'artifacts', appId, 'public', 'data', 'leads');
    const catalogPath = collection(db, 'artifacts', appId, 'public', 'data', 'catalog');

    const unsubLeads = onSnapshot(leadsPath, (snap) => {
      setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error("Firestore leads error:", err));

    const unsubCatalog = onSnapshot(catalogPath, (snap) => {
      setCatalog(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error("Firestore catalog error:", err));

    return () => { unsubLeads(); unsubCatalog(); };
  }, [user]);

  const handleCreateLead = async (formData) => {
    const leadsPath = collection(db, 'artifacts', appId, 'public', 'data', 'leads');
    await addDoc(leadsPath, { ...formData, status: 'New', createdAt: new Date().toISOString() });
    setIsNewLeadModalOpen(false);
    setActiveTab('leads');
  };

  if (!user) return <LoginScreen onLogin={() => signInAnonymously(auth)} />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shadow-sm z-30">
        <div className="p-10 border-b border-slate-50"><BrandingElement /></div>
        <nav className="flex-1 p-6 space-y-3 mt-8">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-5 px-6 py-4.5 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-400 hover:bg-slate-50'}`}><LayoutDashboard className="w-5 h-5" /> Operations</button>
          <button onClick={() => setActiveTab('leads')} className={`w-full flex items-center gap-5 px-6 py-4.5 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'leads' ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-400 hover:bg-slate-50'}`}><Users className="w-5 h-5" /> Sales CRM</button>
          <button onClick={() => setActiveTab('cms')} className={`w-full flex items-center gap-5 px-6 py-4.5 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'cms' ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-400 hover:bg-slate-50'}`}><Utensils className="w-5 h-5" /> Menu Catalog</button>
          <button onClick={() => setActiveTab('calendar')} className={`w-full flex items-center gap-5 px-6 py-4.5 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'calendar' ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-400 hover:bg-slate-50'}`}><Calendar className="w-5 h-5" /> Event Schedule</button>
        </nav>
        <div className="p-6 border-t border-slate-50">
           <button onClick={() => signOut(auth)} className="w-full flex items-center gap-3 px-6 py-3 text-slate-400 hover:text-red-500 font-black text-[10px] uppercase tracking-widest transition-colors"><LogOut className="w-4 h-4" /> Log Out</button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden p-12 max-w-[1400px] mx-auto">
        <header className="flex justify-between items-center mb-14">
          <div className="flex items-center gap-4 text-slate-200 font-black text-[10px] uppercase tracking-[0.3em]"><span className="text-slate-400">{activeTab}</span><ChevronRight className="w-4 h-4" /><span>Live Ops</span></div>
          <div className="flex gap-4">
            <button onClick={() => setIsNewLeadModalOpen(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-transform flex items-center gap-3"><Plus className="w-5 h-5" /> New Lead</button>
          </div>
        </header>

        {activeTab === 'dashboard' && <Dashboard leads={leads} />}
        
        {activeTab === 'leads' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50"><tr><th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Client</th><th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Status</th><th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Value</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedLead(l)}>
                    <td className="px-8 py-5 font-black uppercase text-lg">{l.name}</td>
                    <td className="px-8 py-5"><span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-600">{l.status}</span></td>
                    <td className="px-8 py-5 text-right font-black text-2xl">${(parseFloat(l.value) || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'cms' && <MenuCMS catalog={catalog} db={db} appId={appId} />}
        
        {activeTab === 'calendar' && (
          <EventCalendar leads={leads} onSelectLead={(l) => { setSelectedLead(l); setActiveTab('leads'); }} />
        )}
      </main>

      <NewLeadModal isOpen={isNewLeadModalOpen} onClose={() => setIsNewLeadModalOpen(false)} onSave={handleCreateLead} />
    </div>
  );
};

export default App;