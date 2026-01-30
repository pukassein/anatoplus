import { createClient } from '@supabase/supabase-js';
import { MOCK_MODULES, MOCK_TOPICS, MOCK_QUESTIONS } from '../constants';
import { Module, Topic, Subtopic, Question, Plan, UserStats, PaymentRequest, BankDetails } from '../types';

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
      // Get the current URL (e.g., https://anatoplus.com or http://localhost:3000)
      const redirectUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl, // Dynamic redirect based on where the user is
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
      if (!USE_DATABASE) return { role: 'student', full_name: 'Test User', isActive: true };
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        // Fallback if profile doesn't exist yet (race condition)
        return null;
      }
      return {
          ...data,
          isActive: data.is_active, // Map from DB column
          planId: data.plan_id
      };
    },
    
    // Updates the session ID in the DB to match the current device
    updateUserSessionId: async (userId: string, sessionId: string) => {
        if (!USE_DATABASE) return;
        const { error } = await supabase
            .from('profiles')
            .update({ last_session_id: sessionId })
            .eq('id', userId);
            
        if (error) console.error("Error updating session ID", error);
    }
  },

  // --- ADMIN: USERS ---
  
  getAllUsers: async () => {
    if (!USE_DATABASE) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('*, Plans(nombre)') // Join with plans to get name if needed
      .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
    
    return data.map((u: any) => ({
        ...u,
        isActive: u.is_active,
        planId: u.plan_id,
        planName: u.Plans?.nombre
    }));
  },

  updateUserStatus: async (userId: string, isActive: boolean) => {
      if (!USE_DATABASE) return;
      
      // Perform update and return the modified row to confirm success
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId)
        .select();
      
      if (error) throw error;

      // If no rows were returned, the update failed (likely due to RLS policies)
      if (!data || data.length === 0) {
          throw new Error("No se pudo actualizar. Verifique que sus políticas RLS permitan al administrador editar usuarios.");
      }
  },

  // --- PAYMENTS & PLANS ---

  getBankDetails: async (): Promise<BankDetails> => {
      if (!USE_DATABASE) return { bankName: 'Itaú Mock', accountName: 'Anato Mock', ruc: '000', accountNumber: '0000' };

      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'bank_details')
        .single();
      
      if (error || !data) {
          // Return defaults if not found
          return { bankName: 'Itaú Paraguay', accountName: 'AnatoPlus S.A.', ruc: '80012345-6', accountNumber: '7200123456' };
      }

      return data.value as BankDetails;
  },

  updateBankDetails: async (details: BankDetails) => {
      if (!USE_DATABASE) return;

      const { error } = await supabase
        .from('app_settings')
        .upsert({ 
            key: 'bank_details', 
            value: details, 
            updated_at: new Date() 
        });
      
      if (error) throw error;
  },

  uploadPaymentProof: async (file: File, userId: string): Promise<string> => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, file);

      if (uploadError) {
          throw uploadError;
      }

      const { data } = supabase.storage.from('payment-proofs').getPublicUrl(filePath);
      return data.publicUrl;
  },

  submitPaymentRequest: async (userId: string, planId: string, proofUrl: string) => {
      const { error } = await supabase.from('payment_requests').insert([{
          user_id: userId,
          plan_id: parseInt(planId),
          proof_url: proofUrl,
          status: 'pending'
      }]);

      if (error) throw error;
  },

  getPaymentRequests: async (): Promise<PaymentRequest[]> => {
      if (!USE_DATABASE) return [];

      const { data, error } = await supabase
        .from('payment_requests')
        .select(`
            *,
            profiles (full_name, email),
            Plans (nombre)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((req: any) => ({
          id: req.id.toString(),
          userId: req.user_id,
          userName: req.profiles?.full_name,
          userEmail: req.profiles?.email,
          planId: req.plan_id.toString(),
          planName: req.Plans?.nombre,
          proofUrl: req.proof_url,
          status: req.status,
          createdAt: req.created_at
      }));
  },

  processPayment: async (requestId: string, userId: string, planId: string, status: 'approved' | 'rejected') => {
      // 1. Update Request Status
      const { error } = await supabase
        .from('payment_requests')
        .update({ status: status, updated_at: new Date() })
        .eq('id', parseInt(requestId));

      if (error) throw error;

      // 2. If approved, activate user and set plan
      if (status === 'approved') {
          await api.updateUserPlan(userId, planId);
      }
  },

  updateUserPlan: async (userId: string, planId: string) => {
      if (!USE_DATABASE) return;

      const { error } = await supabase
        .from('profiles')
        .update({ plan_id: parseInt(planId), is_active: true }) // Auto activate on purchase
        .eq('id', userId);

      if (error) throw error;
  },

  getPlans: async (): Promise<Plan[]> => {
    if (!USE_DATABASE) return [];

    const { data, error } = await supabase
      .from('Plans')
      .select('*')
      .order('precio', { ascending: true }); 

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
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.nombre = updates.name;
    if (updates.price) dbUpdates.precio = updates.price;
    if (updates.description) dbUpdates.descripcion = updates.description;
    if (updates.type) dbUpdates.tipo_plan = updates.type;
    dbUpdates.updatedAt = new Date();

    const { error } = await supabase
        .from('Plans')
        .update(dbUpdates)
        .eq('id_Plan', parseInt(id)); 

    if (error) {
        console.error("Error updating plan:", error);
        throw error;
    }
  },

  deletePlan: async (id: string) => {
    const { error } = await supabase
        .from('Plans')
        .delete()
        .eq('id_Plan', parseInt(id));

    if (error) {
        // Handle Foreign Key constraint gracefully
        if (error.code === '23503') {
            throw new Error("No se puede eliminar este plan porque hay usuarios o pagos asociados a él. Intenta editarlo o eliminar primero las referencias.");
        }
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
            .from('progreso')
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

  // --- TOPICS & SUBTOPICS ---

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

  getSubtopicsByTopic: async (topicId: string): Promise<Subtopic[]> => {
    if (!USE_DATABASE) return [];

    const { data, error } = await supabase
      .from('Subtemas')
      .select('*')
      .eq('id_tema', topicId)
      .order('nombre_subtema');

    if (error) {
      console.error("Error fetching subtopics", error);
      return [];
    }

    return data.map((row: any) => ({
      id: row.id_subtema.toString(),
      topicId: row.id_tema.toString(),
      name: row.nombre_subtema
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
            explicacion_incorrecta,
            imagen_video,
            id_subtema,
            Subtemas ( nombre_subtema, Temas ( nombre_tema ) )
        `)
        .order('id_pregunta', { ascending: false });

    if (subtopicId) {
        query = query.eq('id_subtema', subtopicId);
    } else {
        query = query.limit(200); // Increased limit slightly to help search find things
    }

    const { data, error } = await query;

    if (error) {
        console.error(error);
        return [];
    }

    return data.map((q: any) => ({
        id: q.id_pregunta.toString(),
        text: q.texto_pregunta,
        explanationCorrect: q.explicacion_correcta,
        explanationIncorrect: q.explicacion_incorrecta,
        imageUrl: q.imagen_video,
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
          explanationCorrect: q.explicacion_correcta,
          explanationIncorrect: q.explicacion_incorrecta,
          imageUrl: q.imagen_video,
          subtopicId: q.id_subtema,
          options: options.map((o: any) => ({
              id: o.id_opcion, // Include ID for updates
              text: o.texto_opcion,
              isCorrect: o.es_correcta
          }))
      };
  },

  createQuestion: async (payload: { subtopicId: string, text: string, explanationCorrect: string, explanationIncorrect: string, imageUrl?: string, options: {text: string, isCorrect: boolean}[] }) => {
      const { data: qData, error: qError } = await supabase
        .from('Pregunta')
        .insert([{
            id_subtema: payload.subtopicId,
            texto_pregunta: payload.text,
            explicacion_correcta: payload.explanationCorrect,
            explicacion_incorrecta: payload.explanationIncorrect,
            imagen_video: payload.imageUrl || null,
            createdAt: new Date(),
            updatedAt: new Date()
        }])
        .select()
        .single();

      if (qError) throw qError;
      const questionId = qData.id_pregunta;

      const optionsPayload = payload.options.map(o => ({
          id_pregunta: questionId,
          texto_opcion: o.text,
          es_correcta: o.isCorrect,
          createdAt: new Date(),
          updatedAt: new Date()
      }));

      const { error: oError } = await supabase.from('Opcions').insert(optionsPayload);
      if (oError) throw oError;
  },

  updateQuestion: async (id: string, payload: { subtopicId: string, text: string, explanationCorrect: string, explanationIncorrect: string, imageUrl?: string, options: {id?: number, text: string, isCorrect: boolean}[] }) => {
      // 1. Update Question Text
      const { error } = await supabase.from('Pregunta').update({
          id_subtema: payload.subtopicId,
          texto_pregunta: payload.text,
          explicacion_correcta: payload.explanationCorrect,
          explicacion_incorrecta: payload.explanationIncorrect,
          imagen_video: payload.imageUrl,
          updatedAt: new Date()
      }).eq('id_pregunta', id);
      
      if (error) throw error;

      // 2. Update Options (Iterate through list)
      for (const opt of payload.options) {
          if (opt.id) {
              // Update existing option
               await supabase.from('Opcions').update({
                  texto_opcion: opt.text,
                  es_correcta: opt.isCorrect,
                  updatedAt: new Date()
              }).eq('id_opcion', opt.id);
          } else if (opt.text.trim() !== '') {
              // Insert new option if user added one during edit
              await supabase.from('Opcions').insert({
                  id_pregunta: parseInt(id),
                  texto_opcion: opt.text,
                  es_correcta: opt.isCorrect,
                  createdAt: new Date(),
                  updatedAt: new Date()
              });
          }
      }
  },

  deleteQuestion: async (id: string) => {
      const { error } = await supabase.from('Pregunta').delete().eq('id_pregunta', id);
      if (error) throw error;
  },

  // --- PROGRESS & HISTORY ---

  recalculateModuleProgress: async (userId: string, moduleId: string): Promise<number> => {
      if (!USE_DATABASE) return 0;
      
      try {
        const { data: topics } = await supabase.from('Temas').select('id_tema').eq('id_modulo', moduleId);
        if(!topics?.length) return 0;
        const topicIds = topics.map(t => t.id_tema);

        const { data: subtopics } = await supabase.from('Subtemas').select('id_subtema').in('id_tema', topicIds);
        if(!subtopics?.length) return 0;
        const subtopicIds = subtopics.map(s => s.id_subtema);

        const { count: totalQuestions, error: countError } = await supabase
            .from('Pregunta')
            .select('id_pregunta', { count: 'exact', head: true })
            .in('id_subtema', subtopicIds);
        
        if (countError || !totalQuestions || totalQuestions === 0) return 0;

        const { data: questions } = await supabase
            .from('Pregunta')
            .select('id_pregunta')
            .in('id_subtema', subtopicIds);
        
        if (!questions?.length) return 0;
        const moduleQuestionIds = questions.map(q => q.id_pregunta);

        const { data: answers } = await supabase
            .from('user_answers')
            .select('question_id')
            .eq('user_id', userId)
            .eq('is_correct', true)
            .in('question_id', moduleQuestionIds);
        
        const uniqueCorrect = new Set(answers?.map(a => a.question_id)).size;
        const percentage = Math.min(100, Math.round((uniqueCorrect / totalQuestions) * 100));

        const { data: existing } = await supabase
            .from('progreso')
            .select('id')
            .eq('user_id', userId)
            .eq('id_modulo', moduleId)
            .single();

        if (existing) {
            await supabase.from('progreso').update({
                porcentaje: percentage,
                updated_at: new Date()
            }).eq('id', existing.id);
        } else {
            await supabase.from('progreso').insert({
                user_id: userId,
                id_modulo: parseInt(moduleId),
                porcentaje: percentage,
                updated_at: new Date()
            });
        }

        return percentage;
      } catch (error) {
          console.error("Error recalculating progress:", error);
          return 0;
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

  getUserStats: async (userId: string): Promise<UserStats> => {
      if (!USE_DATABASE) return { totalQuestions: 0, correctQuestions: 0, accuracy: 0, streakDays: 0 };
      
      const { count: total, error: tError } = await supabase
          .from('user_answers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

      if (tError) {
          return { totalQuestions: 0, correctQuestions: 0, accuracy: 0, streakDays: 0 };
      }

      const { count: correct } = await supabase
        .from('user_answers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_correct', true);
      
      const totalCount = total || 0;
      const correctCount = correct || 0;
      const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

      return {
          totalQuestions: totalCount,
          correctQuestions: correctCount,
          accuracy,
          streakDays: totalCount > 0 ? 1 : 0 
      };
  },

  getQuestionsBySubtopics: async (subtopicIds: string[]): Promise<Question[]> => {
    if (!USE_DATABASE || subtopicIds.length === 0) return [];

    const { data: questionsData, error: qError } = await supabase
      .from('Pregunta')
      .select(`
        id_pregunta,
        texto_pregunta,
        explicacion_correcta,
        explicacion_incorrecta,
        imagen_video,
        id_subtema,
        Subtemas ( id_tema ),
        Opcions (
            id_opcion,
            texto_opcion,
            es_correcta
        )
      `)
      .in('id_subtema', subtopicIds);

    if (qError) {
      console.error(qError);
      return [];
    }

    return questionsData.map((q: any) => {
        const rawOptions = q.Opcions || [];
        const sortedOptions = rawOptions.sort((a: any, b: any) => a.id_opcion - b.id_opcion);
        const correctIndex = sortedOptions.findIndex((o: any) => o.es_correcta);
        const optionsText = sortedOptions.map((o: any) => o.texto_opcion);

        return {
            id: q.id_pregunta.toString(),
            topicId: q.Subtemas?.id_tema?.toString() || 'unknown', 
            text: q.texto_pregunta,
            options: optionsText,
            correctAnswerIndex: correctIndex === -1 ? 0 : correctIndex, 
            explanationCorrect: q.explicacion_correcta || '<p>¡Respuesta correcta!</p>',
            explanationIncorrect: q.explicacion_incorrecta || '<p>Respuesta incorrecta.</p>',
            imageUrl: q.imagen_video
        };
    });
  },

  getQuestionsFromModules: async (moduleIds: string[], limit = 20): Promise<Question[]> => {
    if (!USE_DATABASE) return [];

    const { data: temas } = await supabase.from('Temas').select('id_tema').in('id_modulo', moduleIds);
    if (!temas) return [];
    const temaIds = temas.map(t => t.id_tema);

    const { data: subtemas } = await supabase.from('Subtemas').select('id_subtema').in('id_tema', temaIds);
    if (!subtemas) return [];
    const subtemaIds = subtemas.map(s => s.id_subtema);

    const { data: questionsData } = await supabase
      .from('Pregunta')
      .select(`
        id_pregunta,
        texto_pregunta,
        explicacion_correcta,
        explicacion_incorrecta,
        imagen_video,
        Opcions (id_opcion, texto_opcion, es_correcta)
      `)
      .in('id_subtema', subtemaIds)
      .limit(50); 

    if (!questionsData) return [];

    return questionsData.map((q: any) => {
        const rawOptions = q.Opcions || [];
        const sortedOptions = rawOptions.sort((a: any, b: any) => a.id_opcion - b.id_opcion);
        const correctIndex = sortedOptions.findIndex((o: any) => o.es_correcta);
        
        return {
            id: q.id_pregunta.toString(),
            topicId: 'mixed',
            text: q.texto_pregunta,
            options: sortedOptions.map((o: any) => o.texto_opcion),
            correctAnswerIndex: correctIndex === -1 ? 0 : correctIndex,
            explanationCorrect: q.explicacion_correcta || '',
            explanationIncorrect: q.explicacion_incorrecta || '',
            imageUrl: q.imagen_video
        };
    });
  }
};