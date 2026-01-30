import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plan, PlanFeature } from '../types';
import { Plus, Edit2, Trash2, Loader2, X, CheckCircle, AlertTriangle, ListChecks, Check, XCircle } from 'lucide-react';

const AdminPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Track specific error state for FK constraint
  const [fkConflictPlanId, setFkConflictPlanId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
      name: '',
      price: 0,
      type: ''
  });

  // Dynamic Features List State
  const [features, setFeatures] = useState<PlanFeature[]>([]);

  const fetchPlans = async () => {
    setIsLoading(true);
    setError(null);
    setFkConflictPlanId(null);
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
      setFkConflictPlanId(null);
      
      if (plan) {
          setEditingPlan(plan);
          setFormData({
              name: plan.name,
              price: plan.price,
              type: plan.type || ''
          });

          // Parse existing features or fallback to text description
          try {
              const parsed = JSON.parse(plan.description);
              if (Array.isArray(parsed)) {
                  setFeatures(parsed);
              } else {
                  // If it's old text, make it one feature
                  setFeatures([{ name: plan.description, included: true }]);
              }
          } catch (e) {
              // Not JSON, assume legacy text
              setFeatures(plan.description ? [{ name: plan.description, included: true }] : []);
          }

      } else {
          setEditingPlan(null);
          setFormData({
              name: '',
              price: 0,
              type: 'Mensual' // Default value
          });
          setFeatures([
              { name: 'Acceso a todos los módulos', included: true },
              { name: 'Banco de preguntas', included: true },
              { name: 'Simulacros Exclusivos', included: false }
          ]);
      }
      setIsModalOpen(true);
  };

  // --- Feature Builder Handlers ---
  const addFeature = () => {
      setFeatures([...features, { name: '', included: true }]);
  };

  const removeFeature = (index: number) => {
      setFeatures(features.filter((_, i) => i !== index));
  };

  const updateFeatureName = (index: number, name: string) => {
      const newFeatures = [...features];
      newFeatures[index].name = name;
      setFeatures(newFeatures);
  };

  const toggleFeatureIncluded = (index: number) => {
      const newFeatures = [...features];
      newFeatures[index].included = !newFeatures[index].included;
      setFeatures(newFeatures);
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);
      
      try {
          // Convert features array to JSON string for storage
          const descriptionJson = JSON.stringify(features);

          if (editingPlan) {
              await api.updatePlan(editingPlan.id, {
                  ...formData,
                  description: descriptionJson
              });
          } else {
              await api.createPlan({
                  ...formData,
                  description: descriptionJson
              });
          }
          await fetchPlans();
          setIsModalOpen(false);
      } catch (err: any) {
          console.error(err);
          setError(err.message || "Error guardando el plan. Revisa la consola.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleDelete = async (id: string) => {
      if (!window.confirm("¿Estás seguro de eliminar este plan?")) return;
      setIsLoading(true);
      setError(null);
      setFkConflictPlanId(null);
      try {
          await api.deletePlan(id);
          await fetchPlans();
      } catch (e: any) {
          if (e.message === 'FK_CONSTRAINT') {
              setError("No se puede eliminar porque hay usuarios con este plan.");
              setFkConflictPlanId(id);
          } else {
              setError(e.message || "Error eliminando el plan.");
          }
      } finally {
          setIsLoading(false);
      }
  };

  const handleForceDelete = async () => {
      if (!fkConflictPlanId) return;
      
      const confirmMessage = "TRANQUILO: Los usuarios NO serán eliminados.\n\nEsta acción:\n1. Desvinculará a los usuarios de este plan.\n2. Los pasará a modo 'Gratuito' (Inactivo).\n3. Eliminará el historial de pagos de este plan específico.\n\n¿Deseas continuar?";
      
      if (!window.confirm(confirmMessage)) return;

      setIsLoading(true);
      try {
          await api.forceDeletePlan(fkConflictPlanId);
          await fetchPlans(); // This clears the error/conflict state automatically
          alert("Plan eliminado correctamente. Los usuarios ahora están en modo gratuito.");
      } catch (e: any) {
          setError("Error en la eliminación forzada: " + e.message);
      } finally {
          setIsLoading(false);
      }
  };

  // Helper to safely render description preview
  const renderDescriptionPreview = (jsonString: string) => {
      try {
          const parsed = JSON.parse(jsonString);
          if (Array.isArray(parsed)) {
              return (
                  <div className="space-y-1">
                      {parsed.slice(0, 3).map((f: PlanFeature, i: number) => (
                          <div key={i} className="flex items-center text-xs text-gray-500">
                              {f.included ? 
                                  <CheckCircle size={12} className="text-green-500 mr-1" /> : 
                                  <XCircle size={12} className="text-red-400 mr-1" />
                              }
                              {f.name}
                          </div>
                      ))}
                      {parsed.length > 3 && <span className="text-xs text-gray-400">...y {parsed.length - 3} más</span>}
                  </div>
              );
          }
      } catch (e) {
          return <p className="text-sm text-gray-500">{jsonString}</p>;
      }
      return <p className="text-sm text-gray-500">{jsonString}</p>;
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-lg flex flex-col sm:flex-row items-start gap-4 animate-fade-in">
            <div className="flex gap-2">
                <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                <p className="text-sm">{error}</p>
            </div>
            {fkConflictPlanId && (
                <button 
                    onClick={handleForceDelete}
                    className="whitespace-nowrap bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded shadow-sm"
                >
                    Forzar Eliminación (Desvincular Usuarios)
                </button>
            )}
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
                      
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4 min-h-[80px]">
                          {renderDescriptionPreview(plan.description)}
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
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[95vh]">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                  <h3 className="text-lg font-bold text-gray-900">
                    {editingPlan ? 'Editar Plan' : 'Crear Nuevo Plan'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar">
                 <form id="plan-form" onSubmit={handleSubmit} className="space-y-6">
                    {error && !fkConflictPlanId && (
                        <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre del Plan</label>
                            <input required className="w-full border p-2 rounded mt-1" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej. Plan Básico" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo (Etiqueta)</label>
                            <input 
                                required 
                                className="w-full border p-2 rounded mt-1" 
                                value={formData.type} 
                                onChange={e => setFormData({...formData, type: e.target.value})}
                                placeholder="Ej. Mensal, Intensivo..."
                                list="plan-types"
                            />
                            <datalist id="plan-types">
                                <option value="Mensual" />
                                <option value="Mensal" />
                                <option value="Semestral" />
                                <option value="Anual" />
                            </datalist>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Precio (Gs.)</label>
                        <input type="number" required className="w-full border p-2 rounded mt-1" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})} />
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <ListChecks size={18} className="text-amber-600" />
                            Lista de Beneficios
                        </label>
                        
                        <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => toggleFeatureIncluded(index)}
                                        className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors border ${
                                            feature.included 
                                            ? 'bg-green-100 text-green-600 border-green-200 hover:bg-green-200' 
                                            : 'bg-red-100 text-red-600 border-red-200 hover:bg-red-200'
                                        }`}
                                        title={feature.included ? "Incluido" : "No incluido"}
                                    >
                                        {feature.included ? <Check size={16} /> : <X size={16} />}
                                    </button>
                                    
                                    <input 
                                        type="text"
                                        required
                                        className="flex-1 border p-1.5 rounded text-sm focus:border-amber-500 outline-none"
                                        value={feature.name}
                                        onChange={(e) => updateFeatureName(index, e.target.value)}
                                        placeholder="Ej. Simulados Exclusivos"
                                    />
                                    
                                    <button 
                                        type="button"
                                        onClick={() => removeFeature(index)}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                        title="Eliminar fila"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            
                            <button 
                                type="button"
                                onClick={addFeature}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 mt-2"
                            >
                                <Plus size={16} /> Agregar Beneficio
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            * Usa el botón verde/rojo para indicar si el plan incluye (✅) o no (❌) ese beneficio.
                        </p>
                    </div>
                 </form>
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">Cancelar</button>
                <button form="plan-form" type="submit" disabled={isLoading} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold shadow-sm flex items-center gap-2">
                   {isLoading && <Loader2 className="animate-spin" size={16} />}
                   Guardar Plan
                </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default AdminPlans;