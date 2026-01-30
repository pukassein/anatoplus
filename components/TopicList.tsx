import React, { useState } from 'react';
import { Module, Topic } from '../types';
import { ArrowLeft, Search, Lock, ChevronRight, CheckCircle2 } from 'lucide-react';

interface TopicListProps {
  module: Module;
  topics: Topic[];
  onBack: () => void;
  onSelectTopic: (topic: Topic) => void;
}

const TopicList: React.FC<TopicListProps> = ({ module, topics, onBack, onSelectTopic }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTopics = topics.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header with Back button and Module info */}
      <div className="flex items-center space-x-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors dark:text-gray-300 dark:hover:bg-slate-700"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{module.title}</h1>
          <p className="text-gray-500 text-sm dark:text-gray-400">Escoge un tema para comenzar</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-20 z-20 dark:bg-slate-800 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar tema por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:focus:ring-amber-900/30"
          />
        </div>
      </div>

      {/* Topics Table/List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden dark:bg-slate-800 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  ID
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Nombre del Tema
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Estado
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acción</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
              {filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => (
                  <tr 
                    key={topic.id} 
                    onClick={() => !topic.isLocked && onSelectTopic(topic)}
                    className={`group transition-colors duration-150 ${
                      topic.isLocked 
                      ? 'bg-gray-50 cursor-not-allowed opacity-60 dark:bg-slate-800/50' 
                      : 'hover:bg-amber-50 cursor-pointer dark:hover:bg-amber-900/10'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        {topic.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 group-hover:text-amber-700 dark:text-gray-200 dark:group-hover:text-amber-400">
                        {topic.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {topic.isLocked ? (
                         <div className="flex items-center text-gray-400 text-sm">
                           <Lock size={16} className="mr-2" />
                           Bloqueado
                         </div>
                      ) : (
                         <div className="flex items-center text-green-600 text-sm dark:text-green-400">
                           <CheckCircle2 size={16} className="mr-2" />
                           Disponible
                         </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!topic.isLocked && (
                        <ChevronRight className="text-gray-400 group-hover:text-amber-600 ml-auto dark:group-hover:text-amber-400" size={20} />
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No se encontraron temas con esa búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Info Footer (Mock) */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between dark:bg-slate-700/30 dark:border-slate-700">
           <span className="text-sm text-gray-500 dark:text-gray-400">
             Mostrando <span className="font-medium text-gray-900 dark:text-gray-200">{filteredTopics.length}</span> temas
           </span>
           <div className="flex gap-2">
             <button disabled className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-400 text-sm cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-gray-500">
               Anterior
             </button>
             <button className="px-3 py-1 bg-amber-500 text-white rounded-md text-sm font-medium">
               1
             </button>
             <button disabled className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-400 text-sm cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-gray-500">
               Siguiente
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TopicList;