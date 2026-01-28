import React, { useState, useEffect } from 'react';
import { Topic, Subtopic } from '../types';
import { ArrowLeft, CheckCircle2, PlayCircle, Layers, CheckSquare, Square } from 'lucide-react';

interface SubtopicListProps {
  topic: Topic;
  subtopics: Subtopic[];
  onBack: () => void;
  onStart: (selectedSubtopicIds: string[]) => void;
}

const SubtopicList: React.FC<SubtopicListProps> = ({ topic, subtopics, onBack, onStart }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Select all by default when loaded
  useEffect(() => {
    if (subtopics.length > 0) {
      setSelectedIds(subtopics.map(s => s.id));
    }
  }, [subtopics]);

  const toggleSubtopic = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === subtopics.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(subtopics.map(s => s.id));
    }
  };

  const handleStart = () => {
      if (selectedIds.length === 0) return;
      onStart(selectedIds);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-4">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 text-sm px-2 py-1 rounded-md">{topic.code}</span>
            {topic.name}
          </h1>
          <p className="text-gray-500 text-sm">Selecciona los subtemas que deseas practicar.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         {/* Toolbar */}
         <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <button 
               onClick={toggleAll}
               className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-amber-600 transition-colors"
            >
               {selectedIds.length === subtopics.length ? <CheckSquare size={18} /> : <Square size={18} />}
               {selectedIds.length === subtopics.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
            </button>
            <span className="text-xs font-medium text-gray-400">
               {selectedIds.length} seleccionados
            </span>
         </div>

         {/* List */}
         <div className="divide-y divide-gray-100">
            {subtopics.length > 0 ? (
                subtopics.map(sub => {
                   const isSelected = selectedIds.includes(sub.id);
                   return (
                     <div 
                        key={sub.id}
                        onClick={() => toggleSubtopic(sub.id)}
                        className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected ? 'bg-amber-50/50' : 'hover:bg-gray-50'
                        }`}
                     >
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                isSelected ? 'bg-amber-500 border-amber-500' : 'bg-white border-gray-300'
                            }`}>
                                {isSelected && <CheckCircle2 size={14} className="text-white" />}
                            </div>
                            <span className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                                {sub.name}
                            </span>
                        </div>
                        <Layers size={16} className="text-gray-300" />
                     </div>
                   )
                })
            ) : (
                <div className="p-8 text-center text-gray-500">
                    No hay subtemas disponibles para este tema.
                </div>
            )}
         </div>

         {/* Footer Action */}
         <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button 
               onClick={handleStart}
               disabled={selectedIds.length === 0}
               className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all ${
                   selectedIds.length > 0 
                   ? 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95' 
                   : 'bg-gray-300 text-gray-500 cursor-not-allowed'
               }`}
            >
               <PlayCircle size={20} />
               Comenzar Quiz
            </button>
         </div>
      </div>
    </div>
  );
};

export default SubtopicList;