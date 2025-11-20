import React, { useState, useEffect } from 'react';
import { getDailyLogs, searchUsers } from '../services/mockDb';
import { MealLog, User } from '../types';

interface KitchenViewProps {
    onBack: () => void;
}

const KitchenView: React.FC<KitchenViewProps> = ({ onBack }) => {
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Search / Verification
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);

  // Poll for updates every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(getDailyLogs());
      setCurrentTime(new Date());
    }, 2000);
    
    // Initial fetch
    setLogs(getDailyLogs());

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value;
      setSearchQuery(q);
      if (q.length > 1) {
          setSearchResults(searchUsers(q));
      } else {
          setSearchResults([]);
      }
  };

  return (
    <div className="bg-neutral min-h-screen text-white flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center">
            <button 
                onClick={onBack}
                className="mr-4 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm font-bold transition-colors"
            >
                ← Salir
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary tracking-wide">COCINA - PANTALLA DE PASE</h1>
        </div>
        <div className="text-right hidden md:block">
            <div className="text-3xl font-mono font-bold">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-full flex-grow p-4 gap-4">
          
          {/* Left Column: Search & Verification */}
          <div className="lg:w-1/3 flex flex-col gap-4">
              {/* Search Box */}
              <div className="bg-white text-neutral rounded-lg p-4 shadow-lg border-t-4 border-primary">
                  <h2 className="font-bold text-lg mb-3 flex items-center text-gray-800">
                      <svg className="w-6 h-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Verificar Colaborador
                  </h2>
                  <p className="text-xs text-gray-500 mb-3">Busque por nombre o ID para confirmar si ya realizó el check-in en el kiosko.</p>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full border-2 border-gray-300 rounded p-3 text-lg mb-4 focus:border-primary outline-none transition-colors"
                    placeholder="Ingrese Nombre o ID..."
                  />

                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                      {searchResults.map(user => {
                          // Check if user exists in today's logs
                          const userLog = logs.find(l => l.userId === user.id);
                          
                          return (
                            <div key={user.id} className="flex flex-col p-3 bg-gray-50 rounded border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-bold text-neutral">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.department} (ID: {user.id})</p>
                                    </div>
                                </div>
                                
                                {userLog ? (
                                    <div className="bg-green-100 border border-green-300 rounded p-2 flex items-center justify-center text-green-800">
                                        <div className="text-center">
                                            <p className="font-bold text-sm flex items-center justify-center">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                VERIFICADO
                                            </p>
                                            <p className="text-xs">Ingresó a las {new Date(userLog.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-red-50 border border-red-200 rounded p-2 flex items-center justify-center text-red-800 opacity-80">
                                        <div className="text-center">
                                            <p className="font-bold text-sm flex items-center justify-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                SIN CHECK-IN
                                            </p>
                                            <p className="text-xs">Debe pasar por el Kiosko</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                          );
                      })}
                      
                      {searchQuery.length > 1 && searchResults.length === 0 && (
                          <div className="text-center py-4">
                              <p className="text-gray-400 text-sm font-semibold">Usuario no encontrado en base de datos.</p>
                          </div>
                      )}
                  </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gray-800 rounded-lg p-4 flex-grow shadow-lg border border-gray-700">
                <h3 className="text-gray-400 text-sm font-bold uppercase mb-4 tracking-wider">Resumen del Día</h3>
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gray-700 p-4 rounded flex justify-between items-center">
                        <span className="text-gray-300">Total Platos</span>
                        <span className="text-3xl font-bold text-white">{logs.length}</span>
                    </div>
                    <div className="bg-gray-700 p-4 rounded flex justify-between items-center border-l-4 border-success">
                        <span className="text-gray-300">Estándar</span>
                        <span className="text-3xl font-bold text-white">{logs.filter(l => l.type === 'STANDARD').length}</span>
                    </div>
                    <div className="bg-gray-700 p-4 rounded flex justify-between items-center border-l-4 border-secondary">
                        <span className="text-gray-300">Extras/Invitados</span>
                        <span className="text-3xl font-bold text-white">{logs.filter(l => l.type === 'EXTRA').length}</span>
                    </div>
                </div>
              </div>
          </div>

          {/* Right Column: Live Feed */}
          <div className="lg:w-2/3 bg-white rounded-lg overflow-hidden text-gray-900 flex flex-col shadow-xl border-t-4 border-secondary">
            <div className="bg-gray-100 p-4 font-bold grid grid-cols-12 gap-4 text-sm uppercase text-gray-500 border-b border-gray-200">
                <div className="col-span-2">Hora</div>
                <div className="col-span-6">Comensal</div>
                <div className="col-span-4">Detalle</div>
            </div>
            <div className="divide-y divide-gray-100 overflow-y-auto flex-grow bg-white">
                {logs.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 text-xl h-full flex flex-col items-center justify-center opacity-60">
                        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p>Esperando registros de consumo...</p>
                    </div>
                ) : (
                    logs.map((log, index) => (
                        <div key={log.id} className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors ${index === 0 ? 'bg-orange-50 animate-pulse' : 'hover:bg-gray-50'}`}>
                            <div className="col-span-2 font-mono text-lg font-bold text-gray-600">
                                {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                            <div className="col-span-6">
                                <div className="text-xl font-bold text-neutral truncate">{log.userName}</div>
                                {index === 0 && <span className="text-[10px] font-bold text-secondary uppercase tracking-widest border border-secondary px-1 rounded ml-1">Nuevo</span>}
                            </div>
                            <div className="col-span-4">
                                {log.type === 'STANDARD' ? (
                                    <span className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                        Colaborador
                                    </span>
                                ) : (
                                    <div className="flex flex-col items-start">
                                        <span className="inline-flex items-center bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-1">
                                            Visitante
                                        </span>
                                        <span className="text-xs text-gray-500 truncate max-w-full" title={log.details}>
                                            {log.details}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
          </div>

      </div>
    </div>
  );
};

export default KitchenView;