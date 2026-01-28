import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PaymentRequest, BankDetails } from '../types';
import { Loader2, CheckCircle, XCircle, FileText, Calendar, User, CreditCard, X, Eye, Settings } from 'lucide-react';

const AdminPayments: React.FC = () => {
    const [requests, setRequests] = useState<PaymentRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProof, setSelectedProof] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Settings Modal
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [bankForm, setBankForm] = useState<BankDetails>({ bankName: '', accountName: '', ruc: '', accountNumber: '' });
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const data = await api.getPaymentRequests();
            setRequests(data);
        } catch (e) {
            console.error("Failed to fetch payments", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleOpenSettings = async () => {
        setIsSavingSettings(true);
        setIsSettingsOpen(true);
        try {
            const details = await api.getBankDetails();
            setBankForm(details);
        } catch(e) {
            console.error(e);
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingSettings(true);
        try {
            await api.updateBankDetails(bankForm);
            setIsSettingsOpen(false);
            alert("Datos bancarios actualizados.");
        } catch(e) {
            alert("Error al guardar.");
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleProcess = async (req: PaymentRequest, status: 'approved' | 'rejected') => {
        if (!confirm(`¿Estás seguro de ${status === 'approved' ? 'APROBAR' : 'RECHAZAR'} este pago?`)) return;
        
        setProcessingId(req.id);
        try {
            await api.processPayment(req.id, req.userId, req.planId, status);
            // Refresh list
            fetchRequests();
        } catch (e) {
            alert("Error procesando la solicitud.");
            console.error(e);
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'approved': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> Aprobado</span>;
            case 'rejected': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={12} /> Rechazado</span>;
            default: return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Pendiente</span>;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Solicitudes de Pago</h2>
                    <p className="text-gray-500 text-sm">Valida los comprobantes de transferencia de los estudiantes.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleOpenSettings} 
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg"
                    >
                        <Settings size={18} />
                        Configurar Banco
                    </button>
                    <button onClick={fetchRequests} className="text-amber-600 text-sm hover:underline font-medium px-2">
                        Actualizar
                    </button>
                </div>
            </div>

            {isLoading && !requests.length && (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-amber-500" size={32} />
                </div>
            )}

            {!isLoading && requests.length === 0 && (
                <div className="text-center p-12 bg-white rounded-lg border border-dashed border-gray-300 text-gray-400">
                    No hay solicitudes de pago pendientes.
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Usuario</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Plan Solicitado</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Comprobante</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {requests.map(req => (
                                <tr key={req.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                <User size={16} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{req.userName || 'Usuario'}</div>
                                                <div className="text-xs text-gray-500">{req.userEmail}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <CreditCard size={16} className="text-gray-400" />
                                            {req.planName || 'Plan desconocido'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(req.status)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setSelectedProof(req.proofUrl)}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-end gap-1"
                                        >
                                            <Eye size={16} /> Ver
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {req.status === 'pending' && (
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleProcess(req, 'approved')}
                                                    disabled={!!processingId}
                                                    className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                                                    title="Aprobar"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleProcess(req, 'rejected')}
                                                    disabled={!!processingId}
                                                    className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                                                    title="Rechazar"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        )}
                                        {req.status !== 'pending' && <span className="text-gray-400 text-xs">-</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Image Modal */}
            {selectedProof && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl max-h-[90vh] overflow-auto p-2">
                        <button 
                            onClick={() => setSelectedProof(null)}
                            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                        >
                            <X size={24} />
                        </button>
                        <img src={selectedProof} alt="Comprobante" className="max-w-full h-auto rounded" />
                    </div>
                </div>
            )}

            {/* Bank Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <h3 className="text-lg font-bold text-gray-900">Datos Bancarios</h3>
                            <button onClick={() => setIsSettingsOpen(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <form onSubmit={handleSaveSettings} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre del Banco</label>
                                <input required className="w-full border p-2 rounded mt-1" value={bankForm.bankName} onChange={e => setBankForm({...bankForm, bankName: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Titular de la Cuenta</label>
                                <input required className="w-full border p-2 rounded mt-1" value={bankForm.accountName} onChange={e => setBankForm({...bankForm, accountName: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">RUC / CI</label>
                                <input required className="w-full border p-2 rounded mt-1" value={bankForm.ruc} onChange={e => setBankForm({...bankForm, ruc: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Número de Cuenta</label>
                                <input required className="w-full border p-2 rounded mt-1" value={bankForm.accountNumber} onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})} />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsSettingsOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" disabled={isSavingSettings} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold">
                                    {isSavingSettings ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPayments;