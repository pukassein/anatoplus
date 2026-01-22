import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plan } from '../types';
import { Plus, Edit2, Trash2, Loader2, X, CheckCircle, AlertTriangle, Tag, FileText } from 'lucide-react';

const AdminPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
      name: '',
      price: 0,
      description: '',
      type: ''
  });

  const fetchPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getPlans();
      setPlans(data);
    } catch (e: any) {
      console.error(e);
      setError("No se pudieron cargar los planes. Revisa la consola.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenModal = (plan?: Plan) => {
      setError(null);
      if (plan) {
          setEditingPlan(plan);
          setFormData({
              name: plan.name,
              price: plan.price,
              description: plan.description || '',
              type: plan.type || ''
          });
      } else {
          setEditingPlan(null);
          setFormData({
              name: '',
              price: 0,
              description: '',
              type: 'Mensual'
          });
      }
      setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);
      
      try {
          if (editingPlan) {
              await api.updatePlan(editingPlan.id, formData);
          } else {
              await api.createPlan(formData);
          }
          await fetchPlans();
          setIsModalOpen(false);
      } catch (err: any) {
          console.error(err);
          setError("Error guardando el plan. Revisa la consola.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleDelete = async (id: string) => {
      if (!window.confirm("¿Estás seguro de eliminar este plan?")) return;
      setIsLoading(true);
      try {
          await api.deletePlan(id);
          await fetchPlans();
      } catch (e) {
          alert("Error eliminando.");
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Planes y Precios</h2>
            <p className="text-gray-500 text-sm">Administra las ofertas de suscripción para los estudiantes.</p>
        </div>
        <button 
            onClick={() => handleOpenModal()}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
        >
            <Plus size={20} />
            Nuevo Plan
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
            <AlertTriangle className="shrink-0 mt-0.5" size={18} />
            <p className="text-sm">{error}</p>
        </div>
      )}

      {isLoading && !isModalOpen && (
          <div className="flex justify-center p-12">
              <Loader2 className="animate-spin text-amber-500" size={32} />
          </div>
      )}

      {!isLoading && !error && plans.length === 0 && (
          <div className="text-center p-12 bg-white rounded-lg border border-dashed border-gray-300 text-gray-400">
              No hay planes configurados. Crea uno nuevo.
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
              <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow relative">
                  <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded font-medium uppercase">{plan.type}</span>
                      </div>
                      
                      <div className="flex items-baseline mb-4">
                          <span className="text-3xl font-extrabold text-gray-900">
                              Gs. {plan.price.toLocaleString()}
                          </span>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                          <p className="text-gray-600 text-sm whitespace-pre-wrap flex gap-2">
                             <FileText size={16} className="text-gray-400 shrink-0 mt-0.5" />
                             {plan.description}
                          </p>
                      </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(plan)}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                          <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(plan.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                          <Trash2 size={18} />
                      </button>
                  </div>
              </div>
          ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                  <h3 className="text-lg font-bold text-gray-900">
                    {editingPlan ? 'Editar Plan' : 'Crear Nuevo Plan'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
              </div>

              <div className="p-6 overflow-y-auto">
                 <form id="plan-form" onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Plan</label>
                        <input required className="w-full border p-2 rounded mt-1" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej. Plan Básico" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo (Categoría)</label>
                        <select required className="w-full border p-2 rounded mt-1 bg-white" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                            <option value="Mensual">Mensual</option>
                            <option value="Semestral">Semestral</option>
                            <option value="Anual">Anual</option>
                            <option value="Especial">Especial</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Precio (Gs.)</label>
                        <input type="number" required className="w-full border p-2 rounded mt-1" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción Detallada</label>
                        <textarea rows={4} required className="w-full border p-2 rounded mt-1" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe qué incluye este plan..." />
                    </div>
                 </form>
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">Cancelar</button>
                <button form="plan-form" type="submit" disabled={isLoading} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold shadow-sm flex items-center gap-2">
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

export default AdminPlans;