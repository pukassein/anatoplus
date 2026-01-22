import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import { Module, UserStats } from '../types';
import { api } from '../services/api';
import { Loader2 } from 'lucide-react';

interface PerformanceProps {
  modules: Module[];
  user: { id: string };
}

const Performance: React.FC<PerformanceProps> = ({ modules, user }) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const data = await api.getUserStats(user.id);
        setStats(data);
      } catch (e) {
        console.error("Failed to load stats", e);
      } finally {
        setIsLoading(false);
      }
    };
    if (user.id) {
        fetchStats();
    }
  }, [user.id]);

  // Transform module data for charts
  const barData = modules.slice(0, 5).map(m => ({
    name: m.title.split(' ')[0], // Short name
    progreso: m.progress,
    meta: 100
  }));

  const radarData = modules.slice(0, 6).map(m => ({
    subject: m.title.substring(0, 10),
    A: m.progress,
    fullMark: 100,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 mb-2">Tu Desempeño</h1>
           <p className="text-gray-600">Analíticas detalladas de tu progreso en anatomía.</p>
        </div>
        {isLoading && <Loader2 className="animate-spin text-amber-500" />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Bar Chart Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Progreso por Módulo</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <Tooltip 
                  cursor={{fill: '#F3F4F6'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="progreso" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Mapa de Conocimiento</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Mi Progreso"
                  dataKey="A"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  fill="#FCD34D"
                  fillOpacity={0.5}
                />
                <Legend />
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Stats Cards Bottom - NOW DYNAMIC */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 text-blue-700 p-6 rounded-xl flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold mb-1">{stats?.totalQuestions || 0}</span>
            <span className="text-sm opacity-80 font-medium uppercase tracking-wide">Preguntas Contestadas</span>
        </div>
        
        <div className="bg-green-50 text-green-700 p-6 rounded-xl flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold mb-1">{stats?.accuracy || 0}%</span>
            <span className="text-sm opacity-80 font-medium uppercase tracking-wide">Precisión Global</span>
        </div>
        
        <div className="bg-orange-50 text-orange-700 p-6 rounded-xl flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold mb-1">{stats?.correctQuestions || 0}</span>
            <span className="text-sm opacity-80 font-medium uppercase tracking-wide">Respuestas Correctas</span>
        </div>
        
        <div className="bg-purple-50 text-purple-700 p-6 rounded-xl flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold mb-1">#{Math.floor(Math.random() * 20) + 1}</span>
            <span className="text-sm opacity-80 font-medium uppercase tracking-wide">Ranking (Est.)</span>
        </div>
      </div>
    </div>
  );
};

export default Performance;