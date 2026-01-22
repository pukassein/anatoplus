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
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{module.title}</h1>
          <p className="text-gray-500 text-sm">Escoge un tema para comenzar</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-20 z-20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar tema por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
          />
        </div>
      </div>

      {/* Topics Table/List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nombre del Tema
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acción</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => (
                  <tr 
                    key={topic.id} 
                    onClick={() => !topic.isLocked && onSelectTopic(topic)}
                    className={`group transition-colors duration-150 ${
                      topic.isLocked ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'hover:bg-amber-50 cursor-pointer'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        {topic.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 group-hover:text-amber-700">
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
                         <div className="flex items-center text-green-600 text-sm">
                           <CheckCircle2 size={16} className="mr-2" />
                           Disponible
                         </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!topic.isLocked && (
                        <ChevronRight className="text-gray-400 group-hover:text-amber-600 ml-auto" size={20} />
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron temas con esa búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Info Footer (Mock) */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
           <span className="text-sm text-gray-500">
             Mostrando <span className="font-medium text-gray-900">{filteredTopics.length}</span> temas
           </span>
           <div className="flex gap-2">
             <button disabled className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-400 text-sm cursor-not-allowed">
               Anterior
             </button>
             <button className="px-3 py-1 bg-amber-500 text-white rounded-md text-sm font-medium">
               1
             </button>
             <button disabled className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-400 text-sm cursor-not-allowed">
               Siguiente
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TopicList;