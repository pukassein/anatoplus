import React from 'react';
import { 
  BookOpen, 
  BarChart2, 
  User as UserIcon, 
  LogOut, 
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';
import { User, ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, currentView, onNavigate, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const NavItem = ({ view, label, icon: Icon }: { view: ViewState; label: string; icon: any }) => (
    <button
      onClick={() => {
        onNavigate(view);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
        currentView === view || (currentView === ViewState.QUIZ && view === ViewState.DASHBOARD) || (currentView === ViewState.MODULE_TOPICS && view === ViewState.DASHBOARD)
          ? 'bg-amber-100 text-amber-700 font-medium'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => onNavigate(ViewState.DASHBOARD)}>
              {/* Logo / Brand */}
              <div className="flex-shrink-0 flex items-center">
                 <img 
                   src="/logo-main-1.png" 
                   alt="AnatoPlus" 
                   className="h-10 w-auto" 
                 />
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <NavItem view={ViewState.DASHBOARD} label="Módulos" icon={BookOpen} />
              <NavItem view={ViewState.PERFORMANCE} label="Desempeño" icon={BarChart2} />
              
              {/* ADMIN BUTTON */}
              {user.role === 'admin' && (
                <button
                  onClick={() => onNavigate(ViewState.ADMIN_DASHBOARD)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                >
                  <ShieldCheck size={20} />
                  <span>Panel Admin</span>
                </button>
              )}
              
              <div className="h-6 w-px bg-gray-200 mx-2" />
              
              <div className="flex items-center space-x-3 ml-2">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                  <span className="text-xs text-gray-500 capitalize">{user.role === 'admin' ? 'Administrador' : 'Estudiante'}</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center border border-amber-200">
                  <UserIcon size={16} />
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </nav>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <NavItem view={ViewState.DASHBOARD} label="Módulos" icon={BookOpen} />
              <NavItem view={ViewState.PERFORMANCE} label="Desempeño" icon={BarChart2} />
              
              {user.role === 'admin' && (
                 <button
                    onClick={() => {
                        onNavigate(ViewState.ADMIN_DASHBOARD);
                        setIsMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center space-x-2 px-4 py-2 rounded-lg text-gray-800 font-bold hover:bg-gray-100"
                  >
                    <ShieldCheck size={20} />
                    <span>Ir a Panel Admin</span>
                  </button>
              )}

              <button
                onClick={onLogout}
                className="flex w-full items-center space-x-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50"
              >
                <LogOut size={20} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} AnatoPlus. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;