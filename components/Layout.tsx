import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  BarChart2, 
  User as UserIcon, 
  LogOut, 
  Menu,
  X,
  ShieldCheck,
  Crown,
  Moon,
  Sun
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Default to light mode as requested, only use dark if explicitly set previously
    if (typeof window !== 'undefined') {
        return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const NavItem = ({ view, label, icon: Icon }: { view: ViewState; label: string; icon: any }) => (
    <button
      onClick={() => {
        onNavigate(view);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg transition-colors duration-200 ${
        currentView === view || (currentView === ViewState.QUIZ && view === ViewState.DASHBOARD) || (currentView === ViewState.MODULE_TOPICS && view === ViewState.DASHBOARD)
          ? 'bg-amber-100 text-amber-700 font-medium dark:bg-amber-900/40 dark:text-amber-400'
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
      }`}
      title={label}
    >
      <Icon size={20} className="shrink-0" />
      <span className="hidden lg:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm dark:bg-slate-800 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer gap-2" onClick={() => onNavigate(ViewState.DASHBOARD)}>
              {/* Logo / Brand */}
              <div className="flex-shrink-0 flex items-center">
                 <img 
                   src="/logo-main-1.png" 
                   alt="AnatoPlus" 
                   className="h-8 md:h-10 w-auto" 
                 />
              </div>
            </div>

            {/* Desktop/Tablet Navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-4">
              <NavItem view={ViewState.DASHBOARD} label="Módulos" icon={BookOpen} />
              <NavItem view={ViewState.PERFORMANCE} label="Desempeño" icon={BarChart2} />
              
              <button 
                  onClick={() => onNavigate(ViewState.SUBSCRIPTION)}
                  className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg transition-colors duration-200 ${
                      user.isActive 
                      ? 'text-gray-400 hover:text-amber-500 dark:text-gray-400 dark:hover:text-amber-400' 
                      : 'bg-amber-100 text-amber-700 font-bold border border-amber-200 animate-pulse dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                  }`}
                  title="Planes Premium"
              >
                  <Crown size={20} className="shrink-0" />
                  <span className="hidden lg:inline">{user.isActive ? 'Mi Plan' : 'Ser Premium'}</span>
              </button>

              {/* ADMIN BUTTON */}
              {user.role === 'admin' && (
                <button
                  onClick={() => onNavigate(ViewState.ADMIN_DASHBOARD)}
                  className="flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600"
                  title="Panel Admin"
                >
                  <ShieldCheck size={20} className="shrink-0" />
                  <span className="hidden lg:inline">Panel Admin</span>
                </button>
              )}
              
              <div className="h-6 w-px bg-gray-200 mx-2 dark:bg-slate-700" />
              
              <div className="flex items-center space-x-3 ml-2">
                {/* Dark Mode Toggle */}
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700 transition-colors"
                  title="Cambiar Tema"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900 max-w-[120px] truncate dark:text-gray-100">{user.name}</span>
                  <span className="text-xs text-gray-500 capitalize dark:text-gray-400">{user.role === 'admin' ? 'Admin' : 'Estudiante'}</span>
                </div>
                
                <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0 dark:bg-slate-700 dark:border-slate-600 dark:text-amber-400">
                  <UserIcon size={16} />
                </div>
                
                <button 
                  onClick={onLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors dark:hover:text-red-400"
                  title="Cerrar Sesión"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </nav>

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 md:hidden">
              <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700"
              >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none dark:hover:bg-slate-800"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full z-40 dark:bg-slate-800 dark:border-slate-700">
            <div className="px-4 pt-4 pb-2 border-b border-gray-100 mb-2 dark:border-slate-700">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize dark:text-gray-400">{user.role === 'admin' ? 'Administrador' : 'Estudiante'}</p>
            </div>
            <div className="px-2 pb-3 space-y-1 sm:px-3">
              <button onClick={() => { onNavigate(ViewState.DASHBOARD); setIsMobileMenuOpen(false); }} className="flex w-full items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium dark:text-gray-300 dark:hover:bg-slate-700">
                  <BookOpen size={20} /> <span>Módulos</span>
              </button>
              <button onClick={() => { onNavigate(ViewState.PERFORMANCE); setIsMobileMenuOpen(false); }} className="flex w-full items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium dark:text-gray-300 dark:hover:bg-slate-700">
                  <BarChart2 size={20} /> <span>Desempeño</span>
              </button>
              
              <button
                onClick={() => {
                    onNavigate(ViewState.SUBSCRIPTION);
                    setIsMobileMenuOpen(false);
                }}
                className="flex w-full items-center space-x-3 px-4 py-3 rounded-lg text-amber-600 font-bold hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-slate-700"
              >
                <Crown size={20} />
                <span>Planes Premium</span>
              </button>

              {user.role === 'admin' && (
                 <button
                    onClick={() => {
                        onNavigate(ViewState.ADMIN_DASHBOARD);
                        setIsMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center space-x-3 px-4 py-3 rounded-lg text-gray-800 font-bold hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-700"
                  >
                    <ShieldCheck size={20} />
                    <span>Panel Admin</span>
                  </button>
              )}

              <div className="border-t border-gray-100 my-2 pt-2 dark:border-slate-700">
                <button
                    onClick={onLogout}
                    className="flex w-full items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-slate-700"
                >
                    <LogOut size={20} />
                    <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-auto dark:bg-slate-800 dark:border-slate-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} AnatoPlus. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;