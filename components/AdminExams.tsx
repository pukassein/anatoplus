import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, RotateCcw, Send } from 'lucide-react';
import { api } from '../services/api';

const AdminExams: React.FC = () => {
  const [rows,setRows]=useState<any[]>([]), [detail,setDetail]=useState<any>(null), [loading,setLoading]=useState(true);
  const load=()=>api.exams.adminResults().then(setRows);
  useEffect(()=>{ load().finally(()=>setLoading(false)); },[]);
  const open=async(id:string)=> setDetail(detail?.attemptId===id?null:await api.exams.adminAttempt(id));
  const publish=async(examId:string,published:boolean)=>{ await api.exams.publishResults(examId,published); await load(); };
  const retry=async(examId:string,userId:string)=>{ if(!confirm('¿Dar un intento adicional a este estudiante?'))return; await api.exams.grantRetry(examId,userId); alert('Intento adicional habilitado.'); };
  if(loading) return <Loader2 className="animate-spin text-amber-500"/>;
  return <div className="space-y-5">
    <div className="flex flex-wrap justify-between gap-4"><div><h1 className="text-2xl font-bold text-gray-900">Resultados de simulados</h1><p className="text-gray-500">Entregas y respuestas registradas por estudiante.</p></div>{rows[0]&&<button onClick={()=>publish(rows[0].examId,!rows[0].resultsPublished)} className={`px-5 py-3 rounded-xl font-bold flex gap-2 ${rows[0].resultsPublished?'bg-gray-200 text-gray-700':'bg-indigo-600 text-white'}`}><Send size={18}/>{rows[0].resultsPublished?'Ocultar resultados':'Publicar resultados'}</button>}</div>
    <div className="bg-white rounded-xl border overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-left"><tr><th className="p-3">Estudiante</th><th>Simulado</th><th>Estado</th><th>Puntaje</th><th>Inicio</th><th>Entrega</th><th></th></tr></thead><tbody>
      {rows.map(r=><React.Fragment key={r.attemptId}><tr className="border-t"><td className="p-3"><b>{r.studentName}</b><div className="text-gray-400">{r.studentEmail}</div></td><td>{r.examTitle}</td><td>{r.status}</td><td>{r.score??'—'}/{r.totalQuestions}</td><td>{new Date(r.startedAt).toLocaleString()}</td><td>{r.submittedAt?new Date(r.submittedAt).toLocaleString():'—'}</td><td><div className="flex"><button title="Dar otro intento" onClick={()=>retry(r.examId,r.userId)} className="p-2 text-indigo-600"><RotateCcw size={18}/></button><button onClick={()=>open(r.attemptId)} className="p-2">{detail?.attemptId===r.attemptId?<ChevronUp/>:<ChevronDown/>}</button></div></td></tr>
      {detail?.attemptId===r.attemptId&&<tr><td colSpan={7} className="p-4 bg-gray-50"><div className="space-y-3">{detail.questions.map((q:any)=><div key={q.externalId} className={`p-3 rounded border ${q.isCorrect?'border-green-200 bg-green-50':'border-red-200 bg-red-50'}`}><b>{q.order}. {q.text}</b><div className="mt-1">Respondió: {q.selectedOptionId||'Sin respuesta'} {q.selectedText&&`— ${q.selectedText}`}</div><div className="text-green-700">Correcta: {q.correctOptionId} — {q.correctText}</div></div>)}</div></td></tr>}</React.Fragment>)}
      {!rows.length&&<tr><td colSpan={7} className="p-8 text-center text-gray-400">Todavía no hay intentos.</td></tr>}
    </tbody></table></div>
  </div>;
};
export default AdminExams;
