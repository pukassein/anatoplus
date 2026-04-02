import React, { useState } from 'react';
import { Lock, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { ViewState } from '../types';

interface UpdatePasswordProps {
  onComplete: () => void;
}

const UpdatePassword: React.FC<UpdatePasswordProps> = ({ onComplete }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);
    try {
      await api.auth.updatePassword(password);
      setIsSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocurrió un error al actualizar la contraseña.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center animate-fade-in-up dark:bg-slate-800 dark:border dark:border-slate-700">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-green-900/30">
            <CheckCircle className="text-green-600 dark:text-green-400" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">¡Contraseña Actualizada!</h2>
          <p className="text-gray-600 mb-6 leading-relaxed dark:text-gray-300">
            Tu contraseña ha sido cambiada exitosamente. Redirigiendo...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 dark:bg-slate-800 dark:border dark:border-slate-700">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Actualizar Contraseña</h2>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Ingresa tu nueva contraseña a continuación.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Nueva Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Confirmar Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-500 outline-none transition-all dark:bg-slate-700 dark:text-white ${
                  confirmPassword && password !== confirmPassword ? 'border-red-300 focus:border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg transform active:scale-95 bg-amber-500 hover:bg-amber-600 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span>Actualizar Contraseña</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
