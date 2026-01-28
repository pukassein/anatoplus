import React, { useState, useEffect, useRef } from 'react';
import { ViewState, Module, Topic, User, Question } from './types';
import { api, supabase } from './services/api'; // Import supabase instance for listener
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminModules from './components/AdminModules';
import AdminUsers from './components/AdminUsers'; // Imported
import AdminPlans from './components/AdminPlans'; // Imported
import TopicList from './components/TopicList';
import QuizView from './components/QuizView';
import Performance from './components/Performance';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.LOGIN);
  
  // Ref to track currentView inside callbacks/listeners to avoid stale closures
  const viewRef = useRef(currentView);

  // Data State
  const [modules, setModules] = useState<Module[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Keep the Ref in sync with state
  useEffect(() => {
    viewRef.current = currentView;
  }, [currentView]);

  // --- AUTHENTICATION LISTENER ---

  useEffect(() => {
    // 1. Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfileAndSetUser(session.user.id, session.user.email!);
      } else {
        setIsAuthChecking(false);
      }
    });

    // 2. Listen for auth changes (SignIn, SignOut, Token Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // This runs on tab focus/token refresh. We must use viewRef to check current state.
        fetchProfileAndSetUser(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setCurrentView(ViewState.LOGIN);
        setIsAuthChecking(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfileAndSetUser = async (userId: string, email: string) => {
     try {
       const profile = await api.auth.getUserProfile(userId);
       
       const role = profile?.role === 'admin' ? 'admin' : 'student';
       const name = profile?.full_name || email.split('@')[0];

       const userObj: User = { id: userId, name, email, role };
       
       setUser(userObj);

       // FIX: Use viewRef.current instead of currentView to avoid stale closure.
       // Only redirect if we are currently on the LOGIN screen (initial load).
       // If we are already in DASHBOARD (even as Admin viewing student mode), do NOT redirect.
       if (viewRef.current === ViewState.LOGIN) {
         // Admins go to Admin Dashboard, Students go to standard Dashboard
         setCurrentView(role === 'admin' ? ViewState.ADMIN_DASHBOARD : ViewState.DASHBOARD);
       }
     } catch (err) {
       console.error("Profile fetch error", err);
     } finally {
       setIsAuthChecking(false);
     }
  };

  // --- DATA LOADING ---

  useEffect(() => {
    // Only load modules if user is set and we are in the Dashboard view
    if (user && currentView === ViewState.DASHBOARD) {
      loadModules(user.id);
    }
  }, [user, currentView]);

  const loadModules = async (userId: string) => {
    setIsLoading(true);
    try {
      const data = await api.getModules(userId);
      setModules(data);
    } catch (error) {
      console.error("Failed to load modules", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.auth.signOut();
    // Auth listener will handle state cleanup
  };

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    if (view === ViewState.DASHBOARD) {
      setSelectedModule(null);
      setSelectedTopic(null);
      if (user) loadModules(user.id);
    }
  };

  // --- STUDENT ACTIONS ---

  const handleSelectModule = async (module: Module) => {
    setSelectedModule(module);
    setCurrentView(ViewState.MODULE_TOPICS);
    
    setIsLoading(true);
    try {
      const fetchedTopics = await api.getTopicsByModule(module.id);
      setTopics(fetchedTopics);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTopic = async (topic: Topic) => {
    setSelectedTopic(topic);
    setCurrentView(ViewState.QUIZ);
    
    setIsLoading(true);
    try {
      const fetchedQuestions = await api.getQuestionsByTopic(topic.id);
      setActiveQuestions(fetchedQuestions);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartCustomSession = async (moduleIds: string[], isRandom: boolean) => {
    setIsLoading(true);
    try {
      let gatheredQuestions = await api.getQuestionsFromModules(moduleIds);
      
      if (gatheredQuestions.length === 0) {
        alert("No hay preguntas disponibles en los módulos seleccionados.");
        setIsLoading(false);
        return;
      }

      if (isRandom) {
        gatheredQuestions = gatheredQuestions.sort(() => Math.random() - 0.5);
      }

      const virtualTopic: Topic = {
        id: 'custom_session',
        moduleId: 'mixed',
        code: isRandom ? 'ALEATORIO' : 'MIXTO',
        name: `Sesión de Estudio (${moduleIds.length} módulos)`,
        isLocked: false
      };

      setActiveQuestions(gatheredQuestions);
      setSelectedTopic(virtualTopic);
      setCurrentView(ViewState.QUIZ);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizCompletion = async (
      score: number, 
      total: number, 
      answers: { questionId: string; selectedIndex: number; isCorrect: boolean }[]
  ) => {
    if (!user || !selectedModule) return;

    const percentage = Math.round((score / total) * 100);

    // 1. Optimistic UI update (update local state immediately)
    const updatedModules = modules.map(m => 
      m.id === selectedModule.id 
      ? { ...m, progress: Math.max(m.progress, percentage) } 
      : m
    );
    setModules(updatedModules);

    try {
      // 2. Save Progress to DB
      await api.updateProgress(user.id, selectedModule.id, percentage);
      
      // 3. Save Detailed Answers (New)
      await api.saveUserAnswers(user.id, answers);
      
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  // --- ADMIN ACTIONS ---

  const handleAddModule = (newModule: Module) => {
    setModules([...modules, newModule]);
  };

  const handleEditModule = (id: string, updates: Partial<Module>) => {
    setModules(modules.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleDeleteModule = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
  };

  // --- RENDERING ---

  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center">
        <Loader2 className="animate-spin text-amber-500 mb-3" size={48} />
        <p className="text-gray-600 font-medium animate-pulse">Cargando...</p>
      </div>
    </div>
  );

  if (isAuthChecking) {
    return <LoadingOverlay />;
  }

  if (!user || currentView === ViewState.LOGIN) {
    return <Login />;
  }

  // Determine if we should show Admin Layout
  // Condition: User MUST be admin AND Current View MUST be an ADMIN_* view
  const isAdminView = currentView.toString().startsWith('ADMIN_');
  const showAdminLayout = user.role === 'admin' && isAdminView;

  if (showAdminLayout) {
    return (
      <AdminLayout
        user={user}
        currentView={currentView}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        {currentView === ViewState.ADMIN_DASHBOARD && (
          <div className="space-y-6">
             <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
               <h2 className="text-2xl font-bold text-gray-800 mb-2">Bienvenido al Panel de Administración</h2>
               <p className="text-gray-500 mb-4">Gestiona el contenido de la plataforma, usuarios y reportes desde aquí.</p>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                     <h3 className="font-bold text-blue-900">Preguntas Totales</h3>
                     <p className="text-3xl font-bold text-blue-600 mt-2">1,240</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                     <h3 className="font-bold text-green-900">Usuarios Activos</h3>
                     <p className="text-3xl font-bold text-green-600 mt-2">58</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                     <h3 className="font-bold text-purple-900">Módulos</h3>
                     <p className="text-3xl font-bold text-purple-600 mt-2">{modules.length}</p>
                  </div>
               </div>
             </div>
          </div>
        )}

        {currentView === ViewState.ADMIN_QUESTIONS && (
          <AdminModules 
            modules={modules} 
            onAddModule={handleAddModule}
            onEditModule={handleEditModule}
            onDeleteModule={handleDeleteModule}
          />
        )}

        {/* New Components */}
        {currentView === ViewState.ADMIN_USERS && <AdminUsers />}
        {currentView === ViewState.ADMIN_PLANS && <AdminPlans />}
        
        {(currentView === ViewState.ADMIN_COMMENTS) && (
           <div className="p-10 text-center text-gray-500 bg-white rounded-lg border border-dashed">
              Sección en desarrollo
           </div>
        )}
      </AdminLayout>
    );
  }

  // Student View (Standard Layout)
  // This is rendered for:
  // 1. Regular students
  // 2. Admins who have navigated to the Dashboard (Student View)
  return (
    <Layout 
      user={user} 
      currentView={currentView} 
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {isLoading && <LoadingOverlay />}

      {currentView === ViewState.DASHBOARD && (
        <Dashboard 
          user={user} 
          modules={modules} 
          onSelectModule={handleSelectModule} 
          onViewReports={() => handleNavigate(ViewState.PERFORMANCE)}
          onStartCustomSession={handleStartCustomSession}
        />
      )}

      {currentView === ViewState.MODULE_TOPICS && selectedModule && (
        <TopicList 
          module={selectedModule} 
          topics={topics}
          onBack={() => handleNavigate(ViewState.DASHBOARD)}
          onSelectTopic={handleSelectTopic}
        />
      )}

      {currentView === ViewState.QUIZ && selectedTopic && (
        <QuizView 
          topic={selectedTopic}
          questions={activeQuestions}
          onBack={() => {
             // Reload modules when exiting quiz to ensure dashboard is fresh
             if (user) loadModules(user.id);

             if (selectedTopic.id === 'custom_session') {
                handleNavigate(ViewState.DASHBOARD);
             } else {
                setCurrentView(ViewState.MODULE_TOPICS);
             }
          }}
          onComplete={handleQuizCompletion}
        />
      )}

      {currentView === ViewState.PERFORMANCE && (
        <Performance modules={modules} user={user} />
      )}
    </Layout>
  );
};

export default App;