import { Module, Topic, Question } from './types';

export const MOCK_MODULES: Module[] = [
  {
    id: 'mod_gen',
    title: 'Generalidades',
    description: 'Conceptos básicos, terminología anatómica y planos corporales.',
    imageUrl: 'https://picsum.photos/id/1062/400/300',
    progress: 100,
    topicCount: 12
  },
  {
    id: 'mod_torax',
    title: 'Tórax',
    description: 'Caja torácica, sistema respiratorio y cardiovascular.',
    imageUrl: 'https://picsum.photos/id/433/400/300',
    progress: 45,
    topicCount: 9
  },
  {
    id: 'mod_sup',
    title: 'Miembro Superior',
    description: 'Osteología, miología y vascularización del brazo.',
    imageUrl: 'https://picsum.photos/id/237/400/300',
    progress: 10,
    topicCount: 15
  },
  {
    id: 'mod_abd',
    title: 'Abdomen y Pelvis',
    description: 'Vísceras abdominales, sistema digestivo y renal.',
    imageUrl: 'https://picsum.photos/id/1025/400/300',
    progress: 0,
    topicCount: 20
  },
  {
    id: 'mod_inf',
    title: 'Miembro Inferior',
    description: 'Estructuras de soporte, locomoción y pie.',
    imageUrl: 'https://picsum.photos/id/1074/400/300',
    progress: 0,
    topicCount: 14
  },
  {
    id: 'mod_cab',
    title: 'Cabeza y Cuello',
    description: 'Cráneo, músculos faciales y estructuras del cuello.',
    imageUrl: 'https://picsum.photos/id/1003/400/300',
    progress: 0,
    topicCount: 18
  },
  {
    id: 'mod_neuro',
    title: 'Neuroanatomía',
    description: 'Sistema nervioso central y periférico.',
    imageUrl: 'https://picsum.photos/id/870/400/300',
    progress: 0,
    topicCount: 25
  },
  {
    id: 'mod_glob',
    title: 'Global',
    description: 'Exámenes integradores de todos los módulos.',
    imageUrl: 'https://picsum.photos/id/96/400/300',
    progress: 0,
    topicCount: 5
  }
];

export const MOCK_TOPICS: Topic[] = [
  // Topics for Tórax
  { id: 't7', moduleId: 'mod_torax', code: 'T7', name: 'Huesos del tórax', isLocked: false },
  { id: 't8', moduleId: 'mod_torax', code: 'T8', name: 'Articulaciones del tórax', isLocked: false },
  { id: 't9', moduleId: 'mod_torax', code: 'T9', name: 'Tórax en general', isLocked: false },
  { id: 't10', moduleId: 'mod_torax', code: 'T10', name: 'Músculos del tórax', isLocked: false },
  { id: 't11', moduleId: 'mod_torax', code: 'T11', name: 'Sistema cardiovascular', isLocked: false },
  { id: 't12', moduleId: 'mod_torax', code: 'T12', name: 'Vasos del tórax', isLocked: false },
  { id: 't13', moduleId: 'mod_torax', code: 'T13', name: 'Nervios del tórax', isLocked: false },
  { id: 't14', moduleId: 'mod_torax', code: 'T14', name: 'Sistema respiratorio', isLocked: false },
  
  // Topics for Generalidades
  { id: 'g1', moduleId: 'mod_gen', code: 'G1', name: 'Posición anatómica', isLocked: false },
  { id: 'g2', moduleId: 'mod_gen', code: 'G2', name: 'Planos y ejes', isLocked: false },
];

export const MOCK_QUESTIONS: Record<string, Question[]> = {
  't7': [
    {
      id: 'q1',
      topicId: 't7',
      text: '¿Cuál de las siguientes costillas se considera una costilla flotante?',
      options: ['1ª costilla', '7ª costilla', '10ª costilla', '11ª costilla'],
      correctAnswerIndex: 3,
      explanation: 'Las costillas 11ª y 12ª son flotantes porque no se unen al esternón ni directa ni indirectamente.'
    },
    {
      id: 'q2',
      topicId: 't7',
      text: '¿Qué parte del esternón se articula con la clavícula?',
      options: ['Cuerpo', 'Manubrio', 'Apófisis xifoides', 'Ángulo de Louis'],
      correctAnswerIndex: 1,
      explanation: 'El manubrio del esternón posee las escotaduras claviculares para articularse con las clavículas.'
    },
    {
      id: 'q3',
      topicId: 't7',
      text: '¿Cuántas vértebras torácicas existen típicamente en la columna vertebral humana?',
      options: ['7', '12', '5', '9'],
      correctAnswerIndex: 1,
      explanation: 'Existen 12 vértebras torácicas (T1-T12) que se articulan con las costillas.'
    },
    {
      id: 'q4',
      topicId: 't7',
      text: '¿Cuál es la característica principal de una costilla atípica como la primera costilla?',
      options: ['Es la más larga', 'Es la más curva', 'Tiene una sola carilla articular en la cabeza', 'No tiene tubérculo'],
      correctAnswerIndex: 2,
      explanation: 'La 1ª costilla es atípica; es corta, ancha, muy curva y tiene una única carilla en su cabeza para T1.'
    }
  ],
  't8': [
    {
      id: 'q_t8_1',
      topicId: 't8',
      text: '¿Qué tipo de articulación es la manubrioesternal?',
      options: ['Sinovial plana', 'Sínfisis (cartilaginosa secundaria)', 'Sincondrosis (cartilaginosa primaria)', 'Fibrosa'],
      correctAnswerIndex: 1,
      explanation: 'La articulación manubrioesternal suele ser una sínfisis, lo que permite un pequeño movimiento durante la respiración.'
    },
    {
      id: 'q_t8_2',
      topicId: 't8',
      text: 'Las articulaciones costovertebrales unen la cabeza de la costilla con:',
      options: ['Apófisis transversa', 'Cuerpo vertebral', 'Lámina vertebral', 'Pedículo'],
      correctAnswerIndex: 1,
      explanation: 'La articulación de la cabeza de la costilla se da con los cuerpos vertebrales de las vértebras torácicas.'
    }
  ],
  'g1': [
     {
      id: 'q_g1_1',
      topicId: 'g1',
      text: 'En la posición anatómica estándar, las palmas de las manos miran hacia:',
      options: ['Atrás (Posterior)', 'Adelante (Anterior)', 'Adentro (Medial)', 'Afuera (Lateral)'],
      correctAnswerIndex: 1,
      explanation: 'En la posición anatómica, el cuerpo está erguido, con la mirada al frente y las palmas de las manos vueltas hacia adelante (supinación).'
    },
    {
      id: 'q_g1_2',
      topicId: 'g1',
      text: 'El plano que divide el cuerpo en mitades derecha e izquierda iguales se llama:',
      options: ['Plano Sagital Medio', 'Plano Coronal', 'Plano Transversal', 'Plano Parasagital'],
      correctAnswerIndex: 0,
      explanation: 'El plano sagital medio es el plano vertical que pasa longitudinalmente por el cuerpo, dividiéndolo en mitades derecha e izquierda.'
    }
  ]
};