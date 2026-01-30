import React, { useEffect, useState } from 'react';
import { 
  Users, 
  HelpCircle, 
  CreditCard, 
  Wallet, 
  Megaphone, 
  ArrowRight, 
  AlertTriangle,
  TrendingUp,
  Activity,
  UserPlus
} from 'lucide-react';
import { ViewState } from '../types';
import { api } from '../services/api';

interface AdminDashboardProps {
  onNavigate: (view: ViewState) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingPayments: 0,
    totalQuestions: 0,
    recentUsers: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch data in parallel for speed
        const [users, payments, questions] = await Promise.all([
          api.getAllUsers(),
          api.getPaymentRequests(),
          api.getAllQuestionsAdmin() // Note: This might be heavy if thousands of questions, acceptable for v1
        ]);

        setStats({
          totalUsers: users.length,
          activeUsers: users.filter((u: any) => u.isActive).length,
          pendingPayments: payments.filter((p: any) => p.status === 'pending').length,
          totalQuestions: questions.length,
          recentUsers: users.slice(0, 5) // Top 5 most recent
        });
      } catch (error) {
        console.error("Error loading dashboard stats", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const QuickActionCard = ({ 
    title, 
    description, 
    icon: Icon, 
    colorClass, 
    onClick, 
    badgeCount 
  }: any) => (
    <button 
      onClick={onClick}
      className={`relative overflow-hidden group p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg text-left flex flex-col justify-between h-40 ${colorClass}`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
        <Icon size={80} />
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg inline-flex text-white">
            <Icon size={24} />
          </div>
          {badgeCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse shadow-sm">
              {badgeCount} Pendientes
            </span>
          )}
        </div>
        
        <div className="mt-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-white/80 text-sm mt-1">{description}</p>
        </div>
      </div>
      
      <div className="relative z-10 flex items-center gap-2 text-white/90 text-sm font-medium mt-auto opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
        <span>Acceder ahora</span>
        <ArrowRight size={16} />
      </div>
    </button>
  );

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{isLoading ? '-' : value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome & Pending Actions Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
          <p className="text-gray-500 mt-1">Bienvenido de nuevo. Aquí tienes un resumen de hoy.</p>
        </div>
        
        {stats.pendingPayments > 0 && (
          <button 
            onClick={() => onNavigate(ViewState.ADMIN_PAYMENTS)}
            className="bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-200 flex items-center gap-3 shadow-sm hover:bg-red-100 transition-colors animate-fade-in"
          >
            <div className="bg-red-200 p-2 rounded-full">
               <AlertTriangle size={20} className="text-red-700" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm">Atención Requerida</p>
              <p className="text-xs">Tienes {stats.pendingPayments} solicitudes de pago pendientes.</p>
            </div>
            <ArrowRight size={18} className="ml-2" />
          </button>
        )}
      </div>

      {/* High Level Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Usuarios Totales" 
          value={stats.totalUsers} 
          icon={Users} 
          color="bg-blue-100 text-blue-600" 
        />
        <StatCard 
          label="Usuarios Premium" 
          value={stats.activeUsers} 
          icon={Activity} 
          color="bg-green-100 text-green-600" 
        />
        <StatCard 
          label="Preguntas Banco" 
          value={stats.totalQuestions} 
          icon={HelpCircle} 
          color="bg-amber-100 text-amber-600" 
        />
        <StatCard 
          label="Pagos Pendientes" 
          value={stats.pendingPayments} 
          icon={Wallet} 
          color="bg-purple-100 text-purple-600" 
        />
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuickActionCard 
          title="Gestión de Preguntas"
          description="Crear, editar o eliminar preguntas y temas."
          icon={HelpCircle}
          colorClass="bg-gradient-to-br from-amber-500 to-orange-600 border-amber-600"
          onClick={() => onNavigate(ViewState.ADMIN_QUESTIONS)}
        />
        
        <QuickActionCard 
          title="Usuarios"
          description="Administrar estudiantes y accesos."
          icon={Users}
          colorClass="bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-600"
          onClick={() => onNavigate(ViewState.ADMIN_USERS)}
        />
        
        <QuickActionCard 
          title="Solicitudes de Pago"
          description="Validar comprobantes de transferencia."
          icon={Wallet}
          colorClass="bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-600"
          onClick={() => onNavigate(ViewState.ADMIN_PAYMENTS)}
          badgeCount={stats.pendingPayments}
        />

        <QuickActionCard 
          title="Novedades"
          description="Publicar historias de éxito y anuncios."
          icon={Megaphone}
          colorClass="bg-gradient-to-br from-pink-500 to-rose-600 border-pink-600"
          onClick={() => onNavigate(ViewState.ADMIN_NEWS)}
        />

        <QuickActionCard 
          title="Planes y Precios"
          description="Configurar suscripciones y beneficios."
          icon={CreditCard}
          colorClass="bg-gradient-to-br from-purple-500 to-violet-600 border-purple-600"
          onClick={() => onNavigate(ViewState.ADMIN_PLANS)}
        />

        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <UserPlus size={20} className="text-gray-400" />
            Últimos Registros
          </h3>
          <div className="flex-1 overflow-hidden">
             {isLoading ? (
               <div className="space-y-3">
                 {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
               </div>
             ) : (
               <div className="space-y-3">
                 {stats.recentUsers.length > 0 ? (
                    stats.recentUsers.map((u: any) => (
                      <div key={u.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                             {u.full_name?.charAt(0) || 'U'}
                           </div>
                           <div className="flex flex-col">
                              <span className="font-medium text-gray-800 truncate max-w-[120px]">{u.full_name || 'Usuario'}</span>
                              <span className="text-xs text-gray-400 truncate max-w-[120px]">{u.email}</span>
                           </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {u.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    ))
                 ) : (
                   <p className="text-gray-400 text-sm">No hay registros recientes.</p>
                 )}
               </div>
             )}
          </div>
          <button 
             onClick={() => onNavigate(ViewState.ADMIN_USERS)}
             className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium w-full text-center border-t border-gray-100 pt-3"
          >
             Ver todos los usuarios
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;