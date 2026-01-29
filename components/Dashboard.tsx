import React, { useState } from 'react';
import { Module, User } from '../types';
import { PlayCircle, Award, TrendingUp, Settings, Zap, Shuffle, CheckCircle2, X, Lock, Crown } from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip 
} from 'recharts';

interface DashboardProps {
  user: User;
  modules: Module[];
  onSelectModule: (module: Module) => void;
  onViewReports: () => void;
  onStartCustomSession: (moduleIds: string[], isRandom: boolean) => void;
  onOpenSubscription: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  modules, 
  onSelectModule, 
  onViewReports,
  onStartCustomSession,
  onOpenSubscription
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [isRandom, setIsRandom] = useState(false);

  // --- CALCULATE REAL STATS ---
  
  const activeModules = modules.filter(m => m.progress > 0);
  const activeModulesCount = activeModules.length;
  
  // Average score of started modules (Best scores)
  const averageScore = activeModulesCount > 0 
    ? Math.round(activeModules.reduce((acc, m) => acc + m.progress, 0) / activeModulesCount) 
    : 0;

  // Global completion across all available modules
  const globalCompletion = modules.length > 0 
    ? Math.round(modules.reduce((acc, m) => acc + m.progress, 0) / modules.length)
    : 0;

  // Prepare data for the mini radar chart (Top 6 modules to keep it clean)
  const radarData = modules.slice(0, 6).map(m => ({
    subject: m.title.length > 12 ? m.title.substring(0, 9) + '...' : m.title,
    progress: m.progress,
    fullMark: 100,
  }));

  const toggleModuleSelection = (id: string) => {
    setSelectedModuleIds(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const handleStartSession = () => {
    if (selectedModuleIds.length === 0) return;
    onStartCustomSession(selectedModuleIds, isRandom);
    setIsModalOpen(false);
  };

  const selectAll = () => {
    if (selectedModuleIds.length === modules.length) {
      setSelectedModuleIds([]);
    } else {
      setSelectedModuleIds(modules.map(m => m.id));
    }
  };

  const isLocked = !user.isActive && user.role !== 'admin';

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in relative">
      
      {/* Inactive Banner */}
      {isLocked && (
          <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-4 md:p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 animate-scale-up">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm shrink-0">
                      <Lock size={24} md:size={32} />
                  </div>
                  <div>
                      <h2 className="text-lg md:text-xl font-bold">Acceso Limitado</h2>
                      <p className="text-red-100 text-sm md:text-base">Tu cuenta está en modo gratuito. Activa un plan para acceder a todo.</p>
                  </div>
              </div>
              <button 
                onClick={onOpenSubscription}
                className="w-full md:w-auto whitespace-nowrap bg-white text-red-600 px-6 py-2 md:py-3 rounded-lg font-bold hover:bg-red-50 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                  <Crown size={20} />
                  Obtener Acceso
              </button>
          </div>
      )}

      {/* Hero Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between overflow-hidden relative">
        <div className="relative z-10 max-w-xl w-full">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">
            ¡Hola, <span className="text-amber-600">{user.name.split(' ')[0]}</span>!
          </h1>
          <p className="text-gray-600 text-sm md:text-lg mb-6 leading-relaxed">
            Gestiona tus preguntas y sigue tu progreso en tiempo real.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
             <button 
               onClick={() => setIsModalOpen(true)}
               disabled={isLocked}
               className={`px-6 py-3 rounded-lg font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
                   isLocked 
                   ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                   : 'bg-amber-500 hover:bg-amber-600 text-white'
               }`}
             >
                <Zap size={20} />
                Continuar Estudio
             </button>
             <button 
               onClick={onViewReports}
               className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium transition-colors active:scale-95 flex items-center justify-center"
             >
                Ver Reportes
             </button>
          </div>
        </div>
        
        {/* Radar Chart Visualization (Hidden on small screens to save space) */}
        <div className="hidden lg:flex flex-col items-center justify-center relative z-10 h-72 w-96 -mr-8">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#fef3c7" /> {/* amber-100 */}
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#d97706', fontSize: 11, fontWeight: 600 }} // amber-600
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Mi Progreso"
                dataKey="progress"
                stroke="#F59E0B" // amber-500
                strokeWidth={2}
                fill="#FCD34D" // amber-300
                fillOpacity={0.6}
              />
              <Tooltip 
                cursor={false}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: '#F59E0B', fontWeight: 'bold' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Decor items */}
        <div className="absolute right-0 top-0 w-1/3 h-full bg-amber-50 skew-x-12 opacity-50 z-0 pointer-events-none"></div>
      </div>

      {/* Stats Overview Mini - Grid for Mobile */}
      <div className="grid grid-cols-3 gap-3 md:gap-6">
        <div className="bg-white p-3 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-2 md:gap-4">
           <div className="p-2 md:p-3 bg-blue-100 text-blue-600 rounded-lg shrink-0">
             <PlayCircle size={20} className="md:w-6 md:h-6" />
           </div>
           <div>
             <p className="text-xs text-gray-500 hidden md:block">Módulos</p>
             <p className="text-sm md:text-xl font-bold text-gray-900">{activeModulesCount}/{modules.length}</p>
             <p className="text-[10px] text-gray-500 md:hidden">Módulos</p>
           </div>
        </div>
        <div className="bg-white p-3 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-2 md:gap-4">
           <div className="p-2 md:p-3 bg-green-100 text-green-600 rounded-lg shrink-0">
             <Award size={20} className="md:w-6 md:h-6" />
           </div>
           <div>
             <p className="text-xs text-gray-500 hidden md:block">Promedio</p>
             <p className="text-sm md:text-xl font-bold text-gray-900">{averageScore}%</p>
             <p className="text-[10px] text-gray-500 md:hidden">Puntaje</p>
           </div>
        </div>
        <div className="bg-white p-3 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-2 md:gap-4">
           <div className="p-2 md:p-3 bg-purple-100 text-purple-600 rounded-lg shrink-0">
             <TrendingUp size={20} className="md:w-6 md:h-6" />
           </div>
           <div>
             <p className="text-xs text-gray-500 hidden md:block">Total</p>
             <p className="text-sm md:text-xl font-bold text-gray-900">{globalCompletion}%</p>
             <p className="text-[10px] text-gray-500 md:hidden">Avance</p>
           </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Explorar Módulos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {modules.map((module) => (
            <div 
              key={module.id}
              onClick={() => {
                  if (isLocked) {
                      onOpenSubscription();
                  } else {
                      onSelectModule(module);
                  }
              }}
              className={`bg-white group rounded-xl shadow-sm border transition-all duration-300 overflow-hidden flex flex-row sm:flex-col h-auto sm:h-full ${
                  isLocked 
                  ? 'border-gray-200 cursor-not-allowed opacity-75' 
                  : 'border-gray-200 hover:shadow-xl hover:border-amber-300 cursor-pointer'
              }`}
            >
              {/* Image Container: Small square on mobile, Full width on desktop */}
              <div className="w-24 h-24 sm:w-full sm:h-40 overflow-hidden relative shrink-0">
                <img 
                  src={module.imageUrl} 
                  alt={module.title}
                  className={`w-full h-full object-cover transition-transform duration-500 ${!isLocked && 'group-hover:scale-110'}`}
                />
                
                {isLocked && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Lock className="text-white w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                )}
              </div>
              
              {/* Content Container */}
              <div className="p-3 sm:p-5 flex-1 flex flex-col justify-center sm:justify-start min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-amber-600 transition-colors truncate">
                  {module.title}
                </h3>
                
                {/* Description: Hidden on mobile to keep card compact */}
                <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2 hidden sm:block">
                  {module.description}
                </p>
                
                <div className="space-y-1 sm:space-y-2 mt-auto">
                  <div className="flex justify-between text-xs font-medium text-gray-500">
                    <span>Progreso</span>
                    <span>{module.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2 overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Study Configuration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-scale-up">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                   <Settings className="text-amber-600" size={24} />
                   Configurar Sesión
                </h2>
                <p className="text-sm text-gray-500 mt-1">Personaliza tu práctica</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              
              {/* Module Selection */}
              <div className="mb-8">
                 <div className="flex justify-between items-end mb-4">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                      1. Selecciona Módulos
                    </label>
                    <button 
                      onClick={selectAll}
                      className="text-xs text-amber-600 font-medium hover:underline"
                    >
                      {selectedModuleIds.length === modules.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    </button>
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {modules.map(mod => {
                      const isSelected = selectedModuleIds.includes(mod.id);
                      return (
                        <div 
                          key={mod.id}
                          onClick={() => toggleModuleSelection(mod.id)}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                            isSelected 
                            ? 'border-amber-500 bg-amber-50 shadow-sm' 
                            : 'border-gray-200 hover:border-amber-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-amber-500 border-amber-500' : 'bg-white border-gray-300'
                          }`}>
                            {isSelected && <CheckCircle2 size={14} className="text-white" />}
                          </div>
                          <span className={`text-sm font-medium ${isSelected ? 'text-amber-900' : 'text-gray-700'}`}>
                            {mod.title}
                          </span>
                        </div>
                      );
                    })}
                 </div>
              </div>

              {/* Mode Selection */}
              <div>
                 <label className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 block">
                    2. Modo de Juego
                 </label>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div 
                      onClick={() => setIsRandom(false)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                         !isRandom 
                         ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' 
                         : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                       <div className="p-2 bg-white rounded-lg shadow-sm text-gray-600">
                          <PlayCircle size={24} />
                       </div>
                       <div>
                          <p className="font-bold text-gray-900">Orden Estándar</p>
                          <p className="text-xs text-gray-500">Agrupadas por tema.</p>
                       </div>
                    </div>

                    <div 
                      onClick={() => setIsRandom(true)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                         isRandom 
                         ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' 
                         : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                       <div className="p-2 bg-white rounded-lg shadow-sm text-gray-600">
                          <Shuffle size={24} />
                       </div>
                       <div>
                          <p className="font-bold text-gray-900">Aleatorio (Quiz)</p>
                          <p className="text-xs text-gray-500">Mezcladas al azar.</p>
                       </div>
                    </div>
                 </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleStartSession}
                disabled={selectedModuleIds.length === 0}
                className={`px-8 py-2.5 rounded-lg font-bold text-white shadow-md transition-all flex items-center gap-2 ${
                  selectedModuleIds.length === 0 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-amber-600 hover:bg-amber-700 hover:shadow-lg active:scale-95'
                }`}
              >
                <Zap size={18} />
                Comenzar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;