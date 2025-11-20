import React, { useState } from 'react';
import Keypad from '../components/Keypad';
import Modal from '../components/Modal';
import { checkInUser } from '../services/mockDb';

const KioskView: React.FC = () => {
  const [inputId, setInputId] = useState('');
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'success' | 'error'; title: string; message: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleKeyPress = (key: string) => {
    if (inputId.length < 10) {
      setInputId((prev) => prev + key);
    }
  };

  const handleDelete = () => {
    setInputId((prev) => prev.slice(0, -1));
  };
  
  const handleClear = () => {
    setInputId('');
  }

  const handleSubmit = () => {
    if (inputId.length === 0) return;
    
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      const result = checkInUser(inputId);
      setIsLoading(false);
      
      if (result.success) {
        setModalState({
          isOpen: true,
          type: 'success',
          title: result.userName || 'Bienvenido',
          message: result.message
        });
        setInputId('');
      } else {
        setModalState({
          isOpen: true,
          type: 'error',
          title: 'No Autorizado',
          message: result.message
        });
        if (result.message.includes('no encontrado')) {
            setInputId('');
        }
      }
    }, 600);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4 bg-slate-50 relative">
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3">Comedor Corporativo</h1>
        <p className="text-gray-600 text-lg font-medium">Ingrese su ID de Colaborador o Código de Ticket</p>
      </div>

      <div className="mb-6 w-full max-w-xs">
        <div className={`w-full h-20 bg-white border-2 rounded-xl flex items-center justify-center text-4xl font-mono tracking-widest shadow-sm ${isLoading ? 'bg-gray-100 text-gray-400 border-gray-300' : 'border-primary text-gray-800'}`}>
          {inputId || <span className="text-gray-300 opacity-40">_ _ _ _ _ _</span>}
        </div>
      </div>

      <Keypad 
        onPress={handleKeyPress} 
        onDelete={handleDelete} 
        onSubmit={handleSubmit} 
        onClear={handleClear}
        disabled={isLoading}
      />

      {/* Menu Button */}
      <button 
        onClick={() => setShowMenu(true)}
        className="mt-8 bg-emerald-600 text-white px-8 py-3 rounded-full shadow-lg font-bold text-lg hover:bg-emerald-700 transition-transform hover:scale-105 flex items-center"
      >
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
        Ver Menú de Hoy
      </button>

      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        autoClose={true}
      />

      {/* Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fadeIn">
             <button 
                onClick={() => setShowMenu(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"
             >
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>

             <h2 className="text-3xl font-bold text-center text-primary mb-2">Menú del Día</h2>
             <p className="text-center text-gray-500 mb-8">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
             
             <div className="space-y-6">
                 <div>
                    <h3 className="text-secondary font-bold uppercase text-sm tracking-wider mb-1">Entrada</h3>
                    <p className="text-lg font-medium text-neutral">Crema de Zapallo con Croutons</p>
                 </div>
                 <div>
                    <h3 className="text-secondary font-bold uppercase text-sm tracking-wider mb-1">Plato Principal</h3>
                    <p className="text-lg font-medium text-neutral">Lomo Saltado Clásico</p>
                    <p className="text-sm text-gray-500">o</p>
                    <p className="text-lg font-medium text-neutral">Pollo al Horno con Puré</p>
                 </div>
                 <div>
                    <h3 className="text-secondary font-bold uppercase text-sm tracking-wider mb-1">Opción Vegetariana</h3>
                    <p className="text-lg font-medium text-neutral">Lasaña de Berenjenas</p>
                 </div>
                 <div>
                    <h3 className="text-secondary font-bold uppercase text-sm tracking-wider mb-1">Postre</h3>
                    <p className="text-lg font-medium text-neutral">Mousse de Maracuyá</p>
                 </div>
             </div>

             <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-400 italic">Incluye bebida y pan.</p>
                <button 
                  onClick={() => setShowMenu(false)}
                  className="mt-4 w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Volver al Kiosko
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KioskView;