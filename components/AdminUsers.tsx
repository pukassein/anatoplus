import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, Loader2, User, Building2, Calendar, AlertTriangle, ToggleLeft, ToggleRight, Check, X } from 'lucide-react';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAllUsers();
      setUsers(data || []);
    } catch (err: any) {
      console.error("Failed to fetch users", err);
      setError("No se pudieron cargar los usuarios. Verifica que la tabla 'profiles' tenga las columnas 'is_active' y 'plan_id'.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
      try {
          await api.updateUserStatus(userId, !currentStatus);
          // Optimistic update
          setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
      } catch (err) {
          alert("Error al actualizar estado del usuario.");
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
         {isLoading ? (
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
                                <button
                                   onClick={() => handleToggleStatus(user.id, user.isActive)}
                                   className={`flex items-center gap-2 ml-auto px-3 py-1 rounded-md transition-colors ${
                                       user.isActive 
                                       ? 'text-red-600 hover:bg-red-50' 
                                       : 'text-green-600 hover:bg-green-50'
                                   }`}
                                >
                                   {user.isActive ? (
                                       <>Desactivar <ToggleRight size={24} /></>
                                   ) : (
                                       <>Activar <ToggleLeft size={24} /></>
                                   )}
                                </button>
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
    </div>
  );
};

export default AdminUsers;