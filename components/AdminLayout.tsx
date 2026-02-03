import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  HelpCircle, 
  Users, 
  MessageSquare, 
  CreditCard, 
  Wallet, 
  LogOut,
  Menu,
  X,
  ChevronLeft,
  BookOpen,
  Megaphone,
  PieChart
} from 'lucide-react';
import { User, ViewState } from '../types';

interface AdminLayoutProps {
  children: React.ReactNode;
  user: User;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, user, currentView, onNavigate, onLogout }) => {
  // Initialize closed to prevent blocking content on mobile load
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check screen size on mount to auto-open on desktop
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

  const handleMobileNav = (action: () => void) => {
    action();
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const NavItem = ({ view, label, icon: Icon }: { view: ViewState; label: string; icon: any }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => handleMobileNav(() => onNavigate(view))}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-r-full transition-colors duration-200 mb-1 border-l-4 ${
          isActive
            ? 'bg-amber-50 text-amber-600 border-amber-500 font-medium'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-transparent'
        }`}
      >
        <Icon size={20} />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? 'translate-x-0 lg:relative' : '-translate-x-full lg:hidden'
        }`}
      >
        <div className="h-16 lg:h-20 flex items-center justify-between px-6 border-b border-gray-100">
           <div className="flex items-center">
             <img 
               src="/logo-main-1.png" 
               alt="AnatoPlus" 
               className="h-10 w-auto" 
             />
           </div>
           {/* Desktop Close Button */}
           <button 
             onClick={() => setIsSidebarOpen(false)}
             className="hidden lg:block p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
           >
             <ChevronLeft size={20} />
           </button>
           {/* Mobile Close Button (Added for clarity) */}
           <button 
             onClick={() => setIsSidebarOpen(false)}
             className="lg:hidden p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
           >
             <X size={24} />
           </button>
        </div>

        <div className="flex-1 py-6 pr-4 overflow-y-auto custom-scrollbar">
          <NavItem view={ViewState.ADMIN_DASHBOARD} label="Dashboard" icon={LayoutDashboard} />
          <NavItem view={ViewState.ADMIN_QUESTIONS} label="Preguntas" icon={HelpCircle} />
          <NavItem view={ViewState.ADMIN_USERS} label="Usuarios" icon={Users} />
          <NavItem view={ViewState.ADMIN_PAYMENTS} label="Pagos" icon={Wallet} />
          <NavItem view={ViewState.ADMIN_FINANCES} label="Finanzas" icon={PieChart} />
          <NavItem view={ViewState.ADMIN_NEWS} label="Novedades" icon={Megaphone} />
          <NavItem view={ViewState.ADMIN_PLANS} label="Planes" icon={CreditCard} />
          <NavItem view={ViewState.ADMIN_COMMENTS} label="Comentarios" icon={MessageSquare} />
          
          <div className="mt-8 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Navegación
          </div>
          
          <button
            onClick={() => handleMobileNav(() => onNavigate(ViewState.DASHBOARD))}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-r-full text-blue-600 hover:bg-blue-50 border-l-4 border-transparent transition-colors duration-200"
          >
            <BookOpen size={20} />
            <span>Vista Estudiante</span>
          </button>

          <button
            onClick={() => handleMobileNav(onLogout)}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-r-full text-gray-500 hover:bg-red-50 hover:text-red-600 border-l-4 border-transparent transition-colors duration-200"
          >
            <LogOut size={20} />
            <span>Salir</span>
          </button>
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
              <img src="https://picsum.photos/id/64/100/100" alt="Admin" className="w-full h-full rounded-full object-cover" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">Administrador</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header (Desktop & Mobile) */}
        <header className="bg-white shadow-sm h-16 flex items-center px-4 justify-between lg:px-8 border-b border-gray-200 shrink-0">
           <div className="flex items-center gap-4">
             {/* Toggle Button */}
             <button 
               onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
               className="p-2 rounded-md text-gray-600 hover:bg-gray-100 lg:hidden"
             >
               <Menu size={24} />
             </button>
             {/* Desktop Toggle Button (Only shows when closed) */}
             {!isSidebarOpen && (
                 <button 
                   onClick={() => setIsSidebarOpen(true)} 
                   className="hidden lg:block p-2 rounded-md text-gray-600 hover:bg-gray-100"
                 >
                   <Menu size={24} />
                 </button>
             )}
             
             <h1 className="font-bold text-lg text-gray-800 truncate">
               {currentView === ViewState.ADMIN_DASHBOARD && 'Dashboard'}
               {currentView === ViewState.ADMIN_QUESTIONS && 'Gestión de Contenido'}
               {currentView === ViewState.ADMIN_USERS && 'Usuarios'}
               {currentView === ViewState.ADMIN_COMMENTS && 'Comentarios'}
               {currentView === ViewState.ADMIN_PLANS && 'Planes y Precios'}
               {currentView === ViewState.ADMIN_PAYMENTS && 'Solicitudes de Pago'}
               {currentView === ViewState.ADMIN_FINANCES && 'Finanzas y Gastos'}
               {currentView === ViewState.ADMIN_NEWS && 'Novedades y Testimonios'}
             </h1>
           </div>
           
           <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 hidden sm:block">v1.3.1</span>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;