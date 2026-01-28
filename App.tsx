import React, { useState, useEffect, useRef } from 'react';
import { ViewState, Module, Topic, Subtopic, User, Question } from './types';
import { api, supabase } from './services/api'; // Import supabase instance for listener
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminModules from './components/AdminModules';
import AdminUsers from './components/AdminUsers'; 
import AdminPlans from './components/AdminPlans'; 
import AdminPayments from './components/AdminPayments'; // New import
import TopicList from './components/TopicList';
import SubtopicList from './components/SubtopicList'; 
import QuizView from './components/QuizView';
import Performance from './components/Performance';
import SubscriptionPlans from './components/SubscriptionPlans'; 
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.LOGIN);
  
  // Ref to track currentView inside callbacks/listeners to avoid stale closures
  const viewRef = useRef(currentView);

  // Data State
  const [modules, setModules] = useState<Module[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]); // New State
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

       // Updated to include isActive and planId
       const userObj: User = { 
           id: userId, 
           name, 
           email, 
           role,
           isActive: profile?.isActive ?? false,
           planId: profile?.planId
       };
       
       setUser(userObj);

       if (viewRef.current === ViewState.LOGIN) {
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
    // Force reset state immediately to ensure UI updates even if network fails
    try {
      await api.auth.signOut();
    } catch (e) {
      console.error("Error signing out:", e);
    } finally {
      setUser(null);
      setCurrentView(ViewState.LOGIN);
    }
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
    // Security check logic handled in UI, but double check here
    if (user?.role !== 'admin' && !user?.isActive) {
        setCurrentView(ViewState.SUBSCRIPTION);
        return;
    }

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
    
    // Updated Flow: Go to Subtopics first, not Quiz immediately
    setIsLoading(true);
    try {
      const fetchedSubtopics = await api.getSubtopicsByTopic(topic.id);
      setSubtopics(fetchedSubtopics);
      setCurrentView(ViewState.TOPIC_SUBTOPICS);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSubtopicQuiz = async (selectedSubtopicIds: string[]) => {
      setIsLoading(true);
      try {
          const questions = await api.getQuestionsBySubtopics(selectedSubtopicIds);
          if (questions.length === 0) {
              alert("No hay preguntas en los subtemas seleccionados.");
              setIsLoading(false);
              return;
          }
          setActiveQuestions(questions);
          setCurrentView(ViewState.QUIZ);
      } catch (e) {
          console.error(e);
          alert("Error iniciando el quiz.");
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
    if (!user) return;

    try {
      // 1. Save detailed answers
      await api.saveUserAnswers(user.id, answers);

      // 2. Recalculate progress for the affected module(s)
      if (selectedModule) {
          const newPercentage = await api.recalculateModuleProgress(user.id, selectedModule.id);
          
          // Update local state immediately for UI feedback
          setModules(prev => prev.map(m => 
              m.id === selectedModule.id 
              ? { ...m, progress: newPercentage } 
              : m
          ));
      } 
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
        {currentView === ViewState.ADMIN_USERS && <AdminUsers />}
        {currentView === ViewState.ADMIN_PLANS && <AdminPlans />}
        {currentView === ViewState.ADMIN_PAYMENTS && <AdminPayments />}
        {(currentView === ViewState.ADMIN_COMMENTS) && (
           <div className="p-10 text-center text-gray-500 bg-white rounded-lg border border-dashed">
              Sección en desarrollo
           </div>
        )}
      </AdminLayout>
    );
  }

  // Student View (Standard Layout)
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
          onOpenSubscription={() => setCurrentView(ViewState.SUBSCRIPTION)}
        />
      )}

      {currentView === ViewState.SUBSCRIPTION && (
          <SubscriptionPlans 
             user={user} 
             onBack={() => setCurrentView(ViewState.DASHBOARD)} 
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

      {currentView === ViewState.TOPIC_SUBTOPICS && selectedTopic && (
          <SubtopicList 
            topic={selectedTopic}
            subtopics={subtopics}
            onBack={() => setCurrentView(ViewState.MODULE_TOPICS)}
            onStart={handleStartSubtopicQuiz}
          />
      )}

      {currentView === ViewState.QUIZ && selectedTopic && (
        <QuizView 
          topic={selectedTopic}
          questions={activeQuestions}
          onBack={() => {
             // If coming back from a quiz, we reload modules to reflect new progress
             if (user) loadModules(user.id);

             if (selectedTopic.id === 'custom_session') {
                handleNavigate(ViewState.DASHBOARD);
             } else {
                setCurrentView(ViewState.TOPIC_SUBTOPICS);
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