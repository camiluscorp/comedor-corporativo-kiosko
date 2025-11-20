import React, { useState, useEffect } from 'react';
import { User, UserRole, MealLog, GuestTicket } from '../types';
import { getUserById, getStats, createGuestTickets, getDailyLogs } from '../services/mockDb';
import { generateKitchenNotification, analyzeDailyConsumption } from '../services/geminiService';

interface AdminViewProps {
  onLogout: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({ onLogout }) => {
  // Auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Dashboard
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'REQUEST'>('DASHBOARD');
  const [stats, setStats] = useState({ standard: 0, extra: 0, total: 0 });
  const [logs, setLogs] = useState<MealLog[]>([]);
  
  // AI
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Guest Request Form
  const [guestList, setGuestList] = useState<{name: string, reason: string}[]>([]);
  const [tempName, setTempName] = useState('');
  const [tempReason, setTempReason] = useState('');
  const [bulkText, setBulkText] = useState(''); // New for Bulk Upload
  const [showBulkInput, setShowBulkInput] = useState(false); // Toggle Bulk Input
  
  const [generatedTickets, setGeneratedTickets] = useState<GuestTicket[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshData = () => {
    setStats(getStats());
    setLogs(getDailyLogs());
  };

  useEffect(() => {
    if (isAuthenticated) refreshData();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = getUserById(loginId);
    // Allow Admin and Managers
    if (user && (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER)) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Acceso denegado: ID no válido o sin permisos de gestión.');
    }
  };

  const handleAddGuest = () => {
    if (!tempName || !tempReason) return;
    setGuestList([...guestList, { name: tempName, reason: tempReason }]);
    setTempName('');
    // Keep reason if multiple guests from same company
  };

  const handleBulkParse = () => {
    if (!bulkText.trim()) return;
    
    const lines = bulkText.split('\n');
    const newGuests: {name: string, reason: string}[] = [];
    
    lines.forEach(line => {
        // Simple CSV parse: Name, Reason
        const parts = line.split(',');
        if (parts.length >= 1) {
            const name = parts[0].trim();
            const reason = parts[1] ? parts[1].trim() : (tempReason || 'Visita General');
            if (name) {
                newGuests.push({ name, reason });
            }
        }
    });

    setGuestList([...guestList, ...newGuests]);
    setBulkText('');
    setShowBulkInput(false);
  };

  const handleRemoveGuest = (index: number) => {
    const newList = [...guestList];
    newList.splice(index, 1);
    setGuestList(newList);
  };

  const handleRequestSubmit = async () => {
    if (!currentUser || guestList.length === 0) return;
    
    setIsSubmitting(true);
    
    // 1. Generate Tickets
    const newTickets = createGuestTickets(currentUser.id, guestList);
    setGeneratedTickets(newTickets);

    // 2. Notify Kitchen (AI)
    const reasonSummary = guestList.map(g => `${g.name} (${g.reason})`).join(', ');
    await generateKitchenNotification(currentUser.name, guestList.length, reasonSummary);
    
    setIsSubmitting(false);
    setGuestList([]);
    setTempReason('');
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const analysis = await analyzeDailyConsumption(logs);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 border-secondary">
          <h2 className="text-2xl font-bold text-neutral mb-6">Gestión de Comedor</h2>
          <p className="mb-4 text-sm text-gray-600">Acceso para Jefes de Área y Administradores.</p>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">ID / Cédula</label>
              <input 
                type="text" 
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Ej: 1001 (Admin) o 1002 (Jefe)"
                autoFocus
              />
            </div>
            {loginError && <p className="text-error text-sm mb-4">{loginError}</p>}
            <button type="submit" className="w-full bg-neutral text-white font-bold py-3 px-4 rounded hover:bg-gray-800 transition-colors">
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-neutral">Panel de Gestión</h2>
          <p className="text-gray-500">Hola, {currentUser?.name} ({currentUser?.department})</p>
        </div>
        <button onClick={onLogout} className="text-error font-semibold hover:underline mt-4 md:mt-0">
          Cerrar Sesión
        </button>
      </div>

      <div className="flex space-x-4 mb-6 border-b border-gray-200 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('DASHBOARD')}
          className={`py-2 px-4 font-semibold whitespace-nowrap ${activeTab === 'DASHBOARD' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
        >
          Reportes
        </button>
        <button 
          onClick={() => setActiveTab('REQUEST')}
          className={`py-2 px-4 font-semibold whitespace-nowrap ${activeTab === 'REQUEST' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
        >
          Solicitar Platos (Visitas)
        </button>
      </div>

      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-primary">
              <h3 className="text-xs font-bold uppercase text-gray-500">Total Hoy</h3>
              <p className="text-4xl font-bold text-neutral">{stats.total}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-success">
              <h3 className="text-xs font-bold uppercase text-gray-500">Colaboradores</h3>
              <p className="text-4xl font-bold text-neutral">{stats.standard}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-secondary">
              <h3 className="text-xs font-bold uppercase text-gray-500">Invitados/Extras</h3>
              <p className="text-4xl font-bold text-neutral">{stats.extra}</p>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-2">
               <h3 className="font-bold text-lg text-purple-800">Análisis Inteligente (Gemini)</h3>
               <button onClick={handleAnalyze} disabled={isAnalyzing} className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                 {isAnalyzing ? 'Pensando...' : 'Actualizar Análisis'}
               </button>
            </div>
            <p className="text-sm text-purple-900 leading-relaxed bg-purple-50 p-4 rounded-lg">
              {aiAnalysis || "Solicita un análisis para ver tendencias y anomalías en el consumo del comedor."}
            </p>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 font-bold text-neutral">Registro Detallado (Tiempo Real)</div>
             <div className="max-h-[400px] overflow-y-auto">
               <table className="w-full text-left">
                 <thead className="bg-gray-50 sticky top-0">
                   <tr>
                     <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Hora</th>
                     <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nombre</th>
                     <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Area/Detalle</th>
                     <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tipo</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {logs.map((log) => (
                     <tr key={log.id} className="hover:bg-gray-50">
                       <td className="px-6 py-4 text-sm text-gray-500">{new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                       <td className="px-6 py-4 text-sm font-medium text-neutral">{log.userName}</td>
                       <td className="px-6 py-4 text-sm text-gray-500">{log.type === 'STANDARD' ? log.department : log.details}</td>
                       <td className="px-6 py-4 text-sm">
                           <span className={`px-2 py-1 text-xs rounded-full ${log.type === 'STANDARD' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                               {log.type === 'STANDARD' ? 'Colaborador' : 'Invitado'}
                           </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'REQUEST' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4 text-neutral">Registrar Visitantes / Platos Extra</h3>
            <p className="text-sm text-gray-500 mb-6">Agregue cada persona individualmente para generar su ticket de comida.</p>
            
            {/* Manual Input */}
            <div className="space-y-4 mb-6 border-b pb-6 border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Nombre Completo</label>
                    <input 
                        className="w-full border p-2 rounded" 
                        value={tempName} 
                        onChange={e => setTempName(e.target.value)}
                        placeholder="Ej: Juan Pérez" 
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Empresa / Motivo</label>
                    <input 
                        className="w-full border p-2 rounded" 
                        value={tempReason} 
                        onChange={e => setTempReason(e.target.value)}
                        placeholder="Ej: Auditoría" 
                    />
                </div>
              </div>
              <button 
                onClick={handleAddGuest}
                className="w-full bg-gray-100 text-neutral font-bold py-2 rounded hover:bg-gray-200 border border-gray-300"
              >
                + Agregar Individual
              </button>
              
              <div className="text-center">
                  <span className="text-xs text-gray-400 uppercase">--- O ---</span>
                  <button 
                    onClick={() => setShowBulkInput(!showBulkInput)}
                    className="block w-full text-sm text-primary underline mt-2"
                  >
                    {showBulkInput ? 'Ocultar Carga Masiva' : 'Carga Masiva (Copiar/Pegar)'}
                  </button>
              </div>

              {/* Bulk Input Area */}
              {showBulkInput && (
                  <div className="bg-blue-50 p-4 rounded border border-blue-100 animate-fadeIn">
                      <label className="block text-xs font-bold text-blue-800 mb-1">Pegar lista (Nombre, Motivo)</label>
                      <textarea
                        className="w-full border p-2 rounded text-sm h-24"
                        placeholder="Juan Perez, Visita&#10;Maria Lopez, Proveedor&#10;Carlos Ruiz"
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                      />
                      <button 
                        onClick={handleBulkParse}
                        className="mt-2 bg-blue-600 text-white text-xs font-bold py-2 px-4 rounded hover:bg-blue-700"
                      >
                        Procesar Lista
                      </button>
                  </div>
              )}

            </div>

            {/* List Builder */}
            <div className="mb-6">
                <h4 className="font-bold text-sm mb-2">Lista de Solicitud ({guestList.length})</h4>
                {guestList.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No hay personas en la lista.</p>
                ) : (
                    <ul className="space-y-2 max-h-[300px] overflow-y-auto">
                        {guestList.map((g, idx) => (
                            <li key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200">
                                <div>
                                    <p className="font-bold text-sm">{g.name}</p>
                                    <p className="text-xs text-gray-500">{g.reason}</p>
                                </div>
                                <button onClick={() => handleRemoveGuest(idx)} className="text-red-500 text-sm font-bold px-2">X</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <button 
                onClick={handleRequestSubmit}
                disabled={isSubmitting || guestList.length === 0}
                className="w-full bg-secondary text-white font-bold py-3 rounded shadow hover:bg-orange-600 disabled:bg-orange-300 transition-colors"
            >
                {isSubmitting ? 'Generando...' : 'Generar Tickets y Notificar Cocina'}
            </button>
          </div>

          {/* Generated Tickets Output */}
          <div>
              {generatedTickets.length > 0 ? (
                  <div className="bg-green-50 border border-green-200 p-6 rounded-lg shadow-sm">
                      <h3 className="text-green-800 font-bold text-lg mb-4">¡Tickets Generados!</h3>
                      <p className="text-sm text-green-700 mb-4">Comparta estos códigos con los visitantes. Deben ingresarlos en el kiosko.</p>
                      <div className="grid gap-4 max-h-[600px] overflow-y-auto">
                          {generatedTickets.map((t) => (
                              <div key={t.code} className="bg-white p-4 border-l-4 border-green-500 rounded shadow flex justify-between items-center">
                                  <div>
                                      <p className="text-xs text-gray-500">Código de Almuerzo</p>
                                      <p className="text-3xl font-mono font-bold tracking-widest text-neutral">{t.code}</p>
                                  </div>
                                  <div className="text-right">
                                      <p className="font-bold text-sm">{t.visitorName}</p>
                                      <p className="text-xs text-gray-500">{t.companyOrReason}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                      <button 
                        onClick={() => setGeneratedTickets([])}
                        className="mt-6 text-sm text-green-700 underline hover:text-green-900"
                      >
                          Limpiar pantalla
                      </button>
                  </div>
              ) : (
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 h-full flex flex-col justify-center items-center text-center text-gray-400">
                      <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                      <p>Aquí aparecerán los códigos de ticket generados.</p>
                  </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;