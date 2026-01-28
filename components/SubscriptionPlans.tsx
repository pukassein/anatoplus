import React, { useEffect, useState } from 'react';
import { Plan, User, BankDetails } from '../types';
import { api } from '../services/api';
import { Check, Star, Loader2, ArrowLeft, ShieldCheck, UploadCloud, Copy, X } from 'lucide-react';

interface SubscriptionPlansProps {
    user: User;
    onBack: () => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ user, onBack }) => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [plansData, bankData] = await Promise.all([
                    api.getPlans(),
                    api.getBankDetails()
                ]);
                setPlans(plansData);
                setBankDetails(bankData);
            } catch (e) {
                console.error("Failed to load data", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const handleSelectPlan = (plan: Plan) => {
        setSelectedPlan(plan);
        setFile(null); // Reset file on new selection
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmitPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !selectedPlan) return;

        setUploading(true);
        try {
            // 1. Upload File
            const proofUrl = await api.uploadPaymentProof(file, user.id);
            
            // 2. Create Payment Request
            await api.submitPaymentRequest(user.id, selectedPlan.id, proofUrl);

            alert("¡Comprobante enviado con éxito! Tu plan se activará en breve tras la verificación del administrador.");
            onBack();
        } catch (error) {
            console.error(error);
            alert("Error al subir el comprobante. Inténtalo de nuevo.");
        } finally {
            setUploading(false);
        }
    };

    const PaymentModal = () => (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setSelectedPlan(null)}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] animate-scale-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h3 className="text-xl font-bold text-gray-900">Confirmar Pago</h3>
                    <button onClick={() => setSelectedPlan(null)}><X className="text-gray-400 hover:text-gray-600" /></button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <p className="text-gray-600 mb-6 text-sm">
                        Para activar el plan <span className="font-bold text-gray-900">{selectedPlan?.name}</span> (Gs. {selectedPlan?.price.toLocaleString()}), por favor realiza una transferencia a los siguientes datos:
                    </p>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                        <h4 className="font-bold text-blue-900 mb-2">Datos Bancarios (Transferencia / SIPAP)</h4>
                        {bankDetails ? (
                            <ul className="space-y-2 text-sm text-blue-800">
                                <li className="flex justify-between"><span>Banco:</span> <span className="font-semibold">{bankDetails.bankName}</span></li>
                                <li className="flex justify-between"><span>Titular:</span> <span className="font-semibold">{bankDetails.accountName}</span></li>
                                <li className="flex justify-between"><span>RUC / CI:</span> <span className="font-semibold">{bankDetails.ruc}</span></li>
                                <li className="flex justify-between">
                                    <span>Nro. Cuenta:</span> 
                                    <span className="font-mono font-bold bg-white px-2 rounded cursor-pointer hover:bg-blue-100" title="Copiar">{bankDetails.accountNumber}</span>
                                </li>
                            </ul>
                        ) : (
                            <p className="text-sm text-blue-700">Cargando datos...</p>
                        )}
                    </div>

                    <form onSubmit={handleSubmitPayment} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Subir Comprobante (Captura)</label>
                            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-amber-500 transition-colors bg-gray-50">
                                {file ? (
                                    <div className="text-green-600 font-medium flex flex-col items-center">
                                        <Check className="mb-2" />
                                        {file.name}
                                        <button type="button" onClick={() => setFile(null)} className="text-xs text-red-500 underline mt-2 relative z-10">Cambiar</button>
                                    </div>
                                ) : (
                                    <>
                                        <UploadCloud size={32} className="text-gray-400 mb-2" />
                                        <p className="text-xs text-gray-500">Haz clic para seleccionar o arrastra la imagen aquí.</p>
                                        <input type="file" accept="image/*,application/pdf" className="absolute opacity-0 w-full h-full cursor-pointer inset-0" onChange={handleFileChange} />
                                    </>
                                )}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={!file || uploading}
                            className={`w-full py-3 rounded-lg font-bold text-white shadow-md flex items-center justify-center gap-2 ${
                                !file || uploading ? 'bg-gray-300 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'
                            }`}
                        >
                            {uploading ? <Loader2 className="animate-spin" /> : 'Enviar Comprobante'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in-up pb-12">
            <div className="flex items-center gap-2 mb-8">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Planes de Suscripción</h1>
            </div>

            <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Invierte en tu futuro médico</h2>
                <p className="text-lg text-gray-600">
                    Selecciona un plan, realiza el pago y sube tu comprobante para activar tu cuenta.
                </p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-amber-500" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
                    {plans.map((plan) => {
                        const isCurrentPlan = user.planId === parseInt(plan.id);
                        return (
                            <div 
                                key={plan.id} 
                                className={`relative bg-white rounded-2xl shadow-xl border overflow-hidden flex flex-col transition-transform hover:-translate-y-2 ${
                                    isCurrentPlan ? 'border-amber-500 ring-4 ring-amber-100 scale-105 z-10' : 'border-gray-200'
                                }`}
                            >
                                {isCurrentPlan && (
                                    <div className="absolute top-0 inset-x-0 bg-amber-500 text-white text-xs font-bold text-center py-1 uppercase tracking-wider">
                                        Tu Plan Actual
                                    </div>
                                )}
                                
                                <div className="p-8 flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline mb-6">
                                        <span className="text-3xl font-extrabold text-gray-900">Gs. {plan.price.toLocaleString()}</span>
                                        <span className="text-gray-500 ml-2 text-sm">/ {plan.type.toLowerCase()}</span>
                                    </div>
                                    
                                    <p className="text-gray-600 text-sm mb-6 min-h-[60px]">
                                        {plan.description}
                                    </p>

                                    <ul className="space-y-4 mb-8">
                                        <li className="flex items-start">
                                            <Check className="text-green-500 shrink-0 mr-3" size={20} />
                                            <span className="text-sm text-gray-700">Acceso a todos los módulos</span>
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="text-green-500 shrink-0 mr-3" size={20} />
                                            <span className="text-sm text-gray-700">Exámenes ilimitados</span>
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="text-green-500 shrink-0 mr-3" size={20} />
                                            <span className="text-sm text-gray-700">Soporte Prioritario</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="p-6 bg-gray-50 border-t border-gray-100">
                                    <button
                                        onClick={() => handleSelectPlan(plan)}
                                        disabled={isCurrentPlan}
                                        className={`w-full py-3 px-6 rounded-xl font-bold text-center transition-all shadow-md ${
                                            isCurrentPlan 
                                            ? 'bg-gray-200 text-gray-500 cursor-default' 
                                            : 'bg-amber-500 hover:bg-amber-600 text-white hover:shadow-lg active:scale-95'
                                        }`}
                                    >
                                        {isCurrentPlan ? 'Activado' : 'Seleccionar Plan'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            
            {selectedPlan && <PaymentModal />}
            
            <div className="mt-16 bg-blue-50 rounded-2xl p-8 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 bg-white rounded-full text-blue-600 shadow-sm">
                    <ShieldCheck size={32} />
                </div>
                <div className="text-center md:text-left">
                    <h3 className="text-lg font-bold text-blue-900">Verificación Segura</h3>
                    <p className="text-blue-700 mt-1">
                        Tus pagos son verificados manualmente por nuestro equipo administrativo para garantizar la seguridad de tu cuenta.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPlans;