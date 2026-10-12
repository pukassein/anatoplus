import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Flag, Loader2, Send } from 'lucide-react';
import { api } from '../services/api';
import { Exam, ExamAttempt, ExamQuestion, ExamReviewQuestion } from '../types';

interface Props { slug: string; onBack: () => void }

const ExamView: React.FC<Props> = ({ slug, onBack }) => {
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [review, setReview] = useState<ExamReviewQuestion[]>([]);
  const [canStartNew, setCanStartNew] = useState(false);

  useEffect(() => {
    api.exams.getPublished(slug).then(({ exam, questions, latestAttempt, review, canStartNew }) => {
      setExam(exam); setQuestions(questions); setReview(review || []);
      setCanStartNew(Boolean(canStartNew));
      if (latestAttempt) { setAttempt(latestAttempt); setAnswers(latestAttempt.answers || {}); }
    }).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!attempt || attempt.status !== 'in_progress') return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [attempt]);

  const secondsLeft = useMemo(() => {
    if (!attempt || !exam) return 0;
    const end = new Date(attempt.startedAt).getTime() + exam.durationMinutes * 60000;
    return Math.max(0, Math.ceil((end - now) / 1000));
  }, [attempt, exam, now]);

  useEffect(() => {
    if (attempt?.status === 'in_progress' && secondsLeft === 0) submit();
  }, [secondsLeft]);

  const start = async () => {
    if (!exam) return;
    setLoading(true); setError('');
    try {
      const value = await api.exams.start(exam.id);
      setAttempt(value); setAnswers(value.answers || {}); setNow(Date.now());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const choose = async (questionId: string, optionId: string) => {
    if (!attempt) return;
    setAnswers(v => ({ ...v, [questionId]: optionId })); setSaving(questionId);
    try { await api.exams.saveAnswer(attempt.id, questionId, optionId); }
    catch (e: any) { setError(`No se pudo guardar la respuesta: ${e.message}`); }
    finally { setSaving(null); }
  };

  const submit = async () => {
    if (!attempt || attempt.status !== 'in_progress') return;
    setLoading(true);
    try { setAttempt(await api.exams.submit(attempt.id)); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="min-h-[55vh] flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={42}/></div>;
  if (error && !exam) return <div className="max-w-xl mx-auto p-8 text-center"><p className="text-red-600 mb-4">{error}</p><button onClick={onBack}>Volver</button></div>;
  if (!exam) return null;

  if (!attempt) return <div className="max-w-2xl mx-auto py-10">
    <button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-6"><ArrowLeft size={20}/> Volver</button>
    <div className="bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 shadow-sm p-8">
      <h1 className="text-3xl font-bold dark:text-white">{exam.title}</h1>
      <p className="text-gray-500 mt-2">{exam.description}</p>
      <div className="flex gap-5 my-6 text-sm dark:text-gray-300"><span className="flex gap-2"><Clock size={18}/>{exam.durationMinutes} minutos</span><span>{exam.questionCount} preguntas</span><span>{exam.maxAttempts} intento</span></div>
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-5 dark:bg-amber-900/20 dark:border-amber-700">
        <h2 className="font-bold text-lg text-amber-900 dark:text-amber-200 mb-3">Antes de comenzar</h2>
        <ul className="space-y-3 text-gray-700 dark:text-gray-200 list-disc pl-5">
          <li><b>Tienes {exam.maxAttempts === 1 ? 'un solo intento' : `${exam.maxAttempts} intentos`}</b> para completar el simulado.</li>
          <li>Dispones de <b>{exam.durationMinutes} minutos</b>. El tiempo comienza al presionar “Comenzar simulado”.</li>
          <li>Las respuestas se guardan automáticamente. Si cierras la página por accidente, puedes volver a entrar y continuar.</li>
          <li>Al salir, <b>el reloj no se detiene ni vuelve a comenzar</b>; seguirás teniendo únicamente el tiempo restante del intento original.</li>
          <li>Puedes cambiar tus respuestas antes de entregar. Al llegar a cero, el examen se entrega automáticamente.</li>
          <li>Después de entregar no podrás volver a responder, salvo que un administrador te habilite otro intento.</li>
          {exam.instructions.filter(x => !/una sola respuesta|revisar y cambiar|automáticamente/i.test(x)).map((x, i) => <li key={i}>{x}</li>)}
        </ul>
      </div>
      {error && <p className="text-red-600 mt-4">{error}</p>}
      <button onClick={start} className="mt-8 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl">Comenzar simulado</button>
    </div>
  </div>;

  if (attempt.status !== 'in_progress') return <div className="max-w-3xl mx-auto py-16 text-center">
    <CheckCircle className="mx-auto text-green-500 mb-4" size={64}/><h1 className="text-3xl font-bold dark:text-white">Simulado entregado</h1>
    <p className="text-gray-500 mt-2">Tus respuestas quedaron registradas correctamente.</p>
    {exam.showScoreAfterSubmission && <div className="text-5xl font-bold text-amber-500 my-8">{attempt.score}/{attempt.totalQuestions}</div>}
    {review.length ? <div className="text-left space-y-4 my-8"><h2 className="text-2xl font-bold dark:text-white">Revisión de respuestas</h2>{review.map(q => <div key={q.externalId} className={`p-4 rounded-xl border ${q.isCorrect?'border-green-300 bg-green-50 dark:bg-green-900/20':'border-red-300 bg-red-50 dark:bg-red-900/20'}`}><h3 className="font-bold dark:text-white">{q.order}. {q.text}</h3><p className="mt-2 dark:text-gray-200">Tu respuesta: <b>{q.selectedOptionId || 'Sin respuesta'}</b>{q.selectedText ? ` — ${q.selectedText}` : ''}</p><p className="text-green-700 dark:text-green-400">Respuesta correcta: <b>{q.correctOptionId}</b> — {q.correctText}</p></div>)}</div> : <p className="bg-amber-50 text-amber-800 rounded-xl p-4 my-6">Ya resolviste este simulado. Las respuestas correctas estarán disponibles cuando el administrador publique los resultados.</p>}
    <div className="flex justify-center gap-3">{canStartNew&&<button onClick={()=>{setAttempt(null);setAnswers({});setReview([]);}} className="px-6 py-3 bg-indigo-600 text-white rounded-xl">Comenzar intento adicional</button>}<button onClick={onBack} className="px-6 py-3 bg-slate-800 text-white rounded-xl">Volver al inicio</button></div>
  </div>;

  const q = questions[index];
  const mm = Math.floor(secondsLeft / 60); const ss = secondsLeft % 60;
  return <div className="max-w-5xl mx-auto py-6">
    <div className="flex items-center justify-between mb-5 sticky top-0 z-10 bg-gray-50 dark:bg-slate-900 py-3">
      <button onClick={onBack} className="flex gap-2 text-gray-500"><ArrowLeft size={20}/> Salir</button>
      <div className={`font-bold flex gap-2 items-center ${secondsLeft < 300 ? 'text-red-600' : 'dark:text-white'}`}><Clock size={20}/>{mm}:{ss.toString().padStart(2,'0')}</div>
    </div>
    {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
    <div className="grid lg:grid-cols-[1fr_240px] gap-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 p-6">
        <div className="flex justify-between gap-3"><span className="text-sm text-gray-500">Pregunta {index + 1} de {questions.length}</span><button onClick={() => setFlagged(v => { const n=new Set(v); n.has(q.id)?n.delete(q.id):n.add(q.id); return n; })} className={flagged.has(q.id)?'text-amber-500':'text-gray-400'}><Flag size={20}/></button></div>
        <h2 className="text-xl font-semibold my-5 dark:text-white">{q.text}</h2>
        <div className="space-y-3">{q.options.map(opt => <button key={opt.id} onClick={() => choose(q.id,opt.id)} className={`w-full text-left p-4 rounded-xl border transition ${answers[q.id]===opt.id?'border-amber-500 bg-amber-50 dark:bg-amber-900/20':'border-gray-200 dark:border-slate-600 dark:text-gray-200'}`}><b className="mr-3">{opt.id}.</b>{opt.text}</button>)}</div>
        <div className="flex justify-between mt-7"><button disabled={index===0} onClick={() => setIndex(v=>v-1)} className="px-4 py-2 disabled:opacity-30">Anterior</button><button disabled={index===questions.length-1} onClick={() => setIndex(v=>v+1)} className="px-4 py-2 flex gap-2 items-center disabled:opacity-30">Siguiente <ArrowRight size={18}/></button></div>
      </div>
      <aside className="bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 p-4 h-fit">
        <div className="grid grid-cols-5 gap-2">{questions.map((item,i)=><button key={item.id} onClick={()=>setIndex(i)} className={`h-9 rounded-lg text-sm ${i===index?'ring-2 ring-amber-500':answers[item.id]?'bg-green-100 text-green-800':'bg-gray-100 text-gray-600'} ${flagged.has(item.id)?'border-b-4 border-amber-400':''}`}>{i+1}</button>)}</div>
        <p className="text-xs text-gray-500 mt-4">{Object.keys(answers).length} de {questions.length} respondidas {saving && '· Guardando…'}</p>
        <button onClick={() => window.confirm(`¿Entregar con ${questions.length-Object.keys(answers).length} preguntas sin responder?`) && submit()} className="mt-4 w-full bg-indigo-600 text-white font-bold py-3 rounded-xl flex justify-center gap-2"><Send size={18}/> Entregar</button>
      </aside>
    </div>
  </div>;
};

export default ExamView;
