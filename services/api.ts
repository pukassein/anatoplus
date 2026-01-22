import { createClient } from '@supabase/supabase-js';
import { MOCK_MODULES, MOCK_TOPICS, MOCK_QUESTIONS } from '../constants';
import { Module, Topic, Question, Plan, UserStats } from '../types';

// ==========================================
// CONFIGURATION
// ==========================================

// ⚠️ IMPORTANTE: PEGA AQUÍ TUS CREDENCIALES DE SUPABASE
const SUPABASE_URL = 'https://opszqrjbygrdmiwgbdyj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wc3pxcmpieWdyZG1pd2diZHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NDIyOTksImV4cCI6MjA4NDQxODI5OX0.dlhojQcpVToi9ajqCRm3t9ztddH6cFN3gnSOTHWM1MU';

// Set to TRUE to use the real database
const USE_DATABASE = true; 

// ==========================================
// CLIENT INITIALIZATION
// ==========================================

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// DATA SERVICE
// ==========================================

export const api = {
  
  // --- AUTHENTICATION ---
  
  auth: {
    signIn: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },

    signUp: async (email: string, password: string, fullName: string, birthDate: string, affiliation: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // This data is passed to the 'handle_new_user' trigger in SQL
          data: {
            full_name: fullName,
            birth_date: birthDate,
            affiliation: affiliation
          },
        },
      });
      if (error) throw error;
      return data;
    },

    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },

    getUserProfile: async (userId: string) => {
      if (!USE_DATABASE) return { role: 'student', full_name: 'Test User' };
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        // Fallback if profile doesn't exist yet (race condition)
        return null;
      }
      return data;
    }
  },

  // --- ADMIN: USERS ---
  
  getAllUsers: async () => {
    if (!USE_DATABASE) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
    return data;
  },

  // --- ADMIN: PLANS ---

  getPlans: async (): Promise<Plan[]> => {
    if (!USE_DATABASE) return [];

    const { data, error } = await supabase
      .from('Plans')
      .select('*')
      .order('id_Plan', { ascending: true }); // Ordered by id_Plan

    if (error) {
        console.error("Error fetching plans:", error);
        throw error;
    }

    // Map DB columns to Frontend interface
    return data.map((p: any) => ({
        id: p.id_Plan.toString(),
        name: p.nombre,
        price: p.precio,
        description: p.descripcion,
        type: p.tipo_plan,
        createdAt: p.createdAt
    }));
  },

  createPlan: async (plan: Partial<Plan>) => {
    // We map frontend keys to DB columns
    // Note: id_Plan is usually SERIAL/AUTO_INCREMENT, so we don't send it.
    const { error } = await supabase.from('Plans').insert([{
        nombre: plan.name,
        precio: plan.price,
        descripcion: plan.description,
        tipo_plan: plan.type,
        createdAt: new Date()
    }]);

    if (error) {
        console.error("Error creating plan:", error);
        throw error;
    }
  },

  updatePlan: async (id: string, updates: Partial<Plan>) => {
    // Map updates to DB columns
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.nombre = updates.name;
    if (updates.price) dbUpdates.precio = updates.price;
    if (updates.description) dbUpdates.descripcion = updates.description;
    if (updates.type) dbUpdates.tipo_plan = updates.type;
    dbUpdates.updatedAt = new Date();

    const { error } = await supabase
        .from('Plans')
        .update(dbUpdates)
        .eq('id_Plan', parseInt(id)); // DB expects integer

    if (error) {
        console.error("Error updating plan:", error);
        throw error;
    }
  },

  deletePlan: async (id: string) => {
    const { error } = await supabase
        .from('Plans')
        .delete()
        .eq('id_Plan', parseInt(id)); // DB expects integer

    if (error) {
        console.error("Error deleting plan:", error);
        throw error;
    }
  },

  // --- MODULES ---

  getModules: async (userId?: string): Promise<Module[]> => {
    if (!USE_DATABASE) return MOCK_MODULES;

    const { data: modulesData, error: moduleError } = await supabase
      .from('Modulos')
      .select('*')
      .order('id_modulo');

    if (moduleError) {
      console.error('Error fetching modules:', moduleError);
      return [];
    }

    let userProgress: any[] = [];
    if (userId) {
        const { data: progressData } = await supabase
            .from('Progreso')
            .select('id_modulo, porcentaje')
            .eq('user_id', userId);
        if (progressData) userProgress = progressData;
    }

    return modulesData.map((row: any) => {
      const p = userProgress.find((up: any) => up.id_modulo === row.id_modulo);
      return {
          id: row.id_modulo.toString(),
          title: row.nombre_modulo,
          description: row.descripcion || 'Módulo de estudio', 
          imageUrl: row.imagen || 'https://picsum.photos/400/300',
          progress: p ? p.porcentaje : 0, 
          topicCount: 0 
      };
    });
  },

  createModule: async (module: Partial<Module>) => {
    const { data, error } = await supabase.from('Modulos').insert([{
        nombre_modulo: module.title,
        descripcion: module.description,
        imagen: module.imageUrl
    }]).select();
    if (error) throw error;
    return data;
  },

  updateModule: async (id: string, updates: Partial<Module>) => {
    const { error } = await supabase.from('Modulos').update({
        nombre_modulo: updates.title,
        descripcion: updates.description,
        imagen: updates.imageUrl
    }).eq('id_modulo', id);
    if (error) throw error;
  },

  deleteModule: async (id: string) => {
    const { error } = await supabase.from('Modulos').delete().eq('id_modulo', id);
    if (error) throw error;
  },

  // --- TOPICS (TEMAS) ---

  getAllTopics: async (): Promise<Topic[]> => {
     if (!USE_DATABASE) return MOCK_TOPICS;
     const { data, error } = await supabase.from('Temas').select('*, Modulos(nombre_modulo)').order('id_tema');
     if (error) return [];
     return data.map((row: any) => ({
        id: row.id_tema.toString(),
        moduleId: row.id_modulo.toString(),
        code: `T${row.id_tema}`,
        name: row.nombre_tema,
        isLocked: false,
        moduleName: row.Modulos?.nombre_modulo
     }));
  },

  getTopicsByModule: async (moduleId: string): Promise<Topic[]> => {
    if (!USE_DATABASE) return MOCK_TOPICS.filter(t => t.moduleId === moduleId);

    const { data, error } = await supabase
      .from('Temas')
      .select('*')
      .eq('id_modulo', moduleId)
      .order('nombre_tema');

    if (error) return [];

    return data.map((row: any) => ({
      id: row.id_tema.toString(),
      moduleId: row.id_modulo.toString(),
      code: `T${row.id_tema}`, 
      name: row.nombre_tema,
      isLocked: false
    }));
  },

  createTopic: async (topic: Partial<Topic>) => {
      const { error } = await supabase.from('Temas').insert([{
          id_modulo: topic.moduleId,
          nombre_tema: topic.name
      }]);
      if (error) throw error;
  },

  updateTopic: async (id: string, updates: Partial<Topic>) => {
      const { error } = await supabase.from('Temas').update({
          nombre_tema: updates.name,
          id_modulo: updates.moduleId
      }).eq('id_tema', id);
      if (error) throw error;
  },

  deleteTopic: async (id: string) => {
      const { error } = await supabase.from('Temas').delete().eq('id_tema', id);
      if (error) throw error;
  },

  // --- SUBTOPICS (SUBTEMAS) ---

  getAllSubtopics: async () => {
      if (!USE_DATABASE) return [];
      const { data, error } = await supabase.from('Subtemas').select('*, Temas(nombre_tema)').order('id_subtema');
      if (error) return [];
      return data.map((row: any) => ({
          id: row.id_subtema,
          topicId: row.id_tema,
          name: row.nombre_subtema,
          topicName: row.Temas?.nombre_tema
      }));
  },

  createSubtopic: async (subtopic: { topicId: string, name: string }) => {
      const { error } = await supabase.from('Subtemas').insert([{
          id_tema: subtopic.topicId,
          nombre_subtema: subtopic.name
      }]);
      if (error) throw error;
  },

  updateSubtopic: async (id: string, updates: { topicId: string, name: string }) => {
    const { error } = await supabase.from('Subtemas').update({
        id_tema: updates.topicId,
        nombre_subtema: updates.name
    }).eq('id_subtema', id);
    if (error) throw error;
  },

  deleteSubtopic: async (id: string) => {
      const { error } = await supabase.from('Subtemas').delete().eq('id_subtema', id);
      if (error) throw error;
  },

  // --- QUESTIONS ---

  getAllQuestionsAdmin: async (subtopicId?: string) => {
    if (!USE_DATABASE) return [];
    
    let query = supabase
        .from('Pregunta')
        .select(`
            id_pregunta,
            texto_pregunta,
            explicacion_correcta,
            id_subtema,
            Subtemas ( nombre_subtema, Temas ( nombre_tema ) )
        `)
        .order('id_pregunta', { ascending: false });

    // If filtering by subtopic, we want ALL matching questions, not just the last 100
    if (subtopicId) {
        query = query.eq('id_subtema', subtopicId);
    } else {
        // If no filter, limit to 100 to prevent overloading
        query = query.limit(100);
    }

    const { data, error } = await query;

    if (error) {
        console.error(error);
        return [];
    }

    return data.map((q: any) => ({
        id: q.id_pregunta.toString(),
        text: q.texto_pregunta,
        explanation: q.explicacion_correcta,
        subtopicId: q.id_subtema,
        subtopicName: q.Subtemas?.nombre_subtema,
        topicName: q.Subtemas?.Temas?.nombre_tema
    }));
  },

  getQuestionDetails: async (id: string) => {
      const { data: q, error } = await supabase
        .from('Pregunta')
        .select(`*, Opcions (*)`)
        .eq('id_pregunta', id)
        .single();
      
      if (error) return null;

      const options = (q.Opcions || []).sort((a: any, b: any) => a.id_opcion - b.id_opcion);
      
      return {
          id: q.id_pregunta.toString(),
          text: q.texto_pregunta,
          explanation: q.explicacion_correcta,
          subtopicId: q.id_subtema,
          options: options.map((o: any) => ({
              id: o.id_opcion,
              text: o.texto_opcion,
              isCorrect: o.es_correcta
          }))
      };
  },

  createQuestion: async (payload: { subtopicId: string, text: string, explanation: string, options: {text: string, isCorrect: boolean}[] }) => {
      const { data: qData, error: qError } = await supabase
        .from('Pregunta')
        .insert([{
            id_subtema: payload.subtopicId,
            texto_pregunta: payload.text,
            explicacion_correcta: payload.explanation
        }])
        .select()
        .single();

      if (qError) throw qError;
      const questionId = qData.id_pregunta;

      const optionsPayload = payload.options.map(o => ({
          id_pregunta: questionId,
          texto_opcion: o.text,
          es_correcta: o.isCorrect
      }));

      const { error: oError } = await supabase.from('Opcions').insert(optionsPayload);
      if (oError) throw oError;
  },

  deleteQuestion: async (id: string) => {
      const { error } = await supabase.from('Pregunta').delete().eq('id_pregunta', id);
      if (error) throw error;
  },

  // --- PROGRESS & HISTORY ---

  updateProgress: async (userId: string, moduleId: string, percentage: number): Promise<void> => {
      if (!USE_DATABASE) return;

      const id_modulo = parseInt(moduleId);
      
      const { data: existing, error: fetchError } = await supabase
        .from('Progreso')
        .select('*')
        .eq('user_id', userId)
        .eq('id_modulo', id_modulo)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
          console.error("Error fetching progress:", fetchError);
      }

      if (existing) {
          if (percentage > existing.porcentaje) {
              await supabase
                .from('Progreso')
                .update({ porcentaje: percentage, updated_at: new Date() })
                .eq('id', existing.id);
          }
      } else {
          await supabase
            .from('Progreso')
            .insert([
                { user_id: userId, id_modulo: id_modulo, porcentaje: percentage }
            ]);
      }
  },

  saveUserAnswers: async (
      userId: string, 
      answers: { questionId: string; selectedIndex: number; isCorrect: boolean }[]
  ) => {
      if (!USE_DATABASE) return;
      if (answers.length === 0) return;

      const payload = answers.map(a => ({
          user_id: userId,
          question_id: parseInt(a.questionId),
          selected_option_index: a.selectedIndex,
          is_correct: a.isCorrect,
          created_at: new Date()
      }));

      const { error } = await supabase.from('user_answers').insert(payload);
      
      if (error) {
          console.warn("Could not save detailed question history.", error);
      }
  },

  // --- PERFORMANCE STATS ---

  getUserStats: async (userId: string): Promise<UserStats> => {
      if (!USE_DATABASE) return { totalQuestions: 0, correctQuestions: 0, accuracy: 0, streakDays: 0 };
      
      // 1. Get total questions answered
      const { count: total, error: tError } = await supabase
          .from('user_answers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

      if (tError) {
          console.error("Error fetching total stats", tError);
          return { totalQuestions: 0, correctQuestions: 0, accuracy: 0, streakDays: 0 };
      }

      // 2. Get total correct answers
      const { count: correct, error: cError } = await supabase
        .from('user_answers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_correct', true);

      // 3. Simple Streak calc (distinct days in created_at)
      // Note: This is an approximation as Supabase JS doesn't do "select distinct date(created_at)" easily without RPC
      // For now, we return a mock streak or 1 if they have answers today.
      
      const totalCount = total || 0;
      const correctCount = correct || 0;
      const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

      return {
          totalQuestions: totalCount,
          correctQuestions: correctCount,
          accuracy,
          streakDays: totalCount > 0 ? 1 : 0 // Simplified for now
      };
  },

  getQuestionsByTopic: async (topicId: string): Promise<Question[]> => {
    if (!USE_DATABASE) {
      return new Promise(resolve => {
        const questions = MOCK_QUESTIONS[topicId] || [];
        setTimeout(() => resolve(questions), 400);
      });
    }

    const { data: subtemas, error: subError } = await supabase
        .from('Subtemas')
        .select('id_subtema')
        .eq('id_tema', topicId);

    if (subError || !subtemas || subtemas.length === 0) {
        return [];
    }

    const subtemaIds = subtemas.map(s => s.id_subtema);

    const { data: questionsData, error: qError } = await supabase
      .from('Pregunta')
      .select(`
        id_pregunta,
        texto_pregunta,
        explicacion_correcta,
        id_subtema,
        Opcions (
            id_opcion,
            texto_opcion,
            es_correcta
        )
      `)
      .in('id_subtema', subtemaIds);

    if (qError) {
      return [];
    }

    return questionsData.map((q: any) => {
        const rawOptions = q.Opcions || [];
        const sortedOptions = rawOptions.sort((a: any, b: any) => a.id_opcion - b.id_opcion);
        const correctIndex = sortedOptions.findIndex((o: any) => o.es_correcta);
        const optionsText = sortedOptions.map((o: any) => o.texto_opcion);

        return {
            id: q.id_pregunta.toString(),
            topicId: topicId, 
            text: q.texto_pregunta,
            options: optionsText,
            correctAnswerIndex: correctIndex === -1 ? 0 : correctIndex, 
            explanation: q.explicacion_correcta || 'Sin explicación disponible.'
        };
    });
  },

  getQuestionsFromModules: async (moduleIds: string[], limit = 20): Promise<Question[]> => {
    if (!USE_DATABASE) {
        const targetTopics = MOCK_TOPICS.filter(t => moduleIds.includes(t.moduleId));
        let gatheredQuestions: Question[] = [];
        targetTopics.forEach(topic => {
            const qs = MOCK_QUESTIONS[topic.id] || [];
            gatheredQuestions = [...gatheredQuestions, ...qs];
        });
        return new Promise(resolve => setTimeout(() => resolve(gatheredQuestions), 600));
    }

    const { data: temas } = await supabase
        .from('Temas')
        .select('id_tema')
        .in('id_modulo', moduleIds);
        
    if (!temas) return [];
    const temaIds = temas.map(t => t.id_tema);

    const { data: subtemas } = await supabase
        .from('Subtemas')
        .select('id_subtema')
        .in('id_tema', temaIds);

    if (!subtemas) return [];
    const subtemaIds = subtemas.map(s => s.id_subtema);

    const { data: questionsData } = await supabase
      .from('Pregunta')
      .select(`
        id_pregunta,
        texto_pregunta,
        explicacion_correcta,
        Opcions (
            id_opcion,
            texto_opcion,
            es_correcta
        )
      `)
      .in('id_subtema', subtemaIds)
      .limit(50); 

    if (!questionsData) return [];

    const mapped = questionsData.map((q: any) => {
        const rawOptions = q.Opcions || [];
        const sortedOptions = rawOptions.sort((a: any, b: any) => a.id_opcion - b.id_opcion);
        const correctIndex = sortedOptions.findIndex((o: any) => o.es_correcta);
        
        return {
            id: q.id_pregunta.toString(),
            topicId: 'mixed',
            text: q.texto_pregunta,
            options: sortedOptions.map((o: any) => o.texto_opcion),
            correctAnswerIndex: correctIndex === -1 ? 0 : correctIndex,
            explanation: q.explicacion_correcta || ''
        };
    });

    return mapped;
  }
};