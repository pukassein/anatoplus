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
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl dark:bg-slate-700 dark:border-slate-600">
                    <div>
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirmar Suscripción</h3>
                         <p className="text-sm text-gray-500 dark:text-gray-400">Plan {selectedPlan?.name} • Gs. {selectedPlan?.price.toLocaleString()}</p>
                    </div>
                    <button onClick={() => setSelectedPlan(null)} className="p-2 hover:bg-gray-200 rounded-full dark:hover:bg-slate-600"><X className="text-gray-500 dark:text-gray-400" size={20} /></button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
                    
                    {/* STEP 1 */}
                    <section>
                         <div className="flex items-center gap-3 mb-4">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm dark:bg-blue-900/50 dark:text-blue-300">1</span>
                            <h4 className="font-bold text-gray-800 text-lg dark:text-gray-200">Realiza la Transferencia</h4>
                         </div>

                        <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 dark:bg-blue-900/10 dark:border-blue-800/50">
                            {bankDetails ? (
                                <div className="space-y-6">
                                    {/* Paraguay Bank Details */}
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h5 className="font-bold text-blue-900 dark:text-blue-200 text-sm uppercase tracking-wide">Opción 1: Banco Local</h5>
                                            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-200">PY</span>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm space-y-2 dark:bg-slate-800 dark:border-slate-700">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Banco:</span>
                                                <span className="font-medium text-gray-900 dark:text-gray-200">{bankDetails.bankName}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Titular:</span>
                                                <span className="font-medium text-gray-900 dark:text-gray-200 text-right">{bankDetails.accountName}</span>
                                            </div>
                                            <div className="pt-2 border-t border-gray-100 mt-2 dark:border-slate-700">
                                                <p className="text-xs text-gray-500 mb-1 dark:text-gray-400">Cuenta / Alias:</p>
                                                <button 
                                                    onClick={() => navigator.clipboard.writeText(bankDetails.alias)}
                                                    className="w-full flex items-center justify-between bg-gray-50 hover:bg-blue-50 p-2 rounded border border-gray-200 hover:border-blue-300 transition-all group dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600"
                                                >
                                                    <span className="font-mono font-bold text-blue-700 dark:text-blue-300">{bankDetails.alias}</span>
                                                    <Copy size={14} className="text-gray-400 group-hover:text-blue-500" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PIX Option */}
                                    {bankDetails.pixKey && (
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h5 className="font-bold text-green-700 dark:text-green-400 text-sm uppercase tracking-wide">Opción 2: PIX</h5>
                                                <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded dark:bg-green-900 dark:text-green-200">BR</span>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border border-green-100 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                                                <p className="text-xs text-gray-500 mb-1 dark:text-gray-400">Clave PIX:</p>
                                                <button 
                                                    onClick={() => navigator.clipboard.writeText(bankDetails.pixKey || '')}
                                                    className="w-full flex items-center justify-between bg-gray-50 hover:bg-green-50 p-2 rounded border border-gray-200 hover:border-green-300 transition-all group dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600"
                                                >
                                                    <span className="font-mono font-bold text-green-700 dark:text-green-400 text-sm break-all text-left">{bankDetails.pixKey}</span>
                                                    <Copy size={14} className="text-gray-400 group-hover:text-green-500 shrink-0 ml-2" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex justify-center p-4"><Loader2 className="animate-spin text-blue-500" /></div>
                            )}
                        </div>
                    </section>

                    {/* STEP 2 */}
                    <section>
                         <div className="flex items-center gap-3 mb-4">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold text-sm dark:bg-amber-900/50 dark:text-amber-300">2</span>
                            <h4 className="font-bold text-gray-800 text-lg dark:text-gray-200">Adjunta el Comprobante</h4>
                         </div>
                        
                        <form onSubmit={handleSubmitPayment} className="space-y-4">
                            <div className="relative group">
                                <input 
                                    type="file" 
                                    accept="image/*,application/pdf" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                    onChange={handleFileChange} 
                                />
                                <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all duration-200 ${
                                    file 
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-500' 
                                    : 'border-gray-300 bg-gray-50 hover:border-amber-400 hover:bg-amber-50 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600 dark:hover:border-amber-500'
                                }`}>
                                    {file ? (
                                        <div className="animate-scale-up flex flex-col items-center">
                                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2 dark:bg-green-900/50">
                                                <Check className="text-green-600 dark:text-green-400" size={24} />
                                            </div>
                                            <p className="font-bold text-green-700 text-sm dark:text-green-400 line-clamp-1 break-all max-w-[200px]">{file.name}</p>
                                            <span className="text-xs text-green-600 mt-1 dark:text-green-500 bg-green-100 px-2 py-0.5 rounded">Listo para enviar</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center py-2">
                                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform dark:bg-amber-900/30">
                                                <UploadCloud className="text-amber-600 dark:text-amber-400" size={24} />
                                            </div>
                                            <p className="font-bold text-gray-700 dark:text-gray-300">Toca para subir captura</p>
                                            <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Requerido para activar</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={!file || uploading}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all mt-4 ${
                                    !file || uploading 
                                    ? 'bg-gray-300 cursor-not-allowed dark:bg-slate-600 dark:text-gray-400' 
                                    : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 hover:shadow-amber-500/30 transform active:scale-[0.98]'
                                }`}
                            >
                                {uploading ? <Loader2 className="animate-spin" /> : 'Confirmar y Enviar'}
                            </button>
                        </form>
                    </section>
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