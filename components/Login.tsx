import React, { useState } from 'react';
import { ArrowRight, Lock, Mail, User, AlertCircle, Loader2, Calendar, Building2, CheckCircle, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';

const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [affiliation, setAffiliation] = useState('');

  // Helper to translate Supabase errors
  const getFriendlyErrorMessage = (msg: string) => {
      if (msg.includes("Email not confirmed")) return "Tu correo no ha sido confirmado. Revisa tu bandeja de entrada o spam.";
      if (msg.includes("Invalid login credentials")) return "Correo o contraseña incorrectos.";
      if (msg.includes("User already registered")) return "Este correo ya está registrado. Intenta iniciar sesión.";
      if (msg.includes("Password should be")) return "La contraseña es muy débil.";
      return msg;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Validation
        if (!name.trim()) throw new Error("El nombre es obligatorio");
        if (password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres");
        if (password !== confirmPassword) throw new Error("Las contraseñas no coinciden");
        if (!birthDate) throw new Error("La fecha de nacimiento es obligatoria");
        if (!affiliation.trim()) throw new Error("La universidad/afiliación es obligatoria");

        const response = await api.auth.signUp(email, password, name, birthDate, affiliation);
        
        // If Supabase "Confirm Email" is disabled, response.session will be present immediately.
        // If it is present, we don't need to show the "Check Email" screen.
        if (response.session) {
            // Auto-login successful, the App.tsx listener will handle the redirect.
            return;
        }

        // If no session, it means Email Confirmation is ENABLED in Supabase, show instruction.
        setShowSuccessMessage(true);
      } else {
        await api.auth.signIn(email, password);
        // The App component will detect the session change and redirect automatically
      }
    } catch (err: any) {
      console.error(err);
      setError(getFriendlyErrorMessage(err.message || "Ocurrió un error. Verifica tus credenciales."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchMode = () => {
      setIsSignUp(!isSignUp); 
      setError(null); 
      setShowSuccessMessage(false);
      // Reset form if desired, but keeping values is often better UX
  };

  // SUCCESS CONFIRMATION VIEW (Only shown if Supabase requires confirmation)
  if (showSuccessMessage) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4 dark:from-slate-900 dark:to-slate-800">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center animate-fade-in-up dark:bg-slate-800 dark:border dark:border-slate-700">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-green-900/30">
                    <CheckCircle className="text-green-600 dark:text-green-400" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">¡Revisa tu correo!</h2>
                <p className="text-gray-600 mb-6 leading-relaxed dark:text-gray-300">
                    Hemos enviado un enlace de confirmación a <br/> <span className="font-semibold text-gray-800 dark:text-gray-100">{email}</span>.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200">
                    Por favor, haz clic en el enlace del correo para activar tu cuenta y comenzar a estudiar.
                </div>
                <button
                    onClick={() => { setShowSuccessMessage(false); setIsSignUp(false); }}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={18} /> Volver al Inicio de Sesión
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row dark:bg-slate-800">
        
        {/* Left Side - Visual */}
        <div className={`md:w-1/2 p-8 md:p-12 text-white flex flex-col justify-center relative overflow-hidden transition-colors duration-500 bg-amber-500`}>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {isSignUp ? 'Únete a AnatoPlus' : 'Domina la anatomía'}
            </h2>
            <p className="text-lg leading-relaxed text-amber-50">
              {isSignUp 
                ? 'Crea tu cuenta hoy y accede al banco de preguntas más completo para estudiantes de medicina en Paraguay.'
                : 'Continúa tu aprendizaje donde lo dejaste. Sigue tu progreso y mejora tus resultados.'
              }
            </p>
          </div>
          
          <div className="relative z-10 mt-12">
            <div className="flex items-center gap-4">
                <div className="flex -space-x-4">
                    {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-amber-500 bg-gray-300 overflow-hidden">
                        <img src={`https://picsum.photos/seed/${i + 50}/100`} alt="User" className="w-full h-full object-cover"/>
                    </div>
                    ))}
                </div>
                <p className="text-sm font-medium text-amber-50">+500 estudiantes activos</p>
            </div>
          </div>

          {/* Abstract circles */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full opacity-50 blur-3xl bg-orange-400"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full opacity-30 blur-3xl bg-yellow-400"></div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center overflow-y-auto max-h-[90vh]">
          
          <div className="flex justify-between items-center mb-6">
             <img 
               src="/logo-main-1.png" 
               alt="AnatoPlus" 
               className="h-10 w-auto" 
             />
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">
              {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </h3>
            <p className="text-gray-500 text-sm dark:text-gray-400">
              {isSignUp ? 'Completa todos los campos.' : 'Ingresa tu correo y contraseña.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2 animate-fade-in dark:bg-red-900/20 dark:text-red-400">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isSignUp && (
                <>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Nombre Completo</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej. Juan Pérez"
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="space-y-1 flex-1">
                            <label className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Fecha Nacimiento</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="date"
                                    required
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Universidad / Facultad</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                required
                                value={affiliation}
                                onChange={(e) => setAffiliation(e.target.value)}
                                placeholder="Ej. UNA - FCM"
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                        </div>
                    </div>
                </>
            )}

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Correo Electrónico</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tucorreo@ejemplo.com"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Contraseña</label>
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

            {isSignUp && (
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
                    {confirmPassword && password !== confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
                    )}
                </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg transform active:scale-95 bg-amber-500 hover:bg-amber-600 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
              ) : (
                  <>
                    <span>{isSignUp ? 'Registrarse' : 'Entrar'}</span>
                    <ArrowRight size={20} />
                  </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center pt-6 border-t border-gray-100 dark:border-slate-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isSignUp ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta?'}
              <button 
                onClick={handleSwitchMode}
                className="ml-2 font-bold text-amber-600 hover:underline focus:outline-none dark:text-amber-400"
              >
                {isSignUp ? 'Inicia Sesión' : 'Regístrate'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;