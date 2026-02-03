import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, Loader2, User, Building2, Calendar, AlertTriangle, ToggleLeft, ToggleRight, Check, X, Edit, CreditCard } from 'lucide-react';
import { Plan } from '../types';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Manual Assignment State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [assignForm, setAssignForm] = useState({
      planId: '',
      price: '',
      notes: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersData, plansData] = await Promise.all([
          api.getAllUsers(),
          api.getPlans()
      ]);
      setUsers(usersData || []);
      setPlans(plansData || []);
    } catch (err: any) {
      console.error("Failed to fetch data", err);
      setError("No se pudieron cargar los datos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
      const originalUsers = [...users];
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
      try {
          await api.updateUserStatus(userId, !currentStatus);
      } catch (err: any) {
          setUsers(originalUsers);
          alert(`Error: ${err.message}`);
      }
  };

  const handleOpenAssignModal = (user: any) => {
      setSelectedUser(user);
      // If user already has a plan, try to pre-select it
      const currentPlan = plans.find(p => p.id === user.planId?.toString());
      setAssignForm({
          planId: user.planId ? user.planId.toString() : (plans[0]?.id || ''),
          price: currentPlan ? currentPlan.price.toString() : '',
          notes: ''
      });
      setIsAssignModalOpen(true);
  };

  const handlePlanChange = (planId: string) => {
      const selected = plans.find(p => p.id === planId);
      setAssignForm({
          ...assignForm,
          planId: planId,
          price: selected ? selected.price.toString() : ''
      });
  };

  const handleAssignSubmit = async () => {
      if (!selectedUser || !assignForm.planId) return;
      
      const price = parseInt(assignForm.price);
      if (isNaN(price)) return alert("El precio debe ser un número");

      setIsLoading(true);
      try {
          await api.adminAssignPlan(
              selectedUser.id, 
              assignForm.planId, 
              price, 
              assignForm.notes
          );
          alert(`Plan asignado correctamente a ${selectedUser.full_name}`);
          setIsAssignModalOpen(false);
          fetchData(); // Refresh list
      } catch (e: any) {
          alert("Error asignando plan: " + e.message);
      } finally {
          setIsLoading(false);
      }
  };

  const filteredUsers = users.filter(user => 
    (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.affiliation || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-900">Usuarios Registrados</h2>
           <p className="text-gray-500 text-sm">Gestiona y visualiza la comunidad de estudiantes.</p>
        </div>
        <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre, email o universidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none"
            />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
            <AlertTriangle className="shrink-0 mt-0.5" size={18} />
            <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
         {isLoading && !isAssignModalOpen ? (
             <div className="flex items-center justify-center h-64">
                 <Loader2 className="animate-spin text-amber-500" size={32} />
             </div>
         ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Plan / Afiliación</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acción</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-bold border ${user.isActive ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                                        <User size={20} />
                                    </div>
                                    <div className="ml-4">
                                        <div className={`text-sm font-medium ${user.isActive ? 'text-gray-900' : 'text-gray-400'}`}>{user.full_name || 'Sin nombre'}</div>
                                        <div className="text-sm text-gray-500">{user.email || 'Email privado'}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col">
                                   <div className="flex items-center text-sm font-semibold text-gray-700">
                                      {user.planName || 'Gratuito'}
                                   </div>
                                   <div className="flex items-center text-xs text-gray-500 mt-1">
                                      <Building2 size={12} className="mr-1 text-gray-400" />
                                      {user.affiliation || 'No especificado'}
                                   </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {user.role === 'admin' ? 'Administrador' : 'Estudiante'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {user.isActive ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <Check size={12} /> Activo
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        <X size={12} /> Inactivo
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end gap-2">
                                    {/* Manual Plan Assignment Button */}
                                    <button
                                       onClick={() => handleOpenAssignModal(user)}
                                       className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                       title="Asignar Plan Manualmente (Genera Pago)"
                                    >
                                        <CreditCard size={18} />
                                    </button>

                                    {/* Quick Toggle Button */}
                                    <button
                                       onClick={() => handleToggleStatus(user.id, user.isActive)}
                                       className={`p-2 rounded-lg transition-colors ${
                                           user.isActive 
                                           ? 'text-red-600 hover:bg-red-50' 
                                           : 'text-green-600 hover:bg-green-50'
                                       }`}
                                       title={user.isActive ? "Desactivar Acceso" : "Activar Acceso Rápido"}
                                    >
                                       {user.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                    </button>
                                </div>
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                {error ? 'Error de carga.' : 'No se encontraron usuarios.'}
                            </td>
                        </tr>
                    )}
                </tbody>
                </table>
            </div>
         )}
      </div>

      {/* Manual Assignment Modal */}
      {isAssignModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h3 className="font-bold text-gray-900">Asignar Plan Manualmente</h3>
                    <button onClick={() => setIsAssignModalOpen(false)}><X size={20} className="text-gray-500" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800">
                        <p>Estás asignando un plan a <strong>{selectedUser.full_name}</strong>. Esto creará un registro de pago aprobado automáticamente.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Seleccionar Plan</label>
                        <select 
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white"
                            value={assignForm.planId}
                            onChange={(e) => handlePlanChange(e.target.value)}
                        >
                            <option value="">-- Seleccionar --</option>
                            {plans.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (Gs. {p.price.toLocaleString()})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Monto Cobrado (Gs.)</label>
                        <input 
                            type="number"
                            className="w-full border border-gray-300 rounded-lg p-2 font-bold text-lg text-green-700 outline-none focus:ring-2 focus:ring-green-200"
                            value={assignForm.price}
                            onChange={(e) => setAssignForm({...assignForm, price: e.target.value})}
                        />
                        <p className="text-xs text-gray-400 mt-1">Ingresa "0" si es beca o no pagó.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nota (Opcional)</label>
                        <input 
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-amber-200"
                            placeholder="Ej. Pago en efectivo, Aval..."
                            value={assignForm.notes}
                            onChange={(e) => setAssignForm({...assignForm, notes: e.target.value})}
                        />
                    </div>

                    <button 
                        onClick={handleAssignSubmit}
                        disabled={!assignForm.planId || isLoading}
                        className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Confirmar y Activar'}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsers;