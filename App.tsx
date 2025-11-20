import React, { useState } from 'react';
import KioskView from './views/KioskView';
import AdminView from './views/AdminView';
import KitchenView from './views/KitchenView';
import { ViewState } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('KIOSK');

  // In a real app, Kitchen View would be a separate URL
  if (view === 'KITCHEN_DISPLAY') {
      return (
          <KitchenView onBack={() => setView('KIOSK')} />
      );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => setView('KIOSK')}>
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3">
              C
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral leading-tight">Corporativo</h1>
              <p className="text-xs text-gray-500 tracking-wider uppercase">Servicios de Alimentación</p>
            </div>
          </div>
          
          <nav className="flex items-center space-x-2">
             {view !== 'KIOSK' && (
                <button 
                  onClick={() => setView('KIOSK')}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-100"
                >
                  Ir al Kiosko
                </button>
             )}
             
             {view === 'KIOSK' && (
                 <>
                    <button 
                      onClick={() => setView('ADMIN_LOGIN')}
                      className="px-4 py-2 rounded-md text-sm font-medium bg-neutral text-white hover:bg-gray-800"
                    >
                      Gestión (Jefes/Admin)
                    </button>
                    <button 
                      onClick={() => setView('KITCHEN_DISPLAY')}
                      className="px-4 py-2 rounded-md text-sm font-medium text-secondary border border-secondary hover:bg-orange-50"
                    >
                      Pantalla Cocina
                    </button>
                 </>
             )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {view === 'KIOSK' && <KioskView />}
        {(view === 'ADMIN_LOGIN' || view === 'ADMIN_DASHBOARD') && (
          <AdminView onLogout={() => setView('KIOSK')} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Sistema de Gestión de Comedores. </p>
        </div>
      </footer>
    </div>
  );
};

export default App;