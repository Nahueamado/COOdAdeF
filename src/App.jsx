import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import {
  // --- ORIGINALES (Recuperados de GitHub) ---
  Car, CheckCircle, XCircle, Calendar, LogOut, Users, ClipboardList,
  MessageCircle, Shield, Menu, X, User, Plus, Lock, Unlock, CalendarDays,
  Clock, AlertTriangle, Save, CreditCard, Phone, UserCircle, Edit, Mail,
  Fingerprint, Copy, Globe, Settings, Trash, Pencil, History, FileText,
  ChevronRight, LayoutDashboard, Award, Activity, Eye, ExternalLink,
  Hammer, Construction, UserX, ThumbsDown, ThumbsUp, RefreshCw, UserPlus,
  RotateCcw, ShieldAlert, UserCheck, PauseCircle, Info,

  // --- NUEVOS (Agregados para la v1.8) ---
  Briefcase, Download, PlusCircle, Trash2
} from 'lucide-react';

// --- CONFIGURACIÓN CORREGIDA PARA TU PC ---
const YOUR_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDAiYwr1FT_-PDPxOijRycntoWz2CrAeCo",
  authDomain: "coodadef-950f1.firebaseapp.com",
  projectId: "coodadef-950f1",
  storageBucket: "coodadef-950f1.firebasestorage.app",
  messagingSenderId: "593578743585",
  appId: "1:593578743585:web:6957b4e56f858879309060",
  measurementId: "G-7TMEHY2KHW"
};

// Inicialización
const app = initializeApp(YOUR_FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'arbitros-app-local'; 
const USE_YOUR_OWN_DB = true;

// ==========================================
// 2. HELPERS (Funciones de utilidad)
// ==========================================

const getCollectionRef = (collectionName) => {
    if (USE_YOUR_OWN_DB) {
        return collection(db, collectionName); 
    } else {
        if (collectionName === 'users') return collection(db, 'artifacts', appId, 'public', 'data', 'user_directory');
        if (collectionName === 'settings') return collection(db, 'artifacts', appId, 'public', 'data', 'settings');
        return collection(db, 'artifacts', appId, 'public', 'data', collectionName);
    }
};

const getUserDocRef = (userId) => {
    if (USE_YOUR_OWN_DB) {
        return doc(db, 'users', userId);
    } else {
        return doc(db, 'artifacts', appId, 'users', userId, 'profile', 'info');
    }
};

const getSettingsDocRef = () => {
    if (USE_YOUR_OWN_DB) {
        return doc(db, 'settings', 'appConfig');
    } else {
        return doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'appConfig');
    }
};

const formatDate = (dateString) => {
    if(!dateString) return '-';
    try {
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const date = new Date(parts[0], parts[1] - 1, parts[2]);
            return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
        }
    } catch(e) { return dateString; }
    return dateString;
};

const formatDateTime = (isoString) => {
    if(!isoString) return '-';
    try {
        const date = new Date(isoString);
        return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch(e) { return isoString; }
};

const getDaysInRange = (startDate, endDate) => {
    if (!startDate || !endDate) return [];
    const dates = [];
    try {
        const startParts = startDate.split('-');
        const endParts = endDate.split('-');
        const currDate = new Date(startParts[0], startParts[1] - 1, startParts[2]);
        const lastDate = new Date(endParts[0], endParts[1] - 1, endParts[2]);

        while (currDate <= lastDate) {
            const year = currDate.getFullYear();
            const month = String(currDate.getMonth() + 1).padStart(2, '0');
            const day = String(currDate.getDate()).padStart(2, '0');
            const isoDate = `${year}-${month}-${day}`;
            const dayName = currDate.toLocaleDateString('es-AR', { weekday: 'long' });
            const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
            
            dates.push({
                date: isoDate,
                label: `${capitalizedDay} ${currDate.getDate()}`,
                id: isoDate 
            });
            currDate.setDate(currDate.getDate() + 1);
        }
    } catch (e) { console.error(e); }
    return dates;
};

const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Nunca';
    const now = new Date();
    const date = timestamp.toDate();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return '🟢 En línea ahora';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} hs`;
    if (diffInSeconds < 172800) return 'Ayer';
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};
// ==========================================
// 3. COMPONENTES VISUALES SIMPLES
// ==========================================

const RefereeLogo = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="90" rx="30" ry="5" fill="black" fillOpacity="0.1" />
    <rect x="25" y="15" width="40" height="55" rx="3" transform="rotate(-15 45 42.5)" fill="#EAB308" stroke="white" strokeWidth="2" />
    <rect x="45" y="15" width="40" height="55" rx="3" transform="rotate(10 65 42.5)" fill="#EF4444" stroke="white" strokeWidth="2" />
    <g transform="translate(15, 45) rotate(-10)">
        <path d="M10 20 C10 8.95 18.95 0 30 0 H55 V25 H30 C24.5 25 20 20.5 20 15" fill="#4B5563" />
        <circle cx="30" cy="12.5" r="12.5" fill="#4B5563" />
        <rect x="52" y="5" width="18" height="15" rx="2" fill="#4B5563" />
        <rect x="65" y="5" width="5" height="15" rx="1" fill="#374151" />
        <circle cx="30" cy="12.5" r="5" fill="#6B7280" fillOpacity="0.5" />
    </g>
  </svg>
);

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
  const baseStyle = "w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  const variants = {
    primary: "bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    outline: "border-2 border-gray-200 text-gray-600 hover:border-gray-300",
    success: "bg-green-600 text-white shadow-lg shadow-green-500/30 hover:bg-green-700"
  };
  return <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} disabled={disabled}>{children}</button>;
};

const Card = ({ children, className = '' }) => <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 ${className}`}>{children}</div>;

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 my-8 relative">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl sticky top-0 z-10 bg-white">
                    <h3 className="font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
                </div>
                <div className="p-4 max-h-[80vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

const MaintenanceScreen = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-in fade-in zoom-in duration-500">
            <div className="bg-yellow-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"><Construction className="w-12 h-12 text-yellow-600 animate-pulse" /></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Estamos mejorando la plataforma</h1>
            <p className="text-gray-500 mb-6">El sistema se encuentra temporalmente en mantenimiento.</p>
            <div className="inline-block bg-gray-100 px-4 py-2 rounded-full text-sm font-semibold text-gray-600">Volveremos en breve ⏳</div>
        </div>
        <footer className="mt-12 text-center text-xs text-gray-400">Desarrollado por Nahuel Amado - Noxyx Devs | App v1.7</footer>
    </div>
);

const PendingApprovalScreen = ({ onLogout }) => (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-in fade-in zoom-in duration-500">
            <div className="bg-orange-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"><ShieldAlert className="w-12 h-12 text-orange-600" /></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Cuenta Pendiente</h1>
            <p className="text-gray-500 mb-6">Tu registro ha sido exitoso, pero tu cuenta debe ser <b>aprobada por un administrador</b>.</p>
            <button onClick={onLogout} className="w-full py-3 px-4 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"><LogOut className="w-4 h-4"/> Cerrar Sesión</button>
        </div>
        <footer className="mt-12 text-center text-xs text-gray-400">Desarrollado por Nahuel Amado - Noxyx Devs | App v1.7</footer>
    </div>
);

// ==========================================
// 4. CONTEXTO
// ==========================================

const AuthContext = createContext();
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appName, setAppName] = useState('Árbitros App'); 
  const [googleAuthEnabled, setGoogleAuthEnabled] = useState(false); 
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
      const settingsRef = getSettingsDocRef();
      const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
          if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.appName) setAppName(data.appName);
              setGoogleAuthEnabled(data.googleAuthEnabled === true);
              setMaintenanceMode(data.maintenanceMode === true);
          }
      }, (error) => console.warn("Esperando configuración...", error.message));
      return () => unsubSettings();
  }, []);

  useEffect(() => {
    // Escuchamos el estado de autenticación de Firebase
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // 1. Usuario detectado: Guardamos la sesión básica
        setUser(currentUser);
        
        // 2. Intentamos leer sus datos extra de la base de datos
        try {
          // Usamos referencia directa a la colección real
          const userDocRef = doc(db, 'user_directory', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            // Si no tiene datos (usuario nuevo), usamos datos básicos
            setUserData({ 
              displayName: currentUser.displayName || 'Usuario', 
              email: currentUser.email,
              role: 'user' 
            });
          }
        } catch (error) {
          console.error("⚠️ Error leyendo datos (pero te dejo entrar):", error);
          // Modo seguro: si falla la DB, entras con datos básicos
          setUserData({ 
             displayName: currentUser.displayName || 'Usuario (Modo Seguro)', 
             role: 'user' 
          });
        }
      } else {
        // 3. No hay usuario (Cerró sesión)
        setUser(null);
        setUserData(null);
      }

      // 4. ¡LO MÁS IMPORTANTE! Quitamos el "Cargando" pase lo que pase
      setLoading(false);
    });

    // Limpieza al desmontar
    return () => unsubscribe();
  }, []);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout, appName, googleAuthEnabled, maintenanceMode }}>
      {children}
    </AuthContext.Provider>
  );
};
const useAuth = () => useContext(AuthContext);

// ==========================================
// 5. MODALES Y FORMULARIOS (DEFINICIÓN PREVIA)
// ==========================================

const CreateUserModal = ({ onClose }) => {
    const [formData, setFormData] = useState({ displayName: '', email: '', role: 'user', cbu: '' });
    const [loading, setLoading] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const tempUid = 'manual_' + Math.random().toString(36).substr(2, 9);
            const newUser = {
                uid: tempUid,
                displayName: formData.displayName,
                email: formData.email,
                role: formData.role,
                cbu: formData.cbu,
                refereeStatus: 'Alumno',
                isApproved: true, 
                createdAt: serverTimestamp()
            };
            let dirRef = USE_YOUR_OWN_DB ? doc(db, 'user_directory', tempUid) : doc(db, 'artifacts', appId, 'public', 'data', 'user_directory', tempUid);
            await setDoc(dirRef, newUser);
            const userRef = getUserDocRef(tempUid);
            await setDoc(userRef, newUser);
            alert("✅ Usuario creado exitosamente.");
            onClose();
        } catch (error) { alert("Error al crear usuario."); } finally { setLoading(false); }
    };
    return (
        <Modal isOpen={true} onClose={onClose} title="Alta Manual">
            <form onSubmit={handleCreate} className="space-y-4">
                <input required type="text" placeholder="Nombre" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} className="w-full p-2 border rounded"/>
                <input required type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded"/>
                <input type="text" placeholder="Alias/CBU" value={formData.cbu} onChange={e => setFormData({...formData, cbu: e.target.value})} className="w-full p-2 border rounded"/>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-2 border rounded bg-white"><option value="user">Árbitro</option><option value="admin">Administrador</option></select>
                <Button type="submit" disabled={loading}>Crear</Button>
            </form>
        </Modal>
    );
};

const ManualConfirmModal = ({ user, event, onClose, existingConfirmation }) => {
    const [availability, setAvailability] = useState(existingConfirmation?.availability || {});
    const [hasCar, setHasCar] = useState(existingConfirmation?.hasCar || false);
    const [notes, setNotes] = useState(existingConfirmation?.notes || '');
    const [days, setDays] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (event) setDays(getDaysInRange(event.dateStart, event.dateEnd));
    }, [event]);

    const toggleDay = (dayId) => setAvailability(prev => ({ ...prev, [dayId]: !prev[dayId] }));

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const docId = `${user.uid}_${event.id}`;
            let confirmRef = USE_YOUR_OWN_DB ? doc(db, 'confirmations', docId) : doc(db, 'artifacts', appId, 'public', 'data', 'confirmations', docId);
            const hasSelectedDays = Object.values(availability).some(val => val === true);
            const status = hasSelectedDays ? 'confirmed' : 'declined';
            const dataToSave = {
                userId: user.uid, userName: user.displayName, userPhone: user.phone || '', weekend: event.id, eventTitle: event.title,
                timestamp: serverTimestamp(), status, availability, hasCar, notes
            };
            await setDoc(confirmRef, dataToSave);
            onClose();
        } catch (error) { alert("Error al guardar."); } finally { setLoading(false); }
    };
    return (
        <Modal isOpen={true} onClose={onClose} title={`Gestionar: ${user.displayName}`}>
            <form onSubmit={handleSave} className="space-y-4">
                <div className="bg-gray-50 p-2 rounded text-sm">Evento: <b>{event.title}</b></div>
                <div className="grid grid-cols-2 gap-2">{days.map(d => (<label key={d.id} className={`flex items-center gap-2 p-2 border rounded cursor-pointer ${availability[d.id] ? 'bg-green-50 border-green-200' : 'bg-white'}`}><input type="checkbox" checked={!!availability[d.id]} onChange={() => toggleDay(d.id)} className="w-4 h-4"/><span>{d.label}</span></label>))}</div>
                {!Object.values(availability).some(val => val) && (<p className="text-xs text-red-500 font-medium">Si no marcas ningún día, el usuario pasará a "No Disponibles".</p>)}
                <div className="flex justify-between items-center border p-2 rounded"><span className="text-sm">Auto?</span><button type="button" onClick={() => setHasCar(!hasCar)} className={`w-10 h-6 rounded-full relative ${hasCar ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${hasCar ? 'left-5' : 'left-1'}`}/></button></div>
                <input type="text" placeholder="Notas..." value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 border rounded"/>
                <Button type="submit" disabled={loading}>Guardar</Button>
            </form>
        </Modal>
    );
};

const UserDetailModal = ({ userId, onClose, currentAdminId }) => {
    const [fetchedUser, setFetchedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({});
    
    useEffect(() => {
        if (!userId) return;
        const fetchUser = async () => {
            try {
                const docSnap = await getDoc(getUserDocRef(userId));
                if (docSnap.exists()) { const data = { uid: docSnap.id, ...docSnap.data() }; setFetchedUser(data); setFormData(data); }
                else { alert("Usuario no encontrado"); onClose(); }
            } catch (e) { alert("Error cargando usuario"); } finally { setLoading(false); }
        };
        fetchUser();
    }, [userId]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (userId === currentAdminId && formData.role !== 'admin') { alert("No puedes quitarte admin a ti mismo"); setSaving(false); return; }
            const updates = {
                displayName: formData.displayName, phone: formData.phone, role: formData.role, defaultHasCar: formData.defaultHasCar, cbu: formData.cbu,
                refereeStatus: formData.refereeStatus, physicalTestPassed: formData.physicalTestPassed, maxCategory: formData.maxCategory, isApproved: formData.isApproved, isAbsent: formData.isAbsent, updatedAt: serverTimestamp()
            };
            await updateDoc(getUserDocRef(userId), updates);
            let dirRef = doc(db, 'user_directory', userId);
            await setDoc(dirRef, updates, { merge: true });
            setFetchedUser({ ...fetchedUser, ...updates }); setIsEditing(false);
        } catch (e) { alert("Error guardando");
        } finally { setSaving(false); }
    };

    if (loading || !fetchedUser) return <Modal isOpen={true} onClose={onClose} title="Cargando..."><div className="p-4 text-center">Cargando...</div></Modal>;

    return (
        <Modal isOpen={true} onClose={onClose} title={isEditing ? "Editar" : "Detalle de Usuario"}>
            {!isEditing ? (
                <div className="space-y-6">
                    {/* ENCABEZADO PRO */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                                {fetchedUser.displayName?.substring(0, 2).toUpperCase()}
                             </div>
                             <div>
                                <h3 className="font-bold text-lg text-gray-900 leading-tight">{fetchedUser.displayName}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${fetchedUser.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {fetchedUser.role}
                                    </span>
                                    <span className="text-gray-300 text-xs">•</span>
                                    <span className="text-sm text-gray-500">{fetchedUser.refereeStatus}</span>
                                </div>
                             </div>
                        </div>
                        <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"><Pencil className="w-5 h-5"/></button>
                    </div>

                    {/* BOTÓN WHATSAPP GRANDE */}
                    {fetchedUser.phone && (
                        <a href={`https://wa.me/${fetchedUser.phone}`} target="_blank" className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 hover:shadow-sm">
                            <MessageCircle className="w-5 h-5" /> Enviar WhatsApp
                        </a>
                    )}

                    {/* TARJETAS DE ESTADO */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">CATEGORÍA</p>
                            <div className="flex items-center gap-2 font-semibold text-gray-700">
                                <Award className="w-4 h-4 text-orange-400" />
                                {fetchedUser.maxCategory || '-'}
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">PRUEBA FÍSICA</p>
                             <div className={`flex items-center gap-2 font-semibold ${fetchedUser.physicalTestPassed ? 'text-green-600' : 'text-red-500'}`}>
                                <Activity className="w-4 h-4" />
                                {fetchedUser.physicalTestPassed ? 'Aprobada' : 'Pendiente'}
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* LISTA DE DATOS */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="mt-1"><Mail className="w-5 h-5 text-gray-400"/></div>
                            <div><p className="text-xs text-gray-400 mb-0.5">Email</p><p className="text-sm font-medium text-gray-700">{fetchedUser.email}</p></div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="mt-1"><Phone className="w-5 h-5 text-gray-400"/></div>
                            <div><p className="text-xs text-gray-400 mb-0.5">Teléfono</p><p className="text-sm font-medium text-gray-700">{fetchedUser.phone || '-'}</p></div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="mt-1"><CreditCard className="w-5 h-5 text-gray-400"/></div>
                            <div><p className="text-xs text-gray-400 mb-0.5">CBU / Alias</p><p className="text-sm font-medium text-gray-700">{fetchedUser.cbu || '-'}</p></div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="mt-1"><Car className="w-5 h-5 text-gray-400"/></div>
                            <div><p className="text-xs text-gray-400 mb-0.5">Vehículo</p><p className="text-sm font-medium text-gray-700">{fetchedUser.defaultHasCar ? 'Posee vehículo' : 'No tiene vehículo'}</p></div>
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label><input className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-100 outline-none" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} placeholder="Nombre"/></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label><input className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-100 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Teléfono"/></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">CBU / Alias</label><input className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-100 outline-none" value={formData.cbu} onChange={e => setFormData({...formData, cbu: e.target.value})} placeholder="CBU/Alias"/></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Estado</label><select className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-blue-100 outline-none" value={formData.refereeStatus} onChange={e => setFormData({...formData, refereeStatus: e.target.value})}><option value="Alumno">Alumno</option><option value="Árbitro Recibido">Árbitro Recibido</option></select></div>
                        
                        <div className="flex gap-4">
                             <div className="flex-1"><label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label><input className="w-full p-3 border rounded-xl" value={formData.maxCategory} onChange={e => setFormData({...formData, maxCategory: e.target.value})} placeholder="-"/></div>
                             <div className="flex-1 flex items-end"><label className="w-full p-3 border rounded-xl flex items-center gap-2 cursor-pointer bg-gray-50"><input type="checkbox" className="w-4 h-4 text-blue-600 rounded" checked={formData.physicalTestPassed} onChange={e => setFormData({...formData, physicalTestPassed: e.target.checked})}/> <span className="text-sm">Físico OK</span></label></div>
                        </div>
    
                        <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 flex items-center justify-between">
                             <span className="text-sm font-bold text-orange-800 flex items-center gap-2"><PauseCircle className="w-4 h-4"/> Licencia / Ausente</span>
                              <input type="checkbox" checked={formData.isAbsent || false} onChange={e => setFormData({...formData, isAbsent: e.target.checked})} className="w-5 h-5 text-orange-600 rounded"/>
                        </div>
    
                        <div className="flex justify-between items-center border p-3 rounded-xl bg-purple-50 border-purple-100"><span className="text-sm font-bold text-purple-800">¿Es Administrador?</span><input type="checkbox" className="w-5 h-5 text-purple-600 rounded" checked={formData.role === 'admin'} onChange={e => setFormData({...formData, role: e.target.checked ? 'admin' : 'user'})}/></div>
                    </div>
                    <div className="flex gap-3 pt-2"><Button variant="secondary" onClick={() => setIsEditing(false)}>Cancelar</Button><Button type="submit">Guardar</Button></div>
                </form>
            )}
        </Modal>
    );
};
       

// ==========================================
// 6. PANTALLAS PRINCIPALES
// ==========================================

const Login = () => {
  const [authMode, setAuthMode] = useState('login'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [domainToAuth, setDomainToAuth] = useState(''); 
  const currentDomain = window.location.hostname;
  const { appName, googleAuthEnabled } = useAuth();
  const handleAuth = async (e) => { e.preventDefault(); setError(''); setSuccessMsg(''); try { if (authMode === 'register') { if (password !== confirmPassword) { setError('Las contraseñas no coinciden. Inténtalo de nuevo.'); return; } const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password); await updateProfile(userCredential.user, { displayName: name }); const userRef = getUserDocRef(userCredential.user.uid); await setDoc(userRef, { uid: userCredential.user.uid, displayName: name || 'Usuario', email: email || '', phone: phone || '', role: 'user', defaultHasCar: false, refereeStatus: 'Alumno', isApproved: false, createdAt: serverTimestamp() }); if (USE_YOUR_OWN_DB) { await setDoc(doc(db, 'user_directory', userCredential.user.uid), { uid: userCredential.user.uid, displayName: name || 'Usuario', email: email || '', phone: phone || '', role: 'user', defaultHasCar: false, refereeStatus: 'Alumno', isApproved: false }); } } else { await signInWithEmailAndPassword(getAuth(), email, password); } } catch (err) { console.error(err); setError(err.message.includes('auth') ? 'Error de autenticación. Verifica tus credenciales.' : err.message); } };
  const handlePasswordReset = async (e) => { e.preventDefault(); setError(''); setSuccessMsg(''); if (!email) { setError('Por favor, ingresa tu correo electrónico.'); return; } try { await sendPasswordResetEmail(auth, email); setSuccessMsg('✅ ¡Listo! Revisa tu correo para restablecer la contraseña.'); } catch (err) { console.error(err); setError('Error al enviar el correo. Verifica que el email sea correcto.'); } };
  const handleGoogleLogin = async () => { if (!googleAuthEnabled) { setError("🚫 Actualmente no disponible: El acceso con Google está deshabilitado temporalmente. Por favor, usa Email/Contraseña."); return; } setError(''); setDomainToAuth(''); const provider = new GoogleAuthProvider(); try { const result = await signInWithPopup(auth, provider); const user = result.user; const userRef = getUserDocRef(user.uid); const userSnap = await getDoc(userRef); if (!userSnap.exists()) { const userData = { uid: user.uid, displayName: user.displayName || 'Usuario Google', email: user.email || '', phone: '', role: 'user', defaultHasCar: false, refereeStatus: 'Alumno', isApproved: false, createdAt: serverTimestamp() }; await setDoc(userRef, userData); let dirRef; if (USE_YOUR_OWN_DB) { dirRef = doc(db, 'user_directory', user.uid); } else { dirRef = doc(db, 'artifacts', appId, 'public', 'data', 'user_directory', user.uid); } await setDoc(dirRef, userData); } } catch (err) { console.error("Google Sign-In Error:", err); const errorCode = err.code || ''; if (errorCode === 'auth/popup-closed-by-user') { setError("Cancelaste el inicio de sesión."); } else if (errorCode === 'auth/unauthorized-domain') { setDomainToAuth(currentDomain); setError("⚠️ Dominio no autorizado en Firebase."); } else { setError("Error al iniciar con Google. Intenta de nuevo."); } } };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <RefereeLogo className="w-24 h-24 mb-4 drop-shadow-xl" />
          <h1 className="text-2xl font-bold text-gray-900">{appName}</h1>
          <p className="text-gray-500">Gestión de disponibilidad</p>
        </div>
        <Card>
            <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">{authMode === 'login' ? 'Iniciar Sesión' : authMode === 'register' ? 'Crear Cuenta' : 'Recuperar Contraseña'}</h2>
            {authMode !== 'reset' && (
                <>
                <button onClick={handleGoogleLogin} className="w-full mb-4 py-3 px-4 border border-gray-300 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-gray-50 transition-colors bg-white text-gray-700">
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>Continuar con Google
                </button>
                <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">O con email</span></div></div>
                </>
            )}
            <form onSubmit={authMode === 'reset' ? handlePasswordReset : handleAuth} className="space-y-4">
                {error && <p className="text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg text-sm text-center font-medium">{error}</p>}
                {successMsg && <p className="text-green-600 bg-green-50 border border-green-100 p-3 rounded-lg text-sm text-center font-medium">{successMsg}</p>}
                {authMode === 'register' && (
                <>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label><input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" placeholder="Ej: Juan Pérez" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (WhatsApp)</label><input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" placeholder="Ej: 54911..." /></div>
                </>
                )}
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" placeholder="correo@ejemplo.com" /></div>
                {authMode !== 'reset' && (
                <>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" placeholder="••••••••" /></div>
                    {authMode === 'register' && (<div><label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label><input required type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" placeholder="••••••••" /></div>)}
                </>
                )}
                <Button type="submit" className="mt-2">{authMode === 'login' ? 'Ingresar' : authMode === 'register' ? 'Registrarse' : 'Enviar enlace de recuperación'}</Button>
            </form>
            <div className="mt-6 text-center text-sm space-y-3">
                {authMode === 'login' && (<><button onClick={() => setAuthMode('reset')} className="text-blue-600 font-medium hover:underline block w-full">¿Olvidaste tu contraseña?</button><p className="text-gray-600 pt-2 border-t border-gray-100 mt-4">¿No tienes cuenta?<button onClick={() => setAuthMode('register')} className="text-blue-600 font-bold ml-1 hover:underline">Regístrate</button></p></>)}
                {authMode === 'register' && (<p className="text-gray-600">¿Ya tienes cuenta?<button onClick={() => setAuthMode('login')} className="text-blue-600 font-bold ml-1 hover:underline">Inicia Sesión</button></p>)}
                {authMode === 'reset' && (<button onClick={() => setAuthMode('login')} className="text-gray-500 font-medium hover:text-gray-700 flex items-center justify-center gap-2 w-full"><ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión</button>)}
            </div>
            {domainToAuth && (<div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-left"><div className="flex items-start gap-3"><AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" /><div><h4 className="font-bold text-yellow-800 text-sm">Falta Autorización en Firebase</h4><div className="flex items-center gap-2 bg-white border border-yellow-200 rounded-lg p-2 mt-2"><code className="text-xs text-gray-600 break-all select-all flex-1">{domainToAuth}</code><button onClick={() => {navigator.clipboard.writeText(domainToAuth); alert("Copiado");}} className="p-1 hover:bg-gray-100 rounded text-gray-500"><Copy className="w-4 h-4"/></button></div></div></div></div>)}
        </Card>
      </div>
    </div>
  );
};

const UserProfile = () => {
    const { user, userData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ displayName: '', phone: '', cbu: '', defaultHasCar: false });
    useEffect(() => {
        if (userData) {
            setFormData({
                displayName: userData.displayName || '',
                phone: userData.phone || '',
                cbu: userData.cbu || '',
                defaultHasCar: userData.defaultHasCar || false,
                refereeStatus: userData.refereeStatus || 'Alumno'
            });
        }
    }, [userData]);
    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updates = { displayName: formData.displayName, phone: formData.phone, cbu: formData.cbu, defaultHasCar: formData.defaultHasCar, refereeStatus: formData.refereeStatus, updatedAt: serverTimestamp() };
            const userRef = getUserDocRef(user.uid);
            await updateDoc(userRef, updates);
            let dirRef;
            if (USE_YOUR_OWN_DB) { dirRef = doc(db, 'user_directory', user.uid); } else { dirRef = doc(db, 'artifacts', appId, 'public', 'data', 'user_directory', user.uid); }
            await setDoc(dirRef, updates, { merge: true });
            const toast = document.createElement('div');
            toast.className = "fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-900 text-white px-6 py-3 rounded-full shadow-xl z-50 animate-bounce flex items-center gap-2";
            toast.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Perfil actualizado correctamente';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        } catch (error) {
            console.error("Error al actualizar perfil:", error);
            alert("Error al guardar cambios. Intenta de nuevo.");
        } finally { setLoading(false); }
    };
    return (
        <div className="max-w-lg mx-auto p-4 space-y-6">
            <div className="flex items-center gap-3 mb-2"><div className="bg-blue-100 p-3 rounded-full text-blue-600"><UserCircle className="w-8 h-8" /></div><div><h2 className="text-2xl font-bold text-gray-900">Mi Perfil</h2><p className="text-gray-500 text-sm">Actualiza tus datos personales</p></div></div>
            <form onSubmit={handleSave}>
                <Card className="space-y-5">
                    <div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Categoría</label><div className="bg-gray-100 p-3 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium flex items-center gap-2"><Award className="w-4 h-4 text-orange-500" /><span>{userData?.maxCategory || '-'}</span></div></div><div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Prueba Física</label><div className={`p-3 rounded-xl border text-sm font-medium flex items-center gap-2 ${userData?.physicalTestPassed ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}><Activity className="w-4 h-4" /><span>{userData?.physicalTestPassed ? 'Aprobada' : 'No Aprobada'}</span></div></div></div>
                    <div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Rol</label><div className="bg-gray-100 p-3 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium flex items-center gap-2"><Shield className="w-4 h-4" /><span className="capitalize">{userData?.role || 'user'}</span></div></div><div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email</label><div className="bg-gray-100 p-3 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium truncate" title={userData?.email}>{userData?.email}</div></div></div>
                    <hr className="border-gray-100" />
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label><div className="relative"><User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" /><input required type="text" value={formData.displayName} onChange={(e) => setFormData({...formData, displayName: e.target.value})} className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all" placeholder="Tu nombre real" /></div></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Condición Actual</label><select value={formData.refereeStatus || 'Alumno'} onChange={(e) => setFormData({...formData, refereeStatus: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all bg-white"><option value="Alumno">Alumno</option><option value="Árbitro Recibido">Árbitro Recibido</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / WhatsApp</label><div className="relative"><Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" /><input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all" placeholder="Ej: 54911..." /></div></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Alias / CBU (Opcional)</label><div className="relative"><CreditCard className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" /><input type="text" value={formData.cbu} onChange={(e) => setFormData({...formData, cbu: e.target.value})} className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all" placeholder="Para pago de viáticos" /></div></div>
                    
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-xs text-blue-800 flex gap-3 items-start"><Info className="w-5 h-5 shrink-0 text-blue-600" /><p><strong>Importante:</strong> Si necesitas solicitar una licencia temporal o estarás ausente por viaje/lesión, por favor comunícate con la administración para pausar tu cuenta.</p></div>
                    
                    <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100"><div className="flex items-center gap-3"><div className="bg-white p-2 rounded-lg shadow-sm text-blue-600"><Car className="w-5 h-5" /></div><div><span className="block font-bold text-gray-800">¿Tenés Auto?</span><span className="text-xs text-blue-600/80">Valor por defecto en tus designaciones</span></div></div><button type="button" onClick={() => setFormData({...formData, defaultHasCar: !formData.defaultHasCar})} className={`w-12 h-7 rounded-full transition-colors relative flex items-center px-1 ${formData.defaultHasCar ? 'bg-blue-600' : 'bg-gray-300'}`}><div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${formData.defaultHasCar ? 'translate-x-5' : 'translate-x-0'}`} /></button></div>
                    <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar Cambios'}</Button>
                </Card>
            </form>
        </div>
    );
};

const RefereeHistory = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const q = query(getCollectionRef('confirmations'), where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            data.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
            setHistory(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    if (loading) return <div className="text-center p-8 text-gray-500">Cargando historial...</div>;

    return (
        <div className="max-w-lg mx-auto p-4 space-y-6">
             <div className="flex items-center gap-3 mb-2"><div className="bg-blue-100 p-3 rounded-full text-blue-600"><History className="w-8 h-8" /></div><div><h2 className="text-2xl font-bold text-gray-900">Mi Actividad</h2><p className="text-gray-500 text-sm">Historial de designaciones confirmadas</p></div></div>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {history.length === 0 && <div className="text-center p-8 text-gray-400 bg-white rounded-xl border border-gray-100 relative z-10">No tienes actividad reciente.</div>}
                {history.map((item) => (
                    <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-50 group-[.is-active]:bg-blue-500 group-[.is-active]:text-white text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:static">
                            {item.status === 'declined' ? <XCircle className="w-5 h-5 text-red-500"/> : <CheckCircle className="w-5 h-5"/>}
                        </div>
                        <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow ml-14 md:ml-0">
                            <div className="flex justify-between items-start mb-2"><h3 className="font-bold text-gray-800">{item.eventTitle || item.weekend}</h3>{item.timestamp && <span className="text-[10px] text-gray-400">{new Date(item.timestamp.seconds * 1000).toLocaleDateString()}</span>}</div>
                            {item.status === 'declined' ? (
                                <div className="text-red-600 font-bold text-sm mb-2">No asistió</div>
                            ) : (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {item.availability && Object.entries(item.availability).map(([date, isAvailable]) => {
                                        if(!isAvailable) return null;
                                        try {
                                            const parts = date.split('-');
                                            const d = new Date(parts[0], parts[1] - 1, parts[2]);
                                            const dayName = d.toLocaleDateString('es-AR', {weekday: 'short'});
                                            const dayNum = d.getDate();
                                            return (<span key={date} className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded border border-green-100 flex items-center gap-1">{dayName} {dayNum}</span>);
                                        } catch(e) { return null; }
                                    })}
                                </div>
                            )}
                            <div className="flex items-center justify-between text-sm text-gray-600 border-t border-gray-100 pt-2"><div className="flex items-center gap-2"><Car className={`w-4 h-4 ${item.hasCar ? 'text-green-600' : 'text-gray-300'}`}/><span className={item.hasCar ? 'text-green-700 font-medium' : 'text-gray-400'}>{item.hasCar ? 'Con Auto' : 'Sin Auto'}</span></div></div>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RefereeDashboard = ({ user, userData, tools }) => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [availability, setAvailability] = useState({});
  const [hasCar, setHasCar] = useState(false);
  const [notes, setNotes] = useState('');
  const [deadlinePassed, setDeadlinePassed] = useState(false);
  const [currentConfirmation, setCurrentConfirmation] = useState(null);

  useEffect(() => {
    const q = query(getCollectionRef('events'), where('status', '==', 'open'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const eventsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        eventsList.sort((a, b) => {
            const dateA = new Date(a.dateStart || 0);
            const dateB = new Date(b.dateStart || 0);
            return dateA - dateB;
        });
        setEvents(eventsList);
        if(eventsList.length > 0 && !selectedEventId) {
            setSelectedEventId(eventsList[0].id);
        }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !selectedEventId) return;
    const currentEvent = events.find(e => e.id === selectedEventId);
    if (currentEvent && currentEvent.deadline) {
        const now = new Date();
        const deadline = new Date(currentEvent.deadline);
        setDeadlinePassed(now > deadline);
    } else {
        setDeadlinePassed(false);
    }
    const fetchConfirmation = async () => {
        const docId = `${user.uid}_${selectedEventId}`;
        let confirmRef;
        if (USE_YOUR_OWN_DB) {
            confirmRef = doc(db, 'confirmations', docId);
        } else {
            confirmRef = doc(db, 'artifacts', appId, 'public', 'data', 'confirmations', docId);
        }
        const docSnap = await getDoc(confirmRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            setCurrentConfirmation(data);
            setAvailability(data.availability || {}); 
            setHasCar(data.hasCar || false);
            setNotes(data.notes || '');
            setSubmitted(true);
            setShowForm(false);
        } else {
            setSubmitted(false);
            setCurrentConfirmation(null);
            setAvailability({});
            setHasCar(userData?.defaultHasCar || false);
            setNotes('');
            setShowForm(false);
        }
    };
    fetchConfirmation();
  }, [user, selectedEventId, events, userData]);

  // --- BLOQUEO POR LICENCIA (v1.6) ---
  if (userData?.isAbsent) {
      return (
          <div className="max-w-lg mx-auto p-4 space-y-6">
              <div className="bg-orange-100 p-8 rounded-xl text-center border border-orange-200">
                  <PauseCircle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-orange-800">Licencia Activa</h2>
                  <p className="text-orange-700 mt-2">Tu cuenta figura como ausente o de licencia. No puedes recibir designaciones por el momento.</p>
              </div>
          </div>
      );
  }

  const handleDecline = async () => {
      if (deadlinePassed) return alert("Tiempo límite expirado.");
      if (!window.confirm("¿Seguro que deseas marcar que NO puedes asistir?")) return;
      await saveResponse('declined');
  };

  const handleConfirm = async (e) => {
      e.preventDefault();
      if (deadlinePassed) return alert("Tiempo límite expirado.");
      await saveResponse('confirmed');
  };

  const saveResponse = async (status) => {
    setLoading(true);
    try {
        const docId = `${user.uid}_${selectedEventId}`;
        const selectedEvent = events.find(ev => ev.id === selectedEventId);
        let confirmRef;
        if (USE_YOUR_OWN_DB) {
            confirmRef = doc(db, 'confirmations', docId);
        } else {
            confirmRef = doc(db, 'artifacts', appId, 'public', 'data', 'confirmations', docId);
        }
        const dataToSave = {
            userId: user.uid,
            userName: userData?.displayName || user.displayName || 'Árbitro',
            userPhone: userData?.phone || '',
            weekend: selectedEventId,
            eventTitle: selectedEvent?.title || 'Fecha Desconocida',
            timestamp: serverTimestamp(),
            status: status
        };
        if (status === 'confirmed') {
            dataToSave.availability = availability;
            dataToSave.hasCar = hasCar;
            dataToSave.notes = notes;
        } else {
            dataToSave.availability = {};
            dataToSave.hasCar = false;
            dataToSave.notes = '';
        }
        await setDoc(confirmRef, dataToSave);
        setSubmitted(true);
        setCurrentConfirmation(dataToSave);
        setShowForm(false);
        const msg = status === 'confirmed' ? "¡Asistencia Confirmada!" : "Respuesta Guardada (No asiste)";
        const toast = document.createElement('div');
        toast.className = "fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl z-50 animate-bounce";
        toast.innerText = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    } catch (err) {
        console.error("Error guardando:", err);
        alert("Error al guardar. Intenta de nuevo.");
    } finally {
        setLoading(false);
    }
  };

  const currentEvent = events.find(e => e.id === selectedEventId);
  const toggleAvailability = (dateId) => {
      setAvailability(prev => ({ ...prev, [dateId]: !prev[dateId] }));
  };

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <Card className="border-blue-100 bg-blue-50/50">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Selecciona la Fecha</label>
        {events.length > 0 ? (
            <div className="relative">
                <select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} className="w-full appearance-none bg-white border border-blue-200 text-gray-900 text-lg font-bold rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 pr-8 shadow-sm">
                    {events.map(ev => (<option key={ev.id} value={ev.id}>{ev.title} ({formatDate(ev.dateStart)})</option>))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500"><CalendarDays className="w-5 h-5"/></div>
            </div>
        ) : (<div className="text-gray-500 text-center py-2 font-medium">No hay fechas abiertas para confirmar.</div>)}
      </Card>
      {selectedEventId && currentEvent && (
          <Card className="space-y-6 transition-all duration-300">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-2">
                    <h3 className="text-base font-semibold text-gray-700">Tu Estado</h3>
                    {deadlinePassed ? (
                        <span className="flex items-center gap-1 text-xs font-bold bg-gray-100 text-gray-700 px-2 py-1 rounded-md"><Lock className="w-3 h-3"/> CERRADO</span>
                    ) : submitted && currentConfirmation ? (
                        currentConfirmation.status === 'declined' ? 
                        <span className="flex items-center gap-1 text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded-md"><XCircle className="w-3 h-3"/> NO ASISTIRÉ</span> :
                        <span className="flex items-center gap-1 text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-md"><CheckCircle className="w-3 h-3"/> CONFIRMADO</span>
                    ) : (<span className="flex items-center gap-1 text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md">PENDIENTE</span>)}
                </div>
                {currentEvent.deadline && (
                    <div className={`text-xs p-2 rounded-lg flex items-center gap-2 ${deadlinePassed ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                        <Clock className="w-4 h-4"/>
                        {deadlinePassed ? `El tiempo límite expiró el ${formatDateTime(currentEvent.deadline)}` : `Tienes tiempo hasta el ${formatDateTime(currentEvent.deadline)}`}
                    </div>
                )}
                {(!submitted && !showForm) && !deadlinePassed && (
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <button onClick={() => setShowForm(true)} className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-green-100 bg-green-50 hover:bg-green-100 hover:border-green-300 transition-all gap-2 group">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-green-600 group-hover:scale-110 transition-transform"><CheckCircle className="w-6 h-6"/></div>
                            <span className="font-bold text-green-800">Confirmar Asistencia</span>
                        </button>
                        <button onClick={handleDecline} className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-red-100 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all gap-2 group">
                             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-red-600 group-hover:scale-110 transition-transform"><XCircle className="w-6 h-6"/></div>
                            <span className="font-bold text-red-800">No puedo asistir</span>
                        </button>
                    </div>
                )}
                {showForm && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 mb-4">Selecciona los días que puedes dirigir:</div>
                        <div className="grid grid-cols-2 gap-4">
                            {currentEvent.activeDays?.map((day) => (
                                <label key={day.id} className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${availability[day.id] ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-200'}`}>
                                    <input type="checkbox" className="hidden" checked={!!availability[day.id]} onChange={() => toggleAvailability(day.id)}/>
                                    <span className="font-bold text-center text-sm">{day.label}</span>
                                    {availability[day.id] ? <CheckCircle className="w-6 h-6" /> : <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>}
                                </label>
                            ))}
                        </div>
                        <div className={`flex items-center justify-between bg-gray-50 p-4 rounded-xl`}>
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-lg shadow-sm text-gray-600"><Car className="w-5 h-5" /></div>
                                <span className="font-medium text-gray-700">¿Tenés Auto?</span>
                            </div>
                            <button type="button" onClick={() => setHasCar(!hasCar)} className={`w-14 h-8 rounded-full transition-colors relative flex items-center px-1 ${hasCar ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${hasCar ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none min-h-[100px]" placeholder="Ej: Solo turno mañana..."/>
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
                            <Button type="submit" onClick={handleConfirm} disabled={loading}>Guardar Confirmación</Button>
                        </div>
                     </div>
                )}
                {submitted && !showForm && (
                    <div className="text-center py-6">
                         <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${currentConfirmation?.status === 'declined' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                             {currentConfirmation?.status === 'declined' ? <ThumbsDown className="w-10 h-10"/> : <ThumbsUp className="w-10 h-10"/>}
                         </div>
                         <h3 className="text-xl font-bold text-gray-900 mb-1">{currentConfirmation?.status === 'declined' ? 'Has rechazado esta fecha' : '¡Tu asistencia está confirmada!'}</h3>
                         <p className="text-gray-500 text-sm mb-6">Gracias por responder a tiempo.</p>
                         {!deadlinePassed && (<button onClick={() => { setShowForm(true); setSubmitted(false); }} className="text-blue-600 font-medium hover:underline text-sm flex items-center justify-center gap-2 mx-auto"><RefreshCw className="w-4 h-4"/> Cambiar mi respuesta</button>)}
                    </div>
                )}
          </Card>
      )}
      {/* HERRAMIENTAS v1.8 */}
            {tools && tools.length > 0 && (
                <div className="mt-6 mb-8">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-600"/> Herramientas y Documentos
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {tools.map(tool => (
                            <a 
                                key={tool.id} 
                                href={tool.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all group cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Download className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">{tool.title}</span>
                                        <span className="text-xs text-gray-400">Clic para descargar/ver</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-transform" />
                            </a>
                        ))}
                    </div>
                </div>
            )}
    </div>
  );
};

const AdminDashboard = ({ userData, tools, newTool, setNewTool, handleAddTool, handleDeleteTool }) => {
    const [activeTab, setActiveTab] = useState('designations');
    const [confirmations, setConfirmations] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [showEventModal, setShowEventModal] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', dateStart: '', dateEnd: '', deadline: '' });
    const [generatedDays, setGeneratedDays] = useState([]);
    const [selectedDaysIds, setSelectedDaysIds] = useState([]);
    const [editingEventId, setEditingEventId] = useState(null); 
    const [selectedUserId, setSelectedUserId] = useState(null); 
    const [showCreateUserModal, setShowCreateUserModal] = useState(false); 
    const [manualConfirmData, setManualConfirmData] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [isSavingUser, setIsSavingUser] = useState(false);
    const { user, appName, googleAuthEnabled, maintenanceMode } = useAuth();
    const [settingsName, setSettingsName] = useState(appName);
    const [settingsGoogleEnabled, setSettingsGoogleEnabled] = useState(googleAuthEnabled);
    const [settingsMaintenanceMode, setSettingsMaintenanceMode] = useState(maintenanceMode);
    const [savingSettings, setSavingSettings] = useState(false);
    const [pastEvents, setPastEvents] = useState([]);
    const [allConfirmations, setAllConfirmations] = useState([]);
    const [historyDetailEvent, setHistoryDetailEvent] = useState(null);
    const [openSections, setOpenSections] = useState({ confirmed: true, declined: false, pending: false });
    const [classifiedList, setClassifiedList] = useState({ confirmed: [], declined: [], pending: [] });

    // Filter Pending Users
    const pendingApprovalUsers = allUsers.filter(u => u.isApproved === false && u.role !== 'admin');

    useEffect(() => { setSettingsName(appName); setSettingsGoogleEnabled(googleAuthEnabled); setSettingsMaintenanceMode(maintenanceMode); }, [appName, googleAuthEnabled, maintenanceMode]);

    const handleDateChange = (field, value) => {
        const updatedEvent = { ...newEvent, [field]: value };
        setNewEvent(updatedEvent);
        if (updatedEvent.dateStart && updatedEvent.dateEnd) {
            const days = getDaysInRange(updatedEvent.dateStart, updatedEvent.dateEnd);
            setGeneratedDays(days);
            if (!editingEventId) setSelectedDaysIds(days.map(d => d.id));
        } else {
            setGeneratedDays([]);
        }
    };

    useEffect(() => { if (!user) return; const qUsers = getCollectionRef('user_directory'); onSnapshot(qUsers, (snap) => setAllUsers(snap.docs.map(d => ({uid: d.id, ...d.data()})))); }, [user]);
    useEffect(() => { if (!user) return; const qEvents = query(getCollectionRef('events'), orderBy('dateStart', 'desc')); onSnapshot(qEvents, (snap) => { const list = snap.docs.map(d => ({id: d.id, ...d.data()})); setEvents(list); setPastEvents(list.filter(e => e.status === 'closed' || e.dateEnd < new Date().toISOString().split('T')[0])); }); }, [user]);
    useEffect(() => { if (!user) return; const qAll = getCollectionRef('confirmations'); onSnapshot(qAll, (snap) => setAllConfirmations(snap.docs.map(d => ({id: d.id, ...d.data()})))); }, [user]);

    useEffect(() => {
        if (!selectedEventId) {
            setConfirmations([]);
            setClassifiedList({ confirmed: [], declined: [], pending: [] });
            return;
        }
        const eventConfirms = allConfirmations.filter(c => c.weekend === selectedEventId);
        const confirmed = eventConfirms.filter(c => !c.status || c.status === 'confirmed');
        confirmed.sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
        const declined = eventConfirms.filter(c => c.status === 'declined');
        const respondedIds = eventConfirms.map(c => c.userId);
        // Excluir admins y AUSENTES de pendientes (v1.6)
        const pending = allUsers.filter(u => !respondedIds.includes(u.uid) && u.role !== 'admin' && !u.isAbsent);
        
        setClassifiedList({ confirmed, declined, pending });
        setConfirmations(confirmed); 
    }, [selectedEventId, allConfirmations, allUsers]);

    // NEW ACTIONS FOR APPROVAL
    const handleApproveUser = async (uid) => {
        try {
            const updates = { isApproved: true };
            let ref1 = getUserDocRef(uid);
            await updateDoc(ref1, updates);
            let ref2 = USE_YOUR_OWN_DB ? doc(db, 'user_directory', uid) : doc(db, 'artifacts', appId, 'public', 'data', 'user_directory', uid);
            await setDoc(ref2, updates, { merge: true });
        } catch (e) { alert("Error al aprobar."); }
    };

    const handleRejectUser = async (uid) => {
        if(!window.confirm("¿Rechazar y eliminar usuario?")) return;
        try {
            let ref1 = getUserDocRef(uid);
            await deleteDoc(ref1);
            let ref2 = USE_YOUR_OWN_DB ? doc(db, 'user_directory', uid) : doc(db, 'artifacts', appId, 'public', 'data', 'user_directory', uid);
            await deleteDoc(ref2);
        } catch (e) { alert("Error al rechazar."); }
    };

    const handleCancelDesignation = async (confirmId) => {
        if (window.confirm("¿Dar de baja a este árbitro de la fecha? Pasará a 'No Disponibles'.")) {
             let ref;
             if(USE_YOUR_OWN_DB) ref = doc(db, 'confirmations', confirmId);
             else ref = doc(db, 'artifacts', appId, 'public', 'data', 'confirmations', confirmId);
             await updateDoc(ref, { status: 'declined' });
        }
    };

    // ... (Other handlers kept same)
    const handleCreateEvent = async (e) => { e.preventDefault(); try { const active = generatedDays.filter(d => selectedDaysIds.includes(d.id)); await addDoc(getCollectionRef('events'), { ...newEvent, activeDays: active, status: 'open', isActive: true, createdAt: serverTimestamp() }); setShowEventModal(false); setNewEvent({ title: '', dateStart: '', dateEnd: '', deadline: '' }); setGeneratedDays([]); } catch (err) { alert("Error crear evento"); } };
    const handleDeleteEvent = async (id) => { if (window.confirm("Borrar evento?")) { try { let ref = USE_YOUR_OWN_DB ? doc(db,'events',id) : doc(db,'artifacts',appId,'public','data','events',id); await deleteDoc(ref); } catch(e) { alert("Error borrar"); } } };
    const toggleEventStatus = async (ev) => { try { let ref = USE_YOUR_OWN_DB ? doc(db,'events',ev.id) : doc(db,'artifacts',appId,'public','data','events',ev.id); await updateDoc(ref, { status: ev.status === 'open' ? 'closed' : 'open' }); } catch(e) { alert("Error status"); } };
    const toggleDaySelection = (id) => setSelectedDaysIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    const openCreateModal = () => { setEditingEventId(null); setNewEvent({ title: '', dateStart: '', dateEnd: '', deadline: '' }); setGeneratedDays([]); setSelectedDaysIds([]); setShowEventModal(true); };
    const openEditModal = (ev) => { setEditingEventId(ev.id); setNewEvent({ title: ev.title, dateStart: ev.dateStart, dateEnd: ev.dateEnd, deadline: ev.deadline || '' }); setGeneratedDays(getDaysInRange(ev.dateStart, ev.dateEnd)); setSelectedDaysIds(ev.activeDays ? ev.activeDays.map(d => d.id) : []); setShowEventModal(true); };
    const handleSaveEvent = async (e) => { e.preventDefault(); try { const active = generatedDays.filter(d => selectedDaysIds.includes(d.id)); const data = { ...newEvent, activeDays: active }; let ref = editingEventId ? (USE_YOUR_OWN_DB ? doc(db,'events',editingEventId) : doc(db,'artifacts',appId,'public','data','events',editingEventId)) : null; if(editingEventId) await updateDoc(ref, data); else { data.status='open'; data.isActive=true; data.createdAt=serverTimestamp(); await addDoc(getCollectionRef('events'), data); } setShowEventModal(false); setNewEvent({ title: '', dateStart: '', dateEnd: '', deadline: '' }); setGeneratedDays([]); } catch(e) { alert("Error guardar"); } };
    const handleViewUser = (uid) => setSelectedUserId(uid);
    const openEditUser = (u) => setEditingUser({...u});
    const handleUpdateUser = async (e) => { e.preventDefault(); if (!editingUser) return; setIsSavingUser(true); try { if (editingUser.uid === user.uid && editingUser.role !== 'admin') { alert("No quitar admin propio"); setIsSavingUser(false); return; } const updates = { displayName: editingUser.displayName, phone: editingUser.phone, role: editingUser.role, defaultHasCar: editingUser.defaultHasCar || false, cbu: editingUser.cbu || '', refereeStatus: editingUser.refereeStatus || 'Alumno', physicalTestPassed: editingUser.physicalTestPassed || false, maxCategory: editingUser.maxCategory || '', updatedAt: serverTimestamp() }; let ref1 = getUserDocRef(editingUser.uid); await updateDoc(ref1, updates); let ref2 = USE_YOUR_OWN_DB ? doc(db,'user_directory',editingUser.uid) : doc(db,'artifacts',appId,'public','data','user_directory',editingUser.uid); await setDoc(ref2, updates, {merge:true}); setEditingUser(null); } catch(e) { alert("Error update user"); } finally { setIsSavingUser(false); } };
    const handleSaveSettings = async (e) => { e.preventDefault(); setSavingSettings(true); try { const ref = getSettingsDocRef(); await setDoc(ref, { appName: settingsName, googleAuthEnabled: settingsGoogleEnabled, maintenanceMode: settingsMaintenanceMode }, { merge: true }); } catch(e) { alert("Error settings"); } finally { setSavingSettings(false); } };
    const getStatsForEvent = (eventId) => { const list = allConfirmations.filter(c => c.weekend === eventId); return { total: list.length, cars: list.filter(c => c.hasCar).length, confirms: list }; };

    const toggleSection = (sec) => setOpenSections(p => ({ ...p, [sec]: !p[sec] }));
    const currentEvent = events.find(e => e.id === selectedEventId);

    // Manual Confirm Handlers
    const handleManualConfirm = (user, existingConf) => {
        const currentEvent = events.find(e => e.id === selectedEventId);
        if(!currentEvent) return;
        setManualConfirmData({ user, event: currentEvent, confirmation: existingConf });
    };

    const handleMarkUnavailable = async (targetUser) => {
         if(!window.confirm("¿Marcar como No Disponible?")) return;
         try {
            const docId = `${targetUser.uid}_${currentEvent.id}`;
            let ref = USE_YOUR_OWN_DB ? doc(db,'confirmations',docId) : doc(db,'artifacts',appId,'public','data','confirmations',docId);
            await setDoc(ref, {
                userId: targetUser.uid, userName: targetUser.displayName, userPhone: targetUser.phone||'', weekend: currentEvent.id, eventTitle: currentEvent.title, timestamp: serverTimestamp(), status: 'declined', availability: {}, hasCar: false, notes: ''
            });
         } catch(e) { alert("Error al marcar"); }
    };

    const handleResetToPending = async (confirmationId) => {
        if(!window.confirm("¿Resetear a Pendiente? Se borrará la respuesta actual.")) return;
        try {
            let ref = USE_YOUR_OWN_DB ? doc(db, 'confirmations', confirmationId) : doc(db, 'artifacts', appId, 'public', 'data', 'confirmations', confirmationId);
            await deleteDoc(ref);
        } catch(e) { alert("Error al resetear: " + e.message); }
    };
    
    // Handler para "Baja" (Mover a No Disponible) corregido para recibir confirmationId
    const handleMoveToDeclined = async (confirmationId) => {
        if (!window.confirm("¿Dar de baja a este árbitro? Pasará a 'No Disponibles'.")) return;
        try {
             let ref;
             if(USE_YOUR_OWN_DB) ref = doc(db, 'confirmations', confirmationId);
             else ref = doc(db, 'artifacts', appId, 'public', 'data', 'confirmations', confirmationId);
             await updateDoc(ref, { status: 'declined', availability: {} });
        } catch(e) { alert("Error al dar de baja: " + e.message); }
    };

    const totalConfirmed = classifiedList.confirmed.length;
    const totalCars = classifiedList.confirmed.filter(c => c.hasCar).length;
    const totalDeclined = classifiedList.declined.length;
    const totalPending = classifiedList.pending.length;

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Panel de Control</h2>
                <div className="flex flex-wrap bg-gray-200 p-1 rounded-lg self-start">
                    <button onClick={() => setActiveTab('designations')} className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'designations' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600'}`}>Designaciones</button>
                    {pendingApprovalUsers.length > 0 && <button onClick={() => setActiveTab('requests')} className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'requests' ? 'bg-white shadow-sm text-red-600 border border-red-200' : 'text-red-600 animate-pulse'}`}>Solicitudes ({pendingApprovalUsers.length})</button>}
                    <button onClick={() => setActiveTab('events')} className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'events' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600'}`}>Eventos</button>
                    <button onClick={() => setActiveTab('history')} className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600'}`}>Historial</button>
                    <button onClick={() => setActiveTab('users')} className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600'}`}>Usuarios</button>
                    <button onClick={() => setActiveTab('settings')} className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600'}`}>Configuración</button>
                    <button onClick={() => setActiveTab('tools')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'tools' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'}`}>
    Herramientas
</button>
                </div>
            </div>
            
            {/* TAB: REQUESTS (NEW) */}
            {activeTab === 'requests' && (
                <Card>
                    <div className="border-b border-gray-100 pb-4 mb-4 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-red-500" />
                        <h3 className="font-bold text-gray-800 text-lg">Solicitudes de Aprobación</h3>
                    </div>
                    {pendingApprovalUsers.length === 0 ? <p className="text-gray-500">No hay solicitudes pendientes.</p> : (
                        <div className="space-y-2">
                            {pendingApprovalUsers.map(u => (
                                <div key={u.uid} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg">
                                    <div>
                                        <p className="font-bold text-gray-900">{u.displayName}</p>
                                        <p className="text-xs text-gray-600">{u.email}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleApproveUser(u.uid)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-bold shadow hover:bg-green-700 transition-colors flex items-center gap-1"><UserCheck className="w-4 h-4"/> Aprobar</button>
                                        <button onClick={() => handleRejectUser(u.uid)} className="px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors"><UserX className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {/* TAB: DESIGNATIONS */}
            {activeTab === 'designations' && (
                <>
                    <Card className="flex flex-col md:flex-row items-center gap-4 bg-gray-50 border-gray-200">
                        <label className="text-sm font-bold text-gray-500 uppercase whitespace-nowrap">Viendo datos de:</label>
                        <select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} className="w-full md:w-auto flex-1 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5">
                            <option value="">-- Selecciona una Fecha --</option>
                            {events.map(ev => (<option key={ev.id} value={ev.id}>{ev.title} ({ev.status === 'open' ? 'Abierto' : 'Cerrado'})</option>))}
                        </select>
                    </Card>
                    {selectedEventId && currentEvent ? (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Card className="flex flex-col items-center justify-center p-4 bg-green-50 border-green-100"><span className="text-2xl font-bold text-green-600">{totalConfirmed}</span><span className="text-xs text-green-700 font-medium uppercase">Confirmados</span></Card>
                                <Card className="flex flex-col items-center justify-center p-4 bg-blue-50 border-blue-100"><span className="text-2xl font-bold text-blue-600">{totalCars}</span><span className="text-xs text-blue-700 font-medium uppercase">Autos</span></Card>
                                <Card className="flex flex-col items-center justify-center p-4 bg-red-50 border-red-100"><span className="text-2xl font-bold text-red-600">{totalDeclined}</span><span className="text-xs text-red-700 font-medium uppercase">Rechazados</span></Card>
                                <Card className="flex flex-col items-center justify-center p-4 bg-orange-50 border-orange-100"><span className="text-2xl font-bold text-orange-600">{totalPending}</span><span className="text-xs text-orange-700 font-medium uppercase">Pendientes</span></Card>
                            </div>
                            
                            <div className="space-y-4">
                                {/* CONFIRMADOS */}
                                <div className="border border-green-200 rounded-xl overflow-hidden bg-white">
                                    <div className="bg-green-50 p-4 flex justify-between items-center cursor-pointer hover:bg-green-100 transition-colors" onClick={() => toggleSection('confirmed')}>
                                        <h3 className="font-bold text-green-800 flex items-center gap-2"><CheckCircle className="w-5 h-5"/> Confirmados ({totalConfirmed})</h3>
                                        <ChevronRight className={`w-5 h-5 text-green-700 transition-transform ${openSections.confirmed ? 'rotate-90' : ''}`}/>
                                    </div>
                                    {openSections.confirmed && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm text-gray-600">
                                                <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                                                    <tr>
                                                        <th className="px-6 py-3">Árbitro</th>
                                                        {currentEvent.activeDays?.map(day => (<th key={day.id} className="px-2 py-3 text-center whitespace-nowrap">{day.label}</th>))}
                                                        <th className="px-6 py-3 text-center">Auto</th>
                                                        <th className="px-6 py-3 text-center">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {classifiedList.confirmed.map((c) => (
                                                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 font-medium text-gray-900 cursor-pointer underline decoration-green-200" onClick={() => handleViewUser(c.userId)}>{c.userName}</td>
                                                            {currentEvent.activeDays?.map(day => (
                                                                <td key={day.id} className="px-2 py-4 text-center">
                                                                    {c.availability && c.availability[day.id] ? <span className="inline-block w-3 h-3 bg-green-500 rounded-full"/> : <span className="inline-block w-3 h-3 bg-gray-200 rounded-full"/>}
                                                                </td>
                                                            ))}
                                                            <td className="px-6 py-4 text-center">{c.hasCar ? <Car className="w-5 h-5 text-green-600 mx-auto" /> : <span className="text-gray-300 mx-auto">-</span>}</td>
                                                            <td className="px-6 py-4 text-center flex justify-center gap-2">
                                                                <button onClick={(e) => { e.stopPropagation(); const u = { uid: c.userId, displayName: c.userName, phone: c.userPhone }; handleManualConfirm(u, c); }} className="p-1 hover:bg-blue-50 text-blue-500 rounded cursor-pointer" title="Editar Confirmación"><Pencil className="w-4 h-4"/></button>
                                                                
                                                                <button onClick={(e) => { e.stopPropagation(); handleMoveToDeclined(c.id); }} className="p-1 hover:bg-red-50 text-red-500 rounded cursor-pointer" title="Baja"><XCircle className="w-4 h-4"/></button>
                                                                
                                                                <button onClick={(e) => { e.stopPropagation(); handleResetToPending(c.id); }} className="p-1 hover:bg-gray-50 text-gray-400 rounded cursor-pointer" title="Resetear"><RotateCcw className="w-4 h-4"/></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                {/* NO DISPONIBLES */}
                                <div className="border border-red-200 rounded-xl overflow-hidden bg-white">
                                    <div className="bg-red-50 p-4 flex justify-between items-center cursor-pointer hover:bg-red-100 transition-colors" onClick={() => toggleSection('declined')}>
                                        <h3 className="font-bold text-red-800 flex items-center gap-2"><XCircle className="w-5 h-5"/> No Disponibles ({totalDeclined})</h3>
                                        <ChevronRight className={`w-5 h-5 text-red-700 transition-transform ${openSections.declined ? 'rotate-90' : ''}`}/>
                                    </div>
                                    {openSections.declined && (
                                        <div className="divide-y divide-gray-100">
                                            {classifiedList.declined.map(c => (
                                                <div key={c.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-medium text-gray-700 cursor-pointer hover:underline" onClick={() => handleViewUser(c.userId)}>{c.userName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => {
                                                            const u = { uid: c.userId, displayName: c.userName, phone: c.userPhone };
                                                            handleManualConfirm(u, c);
                                                        }} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200 hover:bg-green-100 cursor-pointer">Confirmar</button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleResetToPending(c.id); }} className="p-1 text-gray-400 hover:bg-gray-100 rounded cursor-pointer" title="Reset"><RotateCcw className="w-4 h-4"/></button>
                                                    </div>
                                                </div>
                                            ))}
                                            {totalDeclined === 0 && <div className="p-4 text-center text-sm text-gray-400">Nadie ha rechazado aún.</div>}
                                        </div>
                                    )}
                                </div>

                                {/* PENDIENTES */}
                                <div className="border border-orange-200 rounded-xl overflow-hidden bg-white">
                                    <div className="bg-orange-50 p-4 flex justify-between items-center cursor-pointer hover:bg-orange-100 transition-colors" onClick={() => toggleSection('pending')}>
                                        <h3 className="font-bold text-orange-800 flex items-center gap-2"><Clock className="w-5 h-5"/> Pendientes ({totalPending})</h3>
                                        <ChevronRight className={`w-5 h-5 text-orange-700 transition-transform ${openSections.pending ? 'rotate-90' : ''}`}/>
                                    </div>
                                    {openSections.pending && (
                                        <div className="divide-y divide-gray-100">
                                            {classifiedList.pending.map(u => (
                                                <div key={u.uid} className="p-3 flex items-center justify-between hover:bg-gray-50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">{u.displayName?.substring(0,2).toUpperCase()}</div>
                                                        <span className="text-sm font-medium text-gray-700 cursor-pointer hover:underline" onClick={() => handleViewUser(u.uid)}>{u.displayName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={(e) => { e.stopPropagation(); handleManualConfirm(u, null); }} className="p-1 hover:bg-green-50 text-green-600 rounded border border-transparent hover:border-green-200" title="Confirmar Manual"><CheckCircle className="w-5 h-5"/></button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleMarkUnavailable(u); }} className="p-1 hover:bg-red-50 text-red-500 rounded border border-transparent hover:border-red-200" title="Marcar No Disponible"><XCircle className="w-5 h-5"/></button>
                                                        <a href={`https://wa.me/${u.phone}?text=Hola ${u.displayName}, por favor confirma disponibilidad para: ${currentEvent.title}.`} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-green-50 text-green-600 rounded"><MessageCircle className="w-5 h-5" /></a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-10 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center gap-4">
                            {events.length === 0 ? (
                                <>
                                    <p>No hay eventos creados.</p>
                                    <Button onClick={() => setActiveTab('events')}>Ir a Crear Evento</Button>
                                </>
                            ) : (
                                <p className="text-lg font-medium">👈 Selecciona una fecha arriba para ver los datos</p>
                            )}
                        </div>
                    )}
                </>
            )}
            
            {/* ... Other tabs ... */}
            {activeTab === 'history' && (
                <div className="space-y-4">
                    {pastEvents.length === 0 && <div className="text-center p-8 text-gray-400">No hay historial.</div>}
                    <div className="grid gap-4 md:grid-cols-2">
                        {pastEvents.map(ev => {
                            const stats = getStatsForEvent(ev.id);
                            return (
                                <Card key={ev.id} className="cursor-pointer hover:border-blue-300 transition-colors group" >
                                    <div className="flex justify-between items-start mb-4" onClick={() => setHistoryDetailEvent({ event: ev, ...stats })}>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600">{ev.title}</h3>
                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                <Calendar className="w-3 h-3"/> 
                                                {formatDate(ev.dateStart)} - {formatDate(ev.dateEnd)}
                                            </p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${ev.status === 'closed' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                                            {ev.status === 'closed' ? 'Cerrado' : 'Abierto'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="bg-blue-50 p-2 rounded text-blue-700 font-medium text-center">
                                            {stats.total} <span className="text-xs font-normal opacity-70 block">Confirmados</span>
                                        </div>
                                        <div className="bg-green-50 p-2 rounded text-green-700 font-medium text-center">
                                            {stats.cars} <span className="text-xs font-normal opacity-70 block">Autos</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setHistoryDetailEvent({ event: ev, ...stats })} className="w-full mt-3 text-xs font-bold text-blue-500 hover:bg-blue-50 py-2 rounded flex items-center justify-center gap-1">
                                        Ver Detalles <ChevronRight className="w-3 h-3"/>
                                    </button>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'events' && (
                <>
                    <div className="flex justify-end"><Button onClick={openCreateModal} className="w-auto px-6"><Plus className="w-4 h-4" /> Nueva Fecha</Button></div>
                    <div className="grid gap-4">
                        {events.map(ev => (
                            <Card key={ev.id} className="flex items-center justify-between p-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1"><h3 className="font-bold text-lg text-gray-900">{ev.title}</h3>{ev.status === 'open' ? (<span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 animate-pulse"><Unlock className="w-4 h-4"/> ABIERTA</span>) : (<span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200"><Lock className="w-4 h-4"/> CERRADA</span>)}</div>
                                    <div className="text-sm text-gray-500 space-y-1"><p className="flex items-center gap-2"><CalendarDays className="w-4 h-4"/> {formatDate(ev.dateStart)} - {formatDate(ev.dateEnd)}</p>{ev.deadline && (<p className="flex items-center gap-2 text-orange-600"><AlertTriangle className="w-4 h-4"/> Cierre: {formatDateTime(ev.deadline)}</p>)}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); toggleEventStatus(ev); }} className={`p-2 rounded-lg border transition-colors ${ev.status === 'open' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`} title={ev.status === 'open' ? "Cerrar fecha" : "Reabrir fecha"}>{ev.status === 'open' ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}</button>
                                    <button onClick={(e) => { e.stopPropagation(); openEditModal(ev); }} className="p-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors" title="Editar Evento"><Pencil className="w-5 h-5" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev.id); }} className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors" title="Eliminar Evento"><Trash className="w-5 h-5" /></button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </>
            )}
            {activeTab === 'users' && (
                <>
                <div className="flex justify-end mb-4"><Button onClick={() => setShowCreateUserModal(true)} className="w-auto px-4"><UserPlus className="w-4 h-4"/> Nuevo Usuario</Button></div>
                <Card className="p-0 overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">Gestión de Usuarios</h3>
                        <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">Ordenado por última conexión</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {allUsers
                            .sort((a, b) => (b.lastLogin?.seconds || 0) - (a.lastLogin?.seconds || 0)) // <--- ESTO LOS ORDENA
                            .map(u => {
                            const isCurrentUser = u.uid === user.uid;
                            return (
                                <div key={u.uid} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleViewUser(u.uid)}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-gray-900">{u.displayName}</p>
                                            {isCurrentUser && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">(Tú)</span>}
                                            {u.role === 'admin' && <Shield className="w-4 h-4 text-purple-600 fill-current opacity-50" />}
                                            {u.isApproved === false && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-red-100 text-red-600 border border-red-200">
                                                    Pendiente
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <p className="text-xs text-gray-500">{u.email}</p>
                                            {/* <--- AQUÍ SE MUESTRA EL TIEMPO ---> */}
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200 flex items-center gap-1">
                                                {formatTimeAgo(u.lastLogin)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3"><span className={`text-xs px-2 py-1 rounded capitalize font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span><div className="p-2 text-gray-400"><Eye className="w-4 h-4"/></div></div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
                </>
            )}

            {activeTab === 'settings' && (
                <Card>
                    <div className="border-b border-gray-100 pb-4 mb-4"><h3 className="font-bold text-gray-800 text-lg flex items-center gap-2"><Settings className="w-5 h-5 text-gray-500" />Configuración General</h3><p className="text-sm text-gray-500">Personaliza la apariencia de la aplicación.</p></div>
                    <form onSubmit={handleSaveSettings} className="max-w-md space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Aplicación</label>
                            <input type="text" value={settingsName} onChange={(e) => setSettingsName(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all" placeholder="Ej: Asociación de Árbitros"/>
                            <p className="text-xs text-gray-400 mt-2">Este nombre se mostrará en la barra de navegación y en la pantalla de inicio.</p>
                        </div>

                        {/* TOGGLE GOOGLE AUTH */}
                        <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <div>
                                <span className="block font-bold text-gray-800 flex items-center gap-2">
                                     <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                     Habilitar Google Sign-In
                                </span>
                                <span className="text-xs text-blue-600/80">Actívalo solo cuando tengas tu dominio verificado.</span>
                            </div>
                            <button
                                type="button" 
                                onClick={() => setSettingsGoogleEnabled(!settingsGoogleEnabled)}
                                className={`w-12 h-7 rounded-full transition-colors relative flex items-center px-1 ${settingsGoogleEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${settingsGoogleEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        
                        {/* DANGER ZONE: MANTENIMIENTO */}
                        <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${settingsMaintenanceMode ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    {settingsMaintenanceMode ? <Construction className="w-5 h-5 text-red-600"/> : <CheckCircle className="w-5 h-5 text-green-600"/>}
                                    <span className={`font-bold ${settingsMaintenanceMode ? 'text-red-700' : 'text-green-800'}`}>
                                        {settingsMaintenanceMode ? '⚠️ MANTENIMIENTO ACTIVO' : '✅ Sistema Operativo'}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-600">
                                    {settingsMaintenanceMode ? 'Los usuarios NO pueden acceder.' : 'La plataforma está abierta a todos.'}
                                </span>
                            </div>
                            <button
                                type="button" 
                                onClick={() => { if(window.confirm("¿Seguro que deseas cambiar el modo mantenimiento?")) setSettingsMaintenanceMode(!settingsMaintenanceMode); }}
                                className={`w-12 h-7 rounded-full transition-colors relative flex items-center px-1 ${settingsMaintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${settingsMaintenanceMode ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        <Button type="submit" disabled={savingSettings}>{savingSettings ? 'Guardando...' : 'Guardar Cambios'}</Button>
                    </form>
                </Card>
            )}
            {/* PESTAÑA DE HERRAMIENTAS (v1.8) */}
            {activeTab === 'tools' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <PlusCircle className="w-5 h-5 text-blue-600"/> Subir Nueva Herramienta
                        </h3>
                        <form onSubmit={handleAddTool} className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Título del botón</label>
                                <input 
                                    className="w-full p-2.5 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                                    placeholder="Ej: Reglamento 2026" 
                                    value={newTool.title} 
                                    onChange={e => setNewTool({...newTool, title: e.target.value})} 
                                />
                            </div>
                            <div className="flex-1 w-full">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Link (Google Drive / PDF)</label>
                                <input 
                                    className="w-full p-2.5 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                                    placeholder="https://..." 
                                    value={newTool.link} 
                                    onChange={e => setNewTool({...newTool, link: e.target.value})} 
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto h-[42px]">
                                Publicar
                            </Button>
                        </form>
                    </div>

                    {/* LISTA DE ARCHIVOS CARGADOS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tools.map(tool => (
                            <div key={tool.id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-gray-800 truncate">{tool.title}</h4>
                                        <a href={tool.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline truncate block">
                                            {tool.url}
                                        </a>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDeleteTool(tool.id)} 
                                    className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                                    title="Eliminar"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        
                        {tools.length === 0 && (
                            <div className="col-span-1 md:col-span-2 text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                                <p className="text-gray-400 font-medium">No hay herramientas publicadas todavía.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <Modal isOpen={showEventModal} onClose={() => setShowEventModal(false)} title={editingEventId ? "Editar Fecha" : "Crear Nueva Fecha"}>
                <form onSubmit={handleSaveEvent} className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Título</label><input required type="text" placeholder="Ej: Fecha 5 - Torneo Apertura" className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none" value={newEvent.title} onChange={(e) => handleDateChange('title', e.target.value)}/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Desde (Inicio)</label><input required type="date" className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none" value={newEvent.dateStart} onChange={(e) => handleDateChange('dateStart', e.target.value)}/></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Hasta (Fin)</label><input required type="date" className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none" value={newEvent.dateEnd} onChange={(e) => handleDateChange('dateEnd', e.target.value)}/></div>
                    </div>
                    {generatedDays.length > 0 && (
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Días de Partido</label>
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                {generatedDays.map(day => (<label key={day.id} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4 text-blue-600 rounded" checked={selectedDaysIds.includes(day.id)} onChange={() => toggleDaySelection(day.id)}/><span className="text-sm text-gray-700">{day.label}</span></label>))}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Marca solo los días que se jugará.</p>
                        </div>
                    )}
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Límite para Confirmar (Deadline)</label><input type="datetime-local" className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none" value={newEvent.deadline} onChange={(e) => handleDateChange('deadline', e.target.value)}/><p className="text-xs text-gray-400 mt-1">Después de esta hora, nadie podrá confirmar.</p></div>
                    <Button type="submit">{editingEventId ? "Guardar Cambios" : "Crear Fecha"}</Button>
                </form>
            </Modal>
            
            {/* MODALS */}
            {selectedUserId && <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} currentAdminId={user.uid} />}
            {showCreateUserModal && <CreateUserModal onClose={() => setShowCreateUserModal(false)} />}
            {manualConfirmData && <ManualConfirmModal user={manualConfirmData.user} event={manualConfirmData.event} existingConfirmation={manualConfirmData.confirmation} onClose={() => setManualConfirmData(null)} />}
            
            <Modal isOpen={!!historyDetailEvent} onClose={() => setHistoryDetailEvent(null)} title={historyDetailEvent?.event.title || 'Detalle Histórico'}>
                {historyDetailEvent && (
                    <div className="space-y-4">
                         <h3 className="font-bold text-lg">{historyDetailEvent.event.title}</h3>
                         <div className="space-y-2">
                             {historyDetailEvent.confirms.map(c => (
                                 <div key={c.id} className={`p-3 border rounded-lg flex justify-between items-center ${c.status === 'declined' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                                     <span className="font-medium text-gray-700">{c.userName}</span>
                                     <span className={`text-sm font-bold ${c.status==='declined'?'text-red-600':'text-green-600'}`}>{c.status==='declined'?'No asistió':'Asistió'}</span>
                                 </div>
                             ))}
                         </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

// 4. Layout & Routing
const MainLayout = () => {
  const { user, userData, logout, appName, maintenanceMode } = useAuth(); 
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState('home');
// --- ESTADOS PARA LA v1.8 (HERRAMIENTAS) ---
  const [tools, setTools] = useState([]);
  const [newTool, setNewTool] = useState({ title: '', link: '' });

  // --- EFECTO PARA CARGAR HERRAMIENTAS ---
  useEffect(() => {
    // Escuchamos la colección "tools" ordenada por fecha
    const q = query(collection(db, "tools"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const toolsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTools(toolsData);
    });
    return () => unsubscribe();
  }, []);

  // --- FUNCIONES ---
  const handleAddTool = async (e) => {
      e.preventDefault();
      if (!newTool.title.trim() || !newTool.link.trim()) return alert("Completa todos los campos");
      try {
          await addDoc(collection(db, "tools"), {
              title: newTool.title,
              url: newTool.link,
              createdAt: serverTimestamp()
          });
          setNewTool({ title: '', link: '' }); 
          alert("Botón creado con éxito");
      } catch (error) {
          console.error("Error:", error);
          alert("Error al crear");
      }
  };

  const handleDeleteTool = async (id) => {
      if(!confirm("¿Seguro que quieres borrar este botón?")) return;
      await deleteDoc(doc(db, "tools", id));
  };
  useEffect(() => {
    if (user && userData) {
        const syncUserDirectory = async () => {
             // Ya no necesitamos el "if" porque en tu PC siempre es la DB real
             let dirRef = doc(db, 'user_directory', user.uid);
             
             await setDoc(dirRef, {
                uid: user.uid,
                displayName: userData.displayName || 'Usuario',
                email: userData.email || '', 
                phone: userData.phone || '',
                role: userData.role || 'user',
                lastLogin: serverTimestamp() // <--- ¡ESTE ES EL RASTREADOR NUEVO!
            }, { merge: true });
        };
        syncUserDirectory();
    }
  }, [user, userData]);

  if (!userData) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  const isAdmin = userData.role === 'admin';

  if (userData.isApproved === false && !isAdmin) {
      return <PendingApprovalScreen onLogout={logout} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
       {maintenanceMode && isAdmin && (
            <div className="bg-red-600 text-white text-center text-xs font-bold py-2 sticky top-0 z-50 shadow-lg flex items-center justify-center gap-2">
                <Construction className="w-4 h-4" />
                ⚠️ MODO MANTENIMIENTO ACTIVO (Solo visible para Admins)
            </div>
      )}

      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefereeLogo className="w-8 h-8" />
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">{appName}</h1>
          </div>
          
          <div className="flex items-center gap-4">
             {/* MENU DESKTOP */}
             <div className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                 <button 
                    onClick={() => setView('home')}
                     className={`text-sm font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 ${view === 'home' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                 >
                    <Calendar className="w-4 h-4"/>
                    Disponibilidad
                 </button>
                 <button 
                    onClick={() => setView('history')}
                     className={`text-sm font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 ${view === 'history' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                 >
                    <History className="w-4 h-4"/>
                    Historial
                 </button>
             </div>

             {isAdmin && (
                <button 
                    onClick={() => setView('admin')}
                    className={`hidden md:flex text-sm font-bold px-3 py-1.5 rounded-lg transition-colors items-center gap-2 border border-blue-100 ${view === 'admin' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <LayoutDashboard className="w-4 h-4"/>
                    Panel Admin
                </button>
             )}
             
             <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>
             
             <div className="hidden md:flex items-center gap-3">
                 <button 
                    onClick={() => setView('profile')}
                    className="flex items-center gap-2 hover:bg-gray-50 p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-200"
                    title="Mi Perfil"
                 >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                        {userData.displayName?.substring(0,2).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden lg:block">{userData.displayName}</span>
                 </button>
                 <button onClick={logout} className="text-gray-500 hover:text-red-600" title="Cerrar Sesión"><LogOut className="w-5 h-5"/></button>
             </div>

             <button className="md:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X /> : <Menu />}
             </button>
          </div>
        </div>
      </header>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 p-4 absolute w-full z-30 shadow-xl animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl cursor-pointer" onClick={() => { setView('profile'); setMenuOpen(false); }}>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                    {userData.displayName?.substring(0,2).toUpperCase()}
                </div>
                <div>
                    <p className="font-bold text-gray-900">{userData.displayName}</p>
                    <p className="text-xs text-gray-500 capitalize mb-1">{userData.role}</p>
                    <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                        <UserCircle className="w-3 h-3"/> Editar Perfil
                    </span>
                </div>
            </div>
            
            <div className="space-y-1">
                <button onClick={() => {setView('home'); setMenuOpen(false)}} className={`w-full text-left p-3 font-medium rounded-lg flex items-center gap-3 ${view === 'home' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <Calendar className="w-5 h-5"/> Mi Disponibilidad
                </button>
                
                <button onClick={() => {setView('history'); setMenuOpen(false)}} className={`w-full text-left p-3 font-medium rounded-lg flex items-center gap-3 ${view === 'history' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <History className="w-5 h-5"/> Mi Historial
                </button>

                {isAdmin && (
                    <button onClick={() => {setView('admin'); setMenuOpen(false)}} className={`w-full text-left p-3 font-bold rounded-lg flex items-center gap-3 border-t border-gray-100 mt-2 ${view === 'admin' ? 'bg-blue-50 text-blue-700' : 'text-gray-800 hover:bg-gray-50'}`}>
                        <LayoutDashboard className="w-5 h-5"/> Panel Admin
                    </button>
                )}

                <button onClick={logout} className="w-full text-left p-3 text-red-600 font-medium hover:bg-red-50 rounded-lg flex items-center gap-3 mt-4 border-t border-gray-100 pt-4">
                    <LogOut className="w-5 h-5"/> Cerrar Sesión
                </button>
            </div>
        </div>
      )}

      <main className="py-6 flex-grow">
        {view === 'admin' && isAdmin ? (
          // 1. Aquí pasamos las herramientas al Admin
          <AdminDashboard 
             user={user}
             userData={userData}
             tools={tools} 
             newTool={newTool} 
             setNewTool={setNewTool} 
             handleAddTool={handleAddTool} 
             handleDeleteTool={handleDeleteTool}
          /> 
        ) : view === 'profile' ? (
          <UserProfile />
        ) : view === 'history' ? (
          <RefereeHistory />
        ) : (
          // 2. Aquí pasamos las herramientas al Árbitro (RefereeDashboard)
          <RefereeDashboard 
             user={user}
             userData={userData}
             tools={tools}
          />
        )}
      </main>

      <footer className="py-6 text-center border-t border-gray-200 mt-auto bg-white">
          <a 
            href="https://wa.me/5492914438278?text=hola%20me%20interesa%20el%20desarrollo%20de%20una%20app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-blue-600 transition-colors font-medium flex items-center justify-center gap-1"
          >
            Desarrollado por Nahuel Amado - Noxyx Devs <ExternalLink className="w-3 h-3"/> | App v2.0
          </a>
      </footer>
    </div>
  );
};

const App = () => {
  const { user, loading, maintenanceMode, userData } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando...</div>;

  if (maintenanceMode) {
      const isAdmin = userData?.role === 'admin';
      if (!user || !isAdmin) {
          return <MaintenanceScreen />;
      }
  }

  return user ? <MainLayout /> : <Login />;
};

export default function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}