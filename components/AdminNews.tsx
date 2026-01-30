import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { NewsPost } from '../types';
import { Plus, Edit2, Trash2, X, Loader2, Save, Image as ImageIcon, UploadCloud } from 'lucide-react';

const AdminNews: React.FC = () => {
    const [news, setNews] = useState<NewsPost[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<NewsPost | null>(null);
    const [uploading, setUploading] = useState(false);

    const [form, setForm] = useState({
        title: '',
        studentName: '',
        message: '',
        imageUrl: ''
    });

    const refreshNews = async () => {
        setIsLoading(true);
        try {
            const data = await api.getNews();
            setNews(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshNews();
    }, []);

    const handleOpenModal = (item?: NewsPost) => {
        if (item) {
            setEditingItem(item);
            setForm({
                title: item.title,
                studentName: item.studentName,
                message: item.message,
                imageUrl: item.imageUrl
            });
        } else {
            setEditingItem(null);
            setForm({
                title: '',
                studentName: '',
                message: '',
                imageUrl: 'https://picsum.photos/200'
            });
        }
        setIsModalOpen(true);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploading(true);
            try {
                const url = await api.uploadNewsImage(file);
                setForm(prev => ({ ...prev, imageUrl: url }));
            } catch(e: any) {
                console.error(e);
                const msg = e.message || "Error desconocido";
                // Check for RLS policy errors
                if (msg.includes("row-level security") || msg.includes("new row violates")) {
                    alert("⚠️ Error de Permisos en Supabase:\n\nFaltan las 'Policies' en el bucket 'news-images'.\n\nPor favor ejecuta el código SQL proporcionado para habilitar las subidas.");
                } else {
                    alert(`Error subiendo imagen: ${msg}`);
                }
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editingItem) {
                await api.updateNews(editingItem.id, form);
            } else {
                await api.createNews(form);
            }
            await refreshNews();
            setIsModalOpen(false);
        } catch (e: any) {
            alert("Error: " + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar esta historia?")) return;
        setIsLoading(true);
        try {
            await api.deleteNews(id);
            await refreshNews();
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Novedades y Testimonios</h2>
                    <p className="text-gray-500 text-sm">Comparte historias de éxito para motivar a los estudiantes.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
                >
                    <Plus size={20} />
                    Nueva Historia
                </button>
            </div>

            {isLoading && !isModalOpen && <Loader2 className="animate-spin text-amber-500 mx-auto" />}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map(item => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                         <div className="h-32 bg-gray-100 relative">
                             <img src={item.imageUrl} alt={item.studentName} className="w-full h-full object-cover" />
                             <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                 <h3 className="text-white font-bold truncate">{item.studentName}</h3>
                                 <p className="text-white/80 text-xs">{item.title}</p>
                             </div>
                         </div>
                         <div className="p-4 flex-1">
                             <p className="text-gray-600 text-sm italic line-clamp-3">"{item.message}"</p>
                         </div>
                         <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                             <button onClick={() => handleOpenModal(item)} className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"><Edit2 size={18}/></button>
                             <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={18}/></button>
                         </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <h3 className="text-lg font-bold text-gray-900">{editingItem ? 'Editar' : 'Crear'} Historia</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre del Estudiante</label>
                                <input required className="w-full border p-2 rounded mt-1" value={form.studentName} onChange={e => setForm({...form, studentName: e.target.value})} placeholder="Ej. Ana Gomez" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Título / Logro</label>
                                <input required className="w-full border p-2 rounded mt-1" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Ej. Ingresó puesto 1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Testimonio</label>
                                <textarea required rows={4} className="w-full border p-2 rounded mt-1" value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Lo que dijo el estudiante..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Foto</label>
                                <div className="mt-1 flex flex-col gap-3">
                                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center hover:border-amber-500 transition-colors bg-gray-50">
                                         {uploading ? (
                                             <Loader2 className="animate-spin text-amber-600" />
                                         ) : (
                                             <>
                                                <UploadCloud size={24} className="text-gray-400 mb-2" />
                                                <span className="text-xs text-gray-500">Click para subir foto</span>
                                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                                             </>
                                         )}
                                    </div>
                                    
                                    <input 
                                        className="w-full border p-2 rounded text-xs text-gray-500" 
                                        value={form.imageUrl} 
                                        onChange={e => setForm({...form, imageUrl: e.target.value})} 
                                        placeholder="O pega una URL directa..." 
                                    />
                                    
                                    {form.imageUrl && (
                                        <div className="w-full flex justify-center">
                                            <img src={form.imageUrl} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-amber-100" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" disabled={isLoading || uploading} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminNews;