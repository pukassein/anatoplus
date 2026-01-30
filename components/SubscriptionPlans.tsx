import React, { useEffect, useState } from 'react';
import { Plan, User, BankDetails, PlanFeature } from '../types';
import { api } from '../services/api';
import { Check, Loader2, ArrowLeft, ShieldCheck, UploadCloud, Copy, X, XCircle, CheckCircle2 } from 'lucide-react';

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

    // Helper to extract features from description JSON
    const getFeatures = (description: string): PlanFeature[] => {
        try {
            const parsed = JSON.parse(description);
            if (Array.isArray(parsed)) return parsed;
            return [{ name: description, included: true }];
        } catch {
            // Fallback for legacy text descriptions
            return description ? [{ name: description, included: true }] : [];
        }
    };

    const PaymentModal = () => (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setSelectedPlan(null)}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] animate-scale-up dark:bg-slate-800"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl dark:bg-slate-700 dark:border-slate-600">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Confirmar Pago</h3>
                    <button onClick={() => setSelectedPlan(null)}><X className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" /></button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <p className="text-gray-600 mb-6 text-sm dark:text-gray-300">
                        Para activar el plan <span className="font-bold text-gray-900 dark:text-white">{selectedPlan?.name}</span> (Gs. {selectedPlan?.price.toLocaleString()}), elige tu método de pago preferido:
                    </p>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 dark:bg-blue-900/20 dark:border-blue-800">
                        {bankDetails ? (
                            <div className="space-y-4">
                                {/* Paraguay Bank Details */}
                                <div>
                                    <h4 className="font-bold text-blue-900 mb-2 border-b border-blue-200 pb-1 dark:text-blue-200 dark:border-blue-700">Opción 1: Banco Local (Paraguay)</h4>
                                    <div className="space-y-3 text-sm text-blue-800 dark:text-blue-300">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-blue-600 uppercase font-bold dark:text-blue-400">Método / Banco</span>
                                            <span className="font-semibold text-lg">{bankDetails.bankName}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-blue-600 uppercase font-bold dark:text-blue-400">Titular</span>
                                            <span className="font-semibold">{bankDetails.accountName}</span>
                                        </div>
                                        <div className="flex flex-col mt-2">
                                            <span className="text-xs text-blue-600 uppercase font-bold mb-1 dark:text-blue-400">Alias / Cuenta (Click para copiar)</span>
                                            <button 
                                                onClick={() => navigator.clipboard.writeText(bankDetails.alias)}
                                                className="font-mono font-bold bg-white p-3 rounded border border-blue-200 text-center hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors dark:bg-slate-900 dark:border-slate-600 dark:hover:bg-slate-800"
                                                title="Copiar al portapapeles"
                                            >
                                                <Copy size={16} />
                                                {bankDetails.alias}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* PIX Option (if available) */}
                                {bankDetails.pixKey && (
                                    <div className="pt-2">
                                        <h4 className="font-bold text-blue-900 mb-2 border-b border-blue-200 pb-1 dark:text-blue-200 dark:border-blue-700">Opción 2: PIX (Brasil)</h4>
                                        <div className="flex flex-col mt-2">
                                            <span className="text-xs text-blue-600 uppercase font-bold mb-1 dark:text-blue-400">Clave PIX (Click para copiar)</span>
                                            <button 
                                                onClick={() => navigator.clipboard.writeText(bankDetails.pixKey || '')}
                                                className="font-mono font-bold bg-white p-3 rounded border border-blue-200 text-center hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors dark:bg-slate-900 dark:border-slate-600 dark:hover:bg-slate-800 text-blue-800 dark:text-blue-300"
                                                title="Copiar Clave PIX"
                                            >
                                                <Copy size={16} />
                                                {bankDetails.pixKey}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-blue-700">Cargando datos...</p>
                        )}
                    </div>

                    <form onSubmit={handleSubmitPayment} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 dark:text-gray-300">Subir Comprobante (Captura)</label>
                            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-amber-500 transition-colors bg-gray-50 dark:bg-slate-700 dark:border-slate-600">
                                {file ? (
                                    <div className="text-green-600 font-medium flex flex-col items-center dark:text-green-400">
                                        <Check className="mb-2" />
                                        {file.name}
                                        <button type="button" onClick={() => setFile(null)} className="text-xs text-red-500 underline mt-2 relative z-10 dark:text-red-400">Cambiar</button>
                                    </div>
                                ) : (
                                    <>
                                        <UploadCloud size={32} className="text-gray-400 mb-2" />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Haz clic para seleccionar o arrastra la imagen aquí.</p>
                                        <input type="file" accept="image/*,application/pdf" className="absolute opacity-0 w-full h-full cursor-pointer inset-0" onChange={handleFileChange} />
                                    </>
                                )}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={!file || uploading}
                            className={`w-full py-3 rounded-lg font-bold text-white shadow-md flex items-center justify-center gap-2 ${
                                !file || uploading ? 'bg-gray-300 cursor-not-allowed dark:bg-slate-600' : 'bg-amber-600 hover:bg-amber-700'
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
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 dark:hover:bg-slate-700 dark:text-gray-300">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Planes de Suscripción</h1>
            </div>

            <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4 dark:text-white">Invierte en tu futuro médico</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
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
                        const features = getFeatures(plan.description);

                        return (
                            <div 
                                key={plan.id} 
                                className={`relative bg-white rounded-2xl shadow-xl border overflow-hidden flex flex-col transition-transform hover:-translate-y-2 dark:bg-slate-800 ${
                                    isCurrentPlan ? 'border-amber-500 ring-4 ring-amber-100 scale-105 z-10 dark:ring-amber-900/30' : 'border-gray-200 dark:border-slate-700'
                                }`}
                            >
                                {isCurrentPlan && (
                                    <div className="absolute top-0 inset-x-0 bg-amber-500 text-white text-xs font-bold text-center py-1 uppercase tracking-wider">
                                        Tu Plan Actual
                                    </div>
                                )}
                                
                                <div className="p-8 flex-1">
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">{plan.name}</h3>
                                        <div className="flex items-center justify-center">
                                            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">Gs. {plan.price.toLocaleString()}</span>
                                        </div>
                                        <span className="text-gray-500 text-sm uppercase tracking-wide dark:text-gray-400">{plan.type}</span>
                                    </div>
                                    
                                    <div className="border-t border-gray-100 pt-6 dark:border-slate-700">
                                        <ul className="space-y-4">
                                            {features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start">
                                                    {feature.included ? (
                                                        <CheckCircle2 className="text-green-500 shrink-0 mr-3 mt-0.5" size={20} />
                                                    ) : (
                                                        <XCircle className="text-red-400 shrink-0 mr-3 mt-0.5" size={20} />
                                                    )}
                                                    <span className={`text-sm ${feature.included ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500 line-through'}`}>
                                                        {feature.name}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="p-6 bg-gray-50 border-t border-gray-100 dark:bg-slate-700/50 dark:border-slate-700">
                                    <button
                                        onClick={() => handleSelectPlan(plan)}
                                        disabled={isCurrentPlan}
                                        className={`w-full py-3 px-6 rounded-xl font-bold text-center transition-all shadow-md ${
                                            isCurrentPlan 
                                            ? 'bg-gray-200 text-gray-500 cursor-default dark:bg-slate-600 dark:text-gray-400' 
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
            
            <div className="mt-16 bg-blue-50 rounded-2xl p-8 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 dark:bg-blue-900/20">
                <div className="p-4 bg-white rounded-full text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400">
                    <ShieldCheck size={32} />
                </div>
                <div className="text-center md:text-left">
                    <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200">Verificación Segura</h3>
                    <p className="text-blue-700 mt-1 dark:text-blue-300">
                        Tus pagos son verificados manualmente por nuestro equipo administrativo para garantizar la seguridad de tu cuenta.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPlans;