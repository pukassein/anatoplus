import React, { useState, useEffect } from 'react';
import { Module, Topic } from '../types';
import { api } from '../services/api';
import { Plus, Edit2, Trash2, Search, Loader2, Save, X, ChevronDown, CheckCircle, Filter, ImageIcon } from 'lucide-react';

interface AdminModulesProps {
  modules: Module[];
  onAddModule: (module: Module) => void;
  onEditModule: (id: string, updates: Partial<Module>) => void;
  onDeleteModule: (id: string) => void;
}

interface QuestionFormState {
    subtopicId: string;
    text: string;
    explanationCorrect: string;
    explanationIncorrect: string;
    imageUrl: string;
    options: {
        id?: number;
        text: string;
        isCorrect: boolean;
    }[];
}

const AdminModules: React.FC<AdminModulesProps> = ({ 
  modules: initialModules, 
}) => {
  const [activeTab, setActiveTab] = useState<'Modulos' | 'Temas' | 'Subtemas' | 'Preguntas'>('Modulos');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter States
  const [selectedSubtopicFilter, setSelectedSubtopicFilter] = useState<string>('');
  
  // Data State
  const [modules, setModules] = useState<Module[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [subtopics, setSubtopics] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]); 

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  
  // Form States
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', imageUrl: '' });
  const [topicForm, setTopicForm] = useState({ moduleId: '', name: '' });
  const [subtopicForm, setSubtopicForm] = useState({ topicId: '', name: '' });
  
  const [questionForm, setQuestionForm] = useState<QuestionFormState>({ 
    subtopicId: '', 
    text: '', 
    explanationCorrect: '', 
    explanationIncorrect: '', 
    imageUrl: '', 
    options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
    ]
  });

  // --- DATA FETCHING ---

  const refreshData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'Modulos') {
        const data = await api.getModules();
        setModules(data);
      } else if (activeTab === 'Temas') {
        const [mData, tData] = await Promise.all([api.getModules(), api.getAllTopics()]);
        setModules(mData); 
        setTopics(tData);
      } else if (activeTab === 'Subtemas') {
        const [tData, sData] = await Promise.all([api.getAllTopics(), api.getAllSubtopics()]);
        setTopics(tData); 
        setSubtopics(sData);
      } else if (activeTab === 'Preguntas') {
         const [sData, qData] = await Promise.all([
             api.getAllSubtopics(), 
             api.getAllQuestionsAdmin(selectedSubtopicFilter)
         ]);
         setSubtopics(sData);
         setQuestions(qData);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      alert("Error cargando datos. Revisa la consola.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [activeTab, selectedSubtopicFilter]); 

  // --- ACTIONS ---

  const handleOpenModal = async (item?: any) => {
    setEditingItem(item || null);
    
    if (activeTab === 'Modulos') {
      setModuleForm(item ? { title: item.title, description: item.description, imageUrl: item.imageUrl } : { title: '', description: '', imageUrl: 'https://picsum.photos/400/300' });
    } else if (activeTab === 'Temas') {
      setTopicForm(item ? { moduleId: item.moduleId, name: item.name } : { moduleId: modules[0]?.id || '', name: '' });
    } else if (activeTab === 'Subtemas') {
      setSubtopicForm(item ? { topicId: item.topicId, name: item.name } : { topicId: topics[0]?.id || '', name: '' });
    } else if (activeTab === 'Preguntas') {
        if (item) {
           // Fetch full details including options
           const details = await api.getQuestionDetails(item.id);
           if (details) {
              const loadedOptions = details.options || [];
              const paddedOptions = loadedOptions.map((o: any) => ({ 
                  id: o.id, 
                  text: o.text, 
                  isCorrect: o.isCorrect 
              }));
              // Fill up to 5 options if less exist
              while(paddedOptions.length < 5) paddedOptions.push({ text: '', isCorrect: false });
              
              setQuestionForm({
                  subtopicId: details.subtopicId,
                  text: details.text,
                  explanationCorrect: details.explanationCorrect || '',
                  explanationIncorrect: details.explanationIncorrect || '',
                  imageUrl: details.imageUrl || '',
                  options: paddedOptions
              });
           }
        } else {
           // Reset form for new question
           setQuestionForm({
             subtopicId: selectedSubtopicFilter || subtopics[0]?.id || '',
             text: '',
             explanationCorrect: '',
             explanationIncorrect: '',
             imageUrl: '',
             options: [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
             ]
           });
        }
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este elemento? Esta acción es irreversible.")) return;
    try {
      if (activeTab === 'Modulos') await api.deleteModule(id);
      if (activeTab === 'Temas') await api.deleteTopic(id);
      if (activeTab === 'Subtemas') await api.deleteSubtopic(id);
      if (activeTab === 'Preguntas') await api.deleteQuestion(id);
      refreshData();
    } catch (e) {
      alert("Error eliminando. Puede que existan datos relacionados.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (activeTab === 'Modulos') {
        if (editingItem) await api.updateModule(editingItem.id, moduleForm);
        else await api.createModule(moduleForm);
      } else if (activeTab === 'Temas') {
        if (editingItem) await api.updateTopic(editingItem.id, topicForm);
        else await api.createTopic(topicForm);
      } else if (activeTab === 'Subtemas') {
        if (editingItem) await api.updateSubtopic(editingItem.id, subtopicForm);
        else await api.createSubtopic(subtopicForm);
      } else if (activeTab === 'Preguntas') {
         const validOptions = questionForm.options.filter(o => o.text.trim() !== '');
         const hasCorrect = validOptions.some(o => o.isCorrect);
         if (validOptions.length < 2) throw new Error("Mínimo 2 opciones requeridas");
         if (!hasCorrect) throw new Error("Debe marcar una opción como correcta");

         if (editingItem) {
            // Update existing question
            await api.updateQuestion(editingItem.id, {
                subtopicId: questionForm.subtopicId,
                text: questionForm.text,
                explanationCorrect: questionForm.explanationCorrect,
                explanationIncorrect: questionForm.explanationIncorrect,
                imageUrl: questionForm.imageUrl,
                options: validOptions
            });
         } else {
            // Create new question
            await api.createQuestion({
                subtopicId: questionForm.subtopicId,
                text: questionForm.text,
                explanationCorrect: questionForm.explanationCorrect,
                explanationIncorrect: questionForm.explanationIncorrect,
                imageUrl: questionForm.imageUrl,
                options: validOptions
            });
         }
      }
      setIsModalOpen(false);
      refreshData();
    } catch (e: any) {
      alert("Error guardando: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOptionText = (index: number, val: string) => {
      setQuestionForm(prev => {
          const newOptions = prev.options.map((opt, i) => {
              if (i === index) return { ...opt, text: val };
              return opt;
          });
          return { ...prev, options: newOptions };
      });
  };

  const updateOptionCorrect = (index: number) => {
      setQuestionForm(prev => {
          const newOptions = prev.options.map((opt, i) => ({
              ...opt,
              isCorrect: i === index 
          }));
          return { ...prev, options: newOptions };
      });
  };

  const stripHtml = (html: string) => {
     if(!html) return '';
     return html.replace(/<[^>]*>?/gm, '');
  }

  const renderTable = () => {
    if (activeTab === 'Modulos') {
        return (
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Nombre</th><th className="px-6 py-3 text-right">Acción</th></tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {modules.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase())).map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{m.title}</td>
                    <td className="px-6 py-4 text-right">
                    <button onClick={() => handleOpenModal(m)} className="text-amber-600 hover:text-amber-800 mr-3"><Edit2 size={16}/></button>
                    <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        );
    }
    if (activeTab === 'Temas') {
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Tema</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Módulo</th><th className="px-6 py-3 text-right">Acción</th></tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topics.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{t.name}</td>
                  <td className="px-6 py-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{t.moduleName || t.moduleId}</span></td>
                  <td className="px-6 py-4 text-right">
                     <button onClick={() => handleOpenModal(t)} className="text-amber-600 hover:text-amber-800 mr-3"><Edit2 size={16}/></button>
                     <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
    }
    if (activeTab === 'Subtemas') {
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Subtema</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Tema Padre</th><th className="px-6 py-3 text-right">Acción</th></tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subtopics.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{s.name}</td>
                  <td className="px-6 py-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{s.topicName}</span></td>
                  <td className="px-6 py-4 text-right">
                     <button onClick={() => handleOpenModal(s)} className="text-amber-600 hover:text-amber-800 mr-3"><Edit2 size={16}/></button>
                     <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
    }

    if (activeTab === 'Preguntas') {
      const filteredQuestions = questions.filter(q => {
          return q.text.toLowerCase().includes(searchTerm.toLowerCase());
      });

      return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Pregunta</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Explicación (Prev)</th><th className="px-6 py-3 text-right">Acción</th></tr></thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredQuestions.length > 0 ? (
                filteredQuestions.map(q => (
                <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 max-w-xs">
                        <p className="line-clamp-2 text-sm font-medium">{q.text}</p>
                        <span className="text-xs text-gray-400">{q.subtopicName}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 max-w-xs">
                        <div className="line-clamp-1">{stripHtml(q.explanationCorrect)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                    <button onClick={() => handleOpenModal(q)} className="text-amber-600 hover:text-amber-800 mr-3"><Edit2 size={16}/></button>
                    <button onClick={() => handleDelete(q.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                        {selectedSubtopicFilter 
                         ? "No se encontraron preguntas en este subtema."
                         : "No hay preguntas recientes. Selecciona un subtema para ver más."}
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* Tabs & Toolbar - Same as before */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1">
         {(['Modulos', 'Temas', 'Subtemas', 'Preguntas'] as const).map(tab => (
           <button
             key={tab}
             onClick={() => { setActiveTab(tab); setSearchTerm(''); }}
             className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
               activeTab === tab ? 'bg-amber-100 text-amber-800 border-b-2 border-amber-500' : 'text-gray-500 hover:bg-gray-50'
             }`}
           >
             {tab}
           </button>
         ))}
      </div>

      <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                type="text"
                placeholder={`Buscar ${activeTab.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
            </div>
            <button 
                onClick={() => handleOpenModal()}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm whitespace-nowrap"
            >
                <Plus size={20} />
                Agregar {activeTab.slice(0, -1)}
            </button>
         </div>
         
         {activeTab === 'Preguntas' && (
             <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                 <Filter size={18} className="text-gray-500" />
                 <span className="text-sm font-medium text-gray-700">Filtrar por Subtema:</span>
                 <select 
                    value={selectedSubtopicFilter}
                    onChange={(e) => setSelectedSubtopicFilter(e.target.value)}
                    className="flex-1 max-w-xs border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                 >
                     <option value="">-- Ver Todo (Últimas 200) --</option>
                     {subtopics.map(s => (
                         <option key={s.id} value={s.id}>{s.name} ({s.topicName})</option>
                     ))}
                 </select>
                 {selectedSubtopicFilter && (
                     <button 
                        onClick={() => setSelectedSubtopicFilter('')}
                        className="text-xs text-red-500 hover:underline ml-2"
                     >
                        Limpiar
                     </button>
                 )}
             </div>
         )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[300px]">
         {isLoading ? (
             <div className="flex items-center justify-center h-64">
                 <Loader2 className="animate-spin text-amber-500" size={32} />
             </div>
         ) : (
             renderTable()
         )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className={`bg-white rounded-xl shadow-2xl w-full flex flex-col max-h-[90vh] ${activeTab === 'Preguntas' ? 'max-w-3xl' : 'max-w-md'}`}>
              
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                  <h3 className="text-lg font-bold text-gray-900">
                    {editingItem ? 'Editar' : 'Crear'} {activeTab.slice(0,-1)}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="admin-form" onSubmit={handleSubmit} className="space-y-4">
                   
                   {/* MODULE / TOPIC / SUBTOPIC FORMS REMAIN SAME */}
                   {activeTab === 'Modulos' && (
                     <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nombre</label>
                          <input required className="w-full border p-2 rounded" value={moduleForm.title} onChange={e => setModuleForm({...moduleForm, title: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Descripción</label>
                          <textarea className="w-full border p-2 rounded" value={moduleForm.description} onChange={e => setModuleForm({...moduleForm, description: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Imagen URL</label>
                          <input className="w-full border p-2 rounded" value={moduleForm.imageUrl} onChange={e => setModuleForm({...moduleForm, imageUrl: e.target.value})} />
                        </div>
                     </>
                   )}

                   {activeTab === 'Temas' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Módulo Padre</label>
                          <select required className="w-full border p-2 rounded bg-white" value={topicForm.moduleId} onChange={e => setTopicForm({...topicForm, moduleId: e.target.value})}>
                             <option value="">Seleccionar Módulo</option>
                             {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nombre del Tema</label>
                          <input required className="w-full border p-2 rounded" value={topicForm.name} onChange={e => setTopicForm({...topicForm, name: e.target.value})} />
                        </div>
                      </>
                   )}

                   {activeTab === 'Subtemas' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Tema Padre</label>
                          <select required className="w-full border p-2 rounded bg-white" value={subtopicForm.topicId} onChange={e => setSubtopicForm({...subtopicForm, topicId: e.target.value})}>
                             <option value="">Seleccionar Tema</option>
                             {topics.map(t => <option key={t.id} value={t.id}>{t.name} ({t.moduleName})</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nombre del Subtema</label>
                          <input required className="w-full border p-2 rounded" value={subtopicForm.name} onChange={e => setSubtopicForm({...subtopicForm, name: e.target.value})} />
                        </div>
                      </>
                   )}

                   {/* QUESTION FORM */}
                   {activeTab === 'Preguntas' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Subtema</label>
                          <select required className="w-full border p-2 rounded bg-white" value={questionForm.subtopicId} onChange={e => setQuestionForm({...questionForm, subtopicId: e.target.value})}>
                             <option value="">Seleccionar Subtema</option>
                             {subtopics.map(s => <option key={s.id} value={s.id}>{s.name} ({s.topicName})</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Texto de la Pregunta</label>
                          <textarea required rows={3} className="w-full border p-2 rounded" value={questionForm.text} onChange={e => setQuestionForm({...questionForm, text: e.target.value})} />
                        </div>
                        
                        <div>
                           <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                             <ImageIcon size={16} /> URL Imagen/Video (Opcional)
                           </label>
                           <input 
                              type="text" 
                              className="w-full border p-2 rounded mt-1" 
                              placeholder="https://..."
                              value={questionForm.imageUrl}
                              onChange={e => setQuestionForm({...questionForm, imageUrl: e.target.value})}
                           />
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Opciones de Respuesta</label>
                           {questionForm.options.map((opt, idx) => (
                              <div key={idx} className="flex items-center gap-2 mb-2">
                                 <div 
                                   onClick={() => updateOptionCorrect(idx)}
                                   className={`cursor-pointer w-6 h-6 rounded-full border flex items-center justify-center ${opt.isCorrect ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300'}`}
                                 >
                                    {opt.isCorrect && <CheckCircle size={14} />}
                                 </div>
                                 <input 
                                   placeholder={`Opción ${idx + 1}`}
                                   className="flex-1 border p-1.5 rounded text-sm focus:border-amber-500 outline-none"
                                   value={opt.text}
                                   onChange={e => updateOptionText(idx, e.target.value)}
                                 />
                              </div>
                           ))}
                           <p className="text-xs text-gray-400 mt-1">* Marca la bolita verde en la respuesta correcta.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 text-green-700">Explicación Correcta (HTML/Texto)</label>
                                <textarea rows={4} className="w-full border p-2 rounded bg-green-50 border-green-200" value={questionForm.explanationCorrect} onChange={e => setQuestionForm({...questionForm, explanationCorrect: e.target.value})} placeholder="<p>¡Muy bien!...</p>" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 text-red-700">Explicación Incorrecta (HTML/Texto)</label>
                                <textarea rows={4} className="w-full border p-2 rounded bg-red-50 border-red-200" value={questionForm.explanationIncorrect} onChange={e => setQuestionForm({...questionForm, explanationIncorrect: e.target.value})} placeholder="<p>Ups, no es correcto...</p>" />
                            </div>
                        </div>
                      </>
                   )}

                </form>
              </div>
              
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">Cancelar</button>
                <button form="admin-form" type="submit" disabled={isLoading} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold shadow-sm flex items-center gap-2">
                   {isLoading && <Loader2 className="animate-spin" size={16} />}
                   Guardar
                </button>
              </div>

           </div>
        </div>
      )}

    </div>
  );
};

export default AdminModules;