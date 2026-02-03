import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PaymentRequest, Expense } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus, 
  Trash2, 
  Loader2, 
  PieChart, 
  Calendar,
  User,
  AlertCircle,
  Edit2,
  X,
  ArrowRight,
  Wallet
} from 'lucide-react';
import { PieChart as RePie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const AdminFinances: React.FC = () => {
    // Data State
    const [payments, setPayments] = useState<PaymentRequest[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter/Calc State
    const [admin1Name, setAdmin1Name] = useState('Ricardo');
    const [admin2Name, setAdmin2Name] = useState('Hussein');
    const [admin1Percent, setAdmin1Percent] = useState(70);
    
    // Manual Movement Form (Income, Expense, or Withdrawal)
    const [expenseForm, setExpenseForm] = useState({
        description: '',
        amount: '',
        paidBy: 'Ricardo',
        category: 'Infraestructura',
        date: new Date().toISOString().split('T')[0],
        type: 'expense' // 'income' | 'expense' | 'withdrawal'
    });

    // Payment Edit State
    const [editingPayment, setEditingPayment] = useState<PaymentRequest | null>(null);
    const [editForm, setEditForm] = useState({ finalPrice: '', notes: '' });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [paymentsData, expensesData] = await Promise.all([
                api.getPaymentRequests(),
                api.getExpenses()
            ]);
            // Only count approved payments
            setPayments(paymentsData.filter(p => p.status === 'approved'));
            setExpenses(expensesData);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- CALCULATIONS ---
    
    // 1. REVENUE
    // Student Payments (Final Price or Plan Price)
    const studentRevenue = payments.reduce((sum, p) => sum + (p.finalPrice !== undefined ? p.finalPrice : (p.planPrice || 0)), 0);
    // Manual Extra Income
    const manualIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const totalRevenue = studentRevenue + manualIncome;

    // 2. EXPENSES (Operational only, excludes withdrawals)
    const operationalExpenses = expenses.filter(e => e.type === 'expense' || !e.type).reduce((sum, e) => sum + e.amount, 0);
    
    // 3. NET PROFIT (This is what is split between admins)
    const netProfit = totalRevenue - operationalExpenses;

    // 4. SHARES
    const admin1ShareTotal = Math.round(netProfit * (admin1Percent / 100));
    const admin2ShareTotal = netProfit - admin1ShareTotal;

    // 5. WITHDRAWALS (How much each admin has already taken)
    // We match 'paidBy' to the admin name to track their individual withdrawals
    const admin1Withdrawals = expenses
        .filter(e => e.type === 'withdrawal' && e.paidBy === admin1Name)
        .reduce((sum, e) => sum + e.amount, 0);

    const admin2Withdrawals = expenses
        .filter(e => e.type === 'withdrawal' && e.paidBy === admin2Name)
        .reduce((sum, e) => sum + e.amount, 0);

    // 6. BALANCE DUE
    const admin1Pending = admin1ShareTotal - admin1Withdrawals;
    const admin2Pending = admin2ShareTotal - admin2Withdrawals;

    // --- HANDLERS ---
    
    const handleAddMovement = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseInt(expenseForm.amount);
        if (!amount || amount <= 0) return alert("Monto inválido");

        try {
            await api.createExpense({
                description: expenseForm.description,
                amount: amount,
                paidBy: expenseForm.paidBy === 'Admin 1' ? admin1Name : (expenseForm.paidBy === 'Admin 2' ? admin2Name : expenseForm.paidBy),
                category: expenseForm.category,
                date: expenseForm.date,
                type: expenseForm.type as any
            });
            setExpenseForm({ ...expenseForm, description: '', amount: '' });
            fetchData();
        } catch (e) {
            alert("Error guardando movimiento");
        }
    };

    const handleDeleteExpense = async (id: string) => {
        if (!confirm("¿Eliminar este registro?")) return;
        try {
            await api.deleteExpense(id);
            fetchData();
        } catch (e) {
            alert("Error eliminando");
        }
    };

    const handleEditPayment = (p: PaymentRequest) => {
        setEditingPayment(p);
        setEditForm({
            finalPrice: (p.finalPrice !== undefined ? p.finalPrice : (p.planPrice || 0)).toString(),
            notes: p.notes || ''
        });
    };

    const handleSavePaymentEdit = async () => {
        if (!editingPayment) return;
        const price = parseInt(editForm.finalPrice);
        if (isNaN(price)) return alert("Precio inválido");

        try {
            await api.updatePaymentDetails(editingPayment.id, price, editForm.notes);
            setEditingPayment(null);
            fetchData();
        } catch (e) {
            alert("Error actualizando pago");
        }
    };

    // Chart Data
    const chartData = [
        { name: 'Gastos', value: operationalExpenses, color: '#EF4444' },
        { name: 'Utilidad', value: netProfit > 0 ? netProfit : 0, color: '#10B981' }
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Finanzas y Reparto</h2>
                <p className="text-gray-500 text-sm">Control de ingresos, gastos y división de utilidades.</p>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <TrendingUp size={100} className="text-green-500" />
                    </div>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Ingresos Totales</span>
                    <span className="text-3xl font-extrabold text-gray-900">Gs. {totalRevenue.toLocaleString()}</span>
                    <div className="text-xs text-green-600 mt-2 flex flex-col gap-1">
                        <span className="bg-green-50 px-2 py-1 rounded w-fit">{payments.length} Estudiantes</span>
                        {manualIncome > 0 && <span className="text-gray-500">+ Gs. {manualIncome.toLocaleString()} Extras</span>}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-5">
                        <TrendingDown size={100} className="text-red-500" />
                    </div>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Gastos Operativos</span>
                    <span className="text-3xl font-extrabold text-red-600">Gs. {operationalExpenses.toLocaleString()}</span>
                    <span className="text-xs text-red-600 mt-2 bg-red-50 px-2 py-1 rounded w-fit flex items-center gap-1">
                        <TrendingDown size={14} />
                        {expenses.filter(e => e.type === 'expense' || !e.type).length} Registrados
                    </span>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-5">
                        <DollarSign size={100} className="text-blue-500" />
                    </div>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Utilidad Neta</span>
                    <span className={`text-3xl font-extrabold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                        Gs. {netProfit.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 mt-2">
                         Disponible para reparto
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* --- SPLIT CALCULATOR --- */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                        <PieChart className="text-amber-500" />
                        <h3 className="text-lg font-bold text-gray-900">Estado de Cuentas (Socios)</h3>
                    </div>

                    <div className="flex justify-between mb-2 text-sm font-medium text-gray-500">
                        <span>{admin1Name} ({admin1Percent}%)</span>
                        <span>{admin2Name} ({100 - admin1Percent}%)</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="5"
                        value={admin1Percent} 
                        onChange={(e) => setAdmin1Percent(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500 mb-8"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        {/* Admin 1 Card */}
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 relative">
                            <input 
                                className="bg-transparent text-center font-bold text-blue-900 text-sm mb-2 w-full outline-none border-b border-transparent focus:border-blue-300"
                                value={admin1Name}
                                onChange={(e) => setAdmin1Name(e.target.value)} 
                            />
                            
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-blue-800/70">
                                    <span>Corresponde:</span>
                                    <span className="font-bold">Gs. {admin1ShareTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-red-500">
                                    <span>Retirado:</span>
                                    <span className="font-bold">- Gs. {admin1Withdrawals.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-blue-900 pt-2 border-t border-blue-200">
                                    <span className="font-bold">Saldo:</span>
                                    <span className={`font-extrabold ${admin1Pending < 0 ? 'text-red-600' : 'text-blue-700'}`}>
                                        Gs. {admin1Pending.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Admin 2 Card */}
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 relative">
                            <input 
                                className="bg-transparent text-center font-bold text-purple-900 text-sm mb-2 w-full outline-none border-b border-transparent focus:border-purple-300"
                                value={admin2Name}
                                onChange={(e) => setAdmin2Name(e.target.value)} 
                            />
                            
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-purple-800/70">
                                    <span>Corresponde:</span>
                                    <span className="font-bold">Gs. {admin2ShareTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-red-500">
                                    <span>Retirado:</span>
                                    <span className="font-bold">- Gs. {admin2Withdrawals.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-purple-900 pt-2 border-t border-purple-200">
                                    <span className="font-bold">Saldo:</span>
                                    <span className={`font-extrabold ${admin2Pending < 0 ? 'text-red-600' : 'text-purple-700'}`}>
                                        Gs. {admin2Pending.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-800 flex gap-2 items-center">
                        <AlertCircle size={16} />
                        <p>El "Saldo" es lo que queda disponible para retirar después de los retiros previos.</p>
                    </div>
                </div>

                {/* --- EXPENSE / MOVEMENT FORM --- */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                        <DollarSign className="text-gray-600" />
                        <h3 className="text-lg font-bold text-gray-900">Registrar Movimiento</h3>
                    </div>

                    <form onSubmit={handleAddMovement} className="space-y-4">
                         <div className="grid grid-cols-3 gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                             <button
                                type="button"
                                onClick={() => setExpenseForm({...expenseForm, type: 'expense'})}
                                className={`py-2 rounded-md text-xs sm:text-sm font-bold transition-all ${expenseForm.type === 'expense' ? 'bg-white text-red-600 shadow-sm border border-gray-200' : 'text-gray-500'}`}
                             >
                                 Gasto
                             </button>
                             <button
                                type="button"
                                onClick={() => setExpenseForm({...expenseForm, type: 'withdrawal'})}
                                className={`py-2 rounded-md text-xs sm:text-sm font-bold transition-all ${expenseForm.type === 'withdrawal' ? 'bg-white text-purple-600 shadow-sm border border-gray-200' : 'text-gray-500'}`}
                             >
                                 Retiro
                             </button>
                             <button
                                type="button"
                                onClick={() => setExpenseForm({...expenseForm, type: 'income'})}
                                className={`py-2 rounded-md text-xs sm:text-sm font-bold transition-all ${expenseForm.type === 'income' ? 'bg-white text-green-600 shadow-sm border border-gray-200' : 'text-gray-500'}`}
                             >
                                 Ingreso
                             </button>
                         </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                            <input 
                                required 
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-200 outline-none"
                                placeholder={
                                    expenseForm.type === 'expense' ? "Ej. Pago Servidor" : 
                                    expenseForm.type === 'withdrawal' ? "Ej. Retiro de utilidades Septiembre" :
                                    "Ej. Pago Mensual Aval"
                                }
                                value={expenseForm.description}
                                onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Monto (Gs.)</label>
                                <input 
                                    required 
                                    type="number"
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-200 outline-none"
                                    value={expenseForm.amount}
                                    onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    {expenseForm.type === 'expense' ? 'Pagado Por' : 
                                     expenseForm.type === 'withdrawal' ? 'Beneficiario' :
                                     'Recibido En'}
                                </label>
                                <select 
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-200 outline-none bg-white"
                                    value={expenseForm.paidBy}
                                    onChange={e => setExpenseForm({...expenseForm, paidBy: e.target.value})}
                                >
                                    <option value={admin1Name}>{admin1Name}</option>
                                    <option value={admin2Name}>{admin2Name}</option>
                                    <option value="Caja">Caja Chica</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoría</label>
                                <select 
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-200 outline-none bg-white"
                                    value={expenseForm.category}
                                    onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}
                                >
                                    <option>Infraestructura</option>
                                    <option>Marketing</option>
                                    <option>Desarrollo</option>
                                    <option>Retiro de Utilidades</option>
                                    <option>Cobro Externo</option>
                                    <option>Otros</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha</label>
                                <input 
                                    type="date"
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-200 outline-none"
                                    value={expenseForm.date}
                                    onChange={e => setExpenseForm({...expenseForm, date: e.target.value})}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className={`w-full py-2.5 text-white font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 mt-2 ${
                                expenseForm.type === 'expense' ? 'bg-red-500 hover:bg-red-600' : 
                                expenseForm.type === 'withdrawal' ? 'bg-purple-600 hover:bg-purple-700' :
                                'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            <Plus size={18} /> 
                            {expenseForm.type === 'expense' ? 'Registrar Gasto' : 
                             expenseForm.type === 'withdrawal' ? 'Registrar Retiro' : 
                             'Registrar Ingreso'}
                        </button>
                    </form>
                </div>
            </div>

            {/* --- DETAILED LISTS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Revenue List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                             <User size={18} className="text-gray-500" /> Detalle de Ingresos
                        </h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 bg-gray-50 uppercase sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">Origen / Estudiante</th>
                                    <th className="px-4 py-3">Concepto</th>
                                    <th className="px-4 py-3 text-right">Monto</th>
                                    <th className="px-2 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {/* 1. Student Payments */}
                                {payments.map(p => {
                                    const amount = p.finalPrice !== undefined ? p.finalPrice : (p.planPrice || 0);
                                    return (
                                        <tr key={p.id} className="hover:bg-gray-50 group">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900 truncate max-w-[150px]">{p.userName}</div>
                                                {p.notes && <div className="text-xs text-amber-600 font-bold">{p.notes}</div>}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">{p.planName}</td>
                                            <td className={`px-4 py-3 text-right font-bold ${amount === 0 ? 'text-gray-400' : 'text-green-600'}`}>
                                                Gs. {amount.toLocaleString()}
                                            </td>
                                            <td className="px-2 py-3 text-right">
                                                <button onClick={() => handleEditPayment(p)} className="text-gray-300 hover:text-amber-500 group-hover:text-gray-400">
                                                    <Edit2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {/* 2. Manual Incomes */}
                                {expenses.filter(e => e.type === 'income').map(e => (
                                    <tr key={e.id} className="bg-green-50/30 hover:bg-green-50">
                                        <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[150px]">
                                            Ingreso Extra
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {e.description}
                                            <div className="text-xs text-gray-400">{e.category}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-green-700">
                                            Gs. {e.amount.toLocaleString()}
                                        </td>
                                        <td className="px-2 py-3 text-right">
                                             <button onClick={() => handleDeleteExpense(e.id)} className="text-gray-400 hover:text-red-500">
                                                <Trash2 size={14} />
                                             </button>
                                        </td>
                                    </tr>
                                ))}

                                {payments.length === 0 && expenses.filter(e => e.type === 'income').length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                                            Sin ingresos registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Expenses & Withdrawals List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                             <Wallet size={18} className="text-gray-500" /> Gastos y Retiros
                        </h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 bg-gray-50 uppercase sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">Concepto</th>
                                    <th className="px-4 py-3">Resp. / Benef.</th>
                                    <th className="px-4 py-3 text-right">Monto</th>
                                    <th className="px-4 py-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {expenses.filter(e => e.type !== 'income').length > 0 ? (
                                    expenses.filter(e => e.type !== 'income').map(e => (
                                        <tr key={e.id} className={`hover:bg-gray-50 ${e.type === 'withdrawal' ? 'bg-purple-50/40' : ''}`}>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900">{e.description}</div>
                                                <div className="text-xs text-gray-500 flex gap-2">
                                                    <span className={e.type === 'withdrawal' ? 'text-purple-600 font-bold' : ''}>
                                                        {e.type === 'withdrawal' ? 'RETIRO' : e.category}
                                                    </span> • <span>{new Date(e.date).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">{e.paidBy}</td>
                                            <td className={`px-4 py-3 text-right font-bold ${e.type === 'withdrawal' ? 'text-purple-600' : 'text-red-500'}`}>
                                                Gs. {e.amount.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => handleDeleteExpense(e.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                                            Sin registros.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* EDIT PAYMENT MODAL */}
            {editingPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <h3 className="font-bold text-gray-900">Ajustar Pago de Estudiante</h3>
                            <button onClick={() => setEditingPayment(null)}><X size={20} className="text-gray-500" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Estudiante</p>
                                <p className="font-bold text-gray-900">{editingPayment.userName}</p>
                                <p className="text-xs text-gray-500">{editingPayment.planName}</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Monto Real Cobrado (Gs.)</label>
                                <input 
                                    type="number"
                                    className="w-full border border-gray-300 rounded-lg p-2 font-bold text-lg text-green-700 outline-none focus:ring-2 focus:ring-green-200"
                                    value={editForm.finalPrice}
                                    onChange={(e) => setEditForm({...editForm, finalPrice: e.target.value})}
                                />
                                <p className="text-xs text-gray-400 mt-1">Pon "0" si es una beca o convenio.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nota / Convenio</label>
                                <input 
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-amber-200"
                                    placeholder="Ej. Beca Aval Cursillo"
                                    value={editForm.notes}
                                    onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                                />
                            </div>

                            <button 
                                onClick={handleSavePaymentEdit}
                                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow-sm"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFinances;