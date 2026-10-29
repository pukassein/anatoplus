import React from 'react';
import { ArrowLeft, PlayCircle, FileText, Download, Sparkles } from 'lucide-react';
import { User } from '../types';

interface ClaseRepasoViewProps {
  user: User;
  onBack: () => void;
}

interface VideoCardProps {
  title: string;
  description: string;
  videoUrl: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ title, description, videoUrl }) => (
  <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
    <div className="relative aspect-video bg-black">
      <iframe
        className="absolute inset-0 h-full w-full"
        src={videoUrl}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
    <div className="p-4 md:p-5">
      <h3 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
        <PlayCircle className="shrink-0 text-emerald-500" size={21} />
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </article>
);

interface ClassSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  badge?: string;
  children: React.ReactNode;
}

const ClassSection: React.FC<ClassSectionProps> = ({ eyebrow, title, description, badge, children }) => (
  <section className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-50/70 dark:border-slate-700 dark:bg-slate-900/40">
    <header className="flex flex-col gap-3 border-b border-gray-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-7 dark:border-slate-700">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-black text-gray-900 md:text-2xl dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      {badge && (
        <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          {badge}
        </span>
      )}
    </header>
    <div className="p-4 md:p-6">{children}</div>
  </section>
);

const ClaseRepasoView: React.FC<ClaseRepasoViewProps> = ({ onBack }) => {
  const repaso3PdfUrl = 'https://opszqrjbygrdmiwgbdyj.supabase.co/storage/v1/object/public/pdf/REPASO%20ANATOPLUS%203p.pdf';
  const repaso2PdfUrl = 'https://opszqrjbygrdmiwgbdyj.supabase.co/storage/v1/object/public/pdf/REPASO%20ANATOPLUS%202DO%20PARCIAL.pdf';

  return (
    <div className="mx-auto max-w-6xl animate-fade-in p-4 md:p-6">
      <div className="mb-7 flex items-center gap-4">
        <button
          onClick={onBack}
          className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
          aria-label="Volver al inicio"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clases de repaso</h1>
          <p className="text-gray-500 dark:text-gray-400">Elige el parcial y continúa con la clase que necesitas.</p>
        </div>
      </div>

      <div className="space-y-7">
        <ClassSection
          eyebrow="3er parcial"
          title="Repaso AnatoPlus 3"
          description="Dos clases en video y material de apoyo en PDF."
          badge="MÁS RECIENTE"
        >
          <div className="mb-5 flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white shadow-md sm:flex-row sm:items-center sm:justify-between md:p-6">
            <div className="flex items-start gap-3">
              <span className="rounded-xl bg-white/15 p-3"><Sparkles size={24} /></span>
              <div>
                <h3 className="font-black">Material de repaso del 3er parcial</h3>
                <p className="mt-1 text-sm text-emerald-50">Consulta el PDF en línea o descárgalo para estudiar sin conexión.</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <a href={repaso3PdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-50">
                <FileText size={18} /> Ver PDF
              </a>
              <a href={repaso3PdfUrl} download="Repaso-AnatoPlus-3.pdf" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/20">
                <Download size={18} /> Descargar
              </a>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <VideoCard
              title="Parte 1"
              description="Primera parte del repaso intensivo para el 3er parcial."
              videoUrl="https://www.youtube.com/embed/QfBjp-QEKCQ"
            />
            <VideoCard
              title="Parte 2"
              description="Segunda parte del repaso intensivo para el 3er parcial."
              videoUrl="https://www.youtube.com/embed/0DmVjLn57NE"
            />
          </div>
        </ClassSection>

        <ClassSection
          eyebrow="2do parcial"
          title="Repaso del segundo parcial"
          description="Clase completa y material de apoyo."
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.7fr)]">
            <VideoCard
              title="Clase completa"
              description="Repaso intensivo para el 2do parcial de Anatomía."
              videoUrl="https://www.youtube.com/embed/jLfNpFSpx-4"
            />
            <div className="flex flex-col justify-center rounded-2xl border border-emerald-100 bg-emerald-50 p-5 dark:border-emerald-900/60 dark:bg-emerald-900/20">
              <span className="mb-4 w-fit rounded-xl bg-white p-3 text-emerald-600 shadow-sm dark:bg-slate-800 dark:text-emerald-400"><FileText size={25} /></span>
              <h3 className="font-black text-gray-900 dark:text-white">PDF del segundo parcial</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">Acompaña la clase con el material de lectura y ejercicios.</p>
              <a href={repaso2PdfUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700">
                <FileText size={18} /> Ver / Descargar PDF
              </a>
            </div>
          </div>
        </ClassSection>

        <ClassSection
          eyebrow="1er parcial"
          title="Repaso del primer parcial"
          description="La clase está dividida en dos partes para que avances en orden."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <VideoCard
              title="Parte 1"
              description="Primera parte del repaso intensivo para el 1er parcial."
              videoUrl="https://www.youtube.com/embed/VcZnRAnI1Po"
            />
            <VideoCard
              title="Parte 2"
              description="Segunda parte del repaso intensivo para el 1er parcial."
              videoUrl="https://www.youtube.com/embed/GA0HN5Tc3Hk"
            />
          </div>
        </ClassSection>
      </div>
    </div>
  );
};

export default ClaseRepasoView;
