import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { NewsPost } from '../types';
import { Quote, Trophy, Loader2 } from 'lucide-react';

const NewsFeed: React.FC = () => {
    const [news, setNews] = useState<NewsPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const data = await api.getNews();
                setNews(data);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNews();
    }, []);

    if (isLoading) return (
        <div className="flex justify-center p-8">
            <Loader2 className="animate-spin text-amber-500 opacity-50" size={24} />
        </div>
    );

    if (news.length === 0) return null;

    return (
        <div className="mt-8 mb-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
                <Trophy className="text-amber-500" size={24} />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Salón de la Fama y Novedades</h2>
            </div>
            
            {/* Horizontal Scroll Container */}
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                {news.map(item => (
                    <div 
                        key={item.id} 
                        className="flex-shrink-0 w-80 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative hover:shadow-md transition-shadow group dark:bg-slate-800 dark:border-slate-700"
                    >
                        {/* Quote Icon Background */}
                        <div className="absolute top-4 right-4 text-amber-100 group-hover:text-amber-200 transition-colors dark:text-amber-900/30 dark:group-hover:text-amber-900/50">
                            <Quote size={40} />
                        </div>

                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <img 
                                src={item.imageUrl} 
                                alt={item.studentName} 
                                className="w-12 h-12 rounded-full object-cover border-2 border-amber-100 dark:border-amber-900"
                            />
                            <div>
                                <h4 className="font-bold text-gray-900 leading-tight dark:text-gray-100">{item.studentName}</h4>
                                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1 inline-block dark:bg-amber-900/30 dark:text-amber-400">
                                    {item.title}
                                </span>
                            </div>
                        </div>

                        <p className="text-gray-600 text-sm italic leading-relaxed relative z-10 dark:text-gray-400">
                            "{item.message}"
                        </p>
                        
                        <div className="mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400 dark:border-slate-700 dark:text-gray-500">
                             {new Date(item.date).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewsFeed;