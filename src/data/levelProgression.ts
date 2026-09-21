import { LanguageOption, ProficiencyLevel, PromotionExam, PromotionQuestion } from '../types';

export const ORDERED_CEFR_LEVELS: ProficiencyLevel[] = [
  'A0 - Absolute Beginner (Zero Knowledge)',
  'A1 - Beginner',
  'A2 - Elementary',
  'B1 - Intermediate',
  'B2 - Upper Intermediate',
  'C1 - Advanced',
];

export const getLevelOrderIndex = (level: ProficiencyLevel): number => {
  const idx = ORDERED_CEFR_LEVELS.indexOf(level);
  return idx !== -1 ? idx : 0;
};

export const getNextLevel = (currentLevel: ProficiencyLevel): ProficiencyLevel | null => {
  const currentIndex = getLevelOrderIndex(currentLevel);
  if (currentIndex < ORDERED_CEFR_LEVELS.length - 1) {
    return ORDERED_CEFR_LEVELS[currentIndex + 1];
  }
  return null;
};

export const getPreviousLevel = (currentLevel: ProficiencyLevel): ProficiencyLevel | null => {
  const currentIndex = getLevelOrderIndex(currentLevel);
  if (currentIndex > 0) {
    return ORDERED_CEFR_LEVELS[currentIndex - 1];
  }
  return null;
};

export const isLevelUnlocked = (
  level: ProficiencyLevel,
  unlockedLevels: (ProficiencyLevel | string)[] = ['A0 - Absolute Beginner (Zero Knowledge)']
): boolean => {
  // A0 is always permanently unlocked
  if (level === 'A0 - Absolute Beginner (Zero Knowledge)') return true;
  return unlockedLevels.includes(level);
};

export const getRequiredPracticeCount = (level: ProficiencyLevel): number => {
  const code = level.split(' - ')[0];
  switch (code) {
    case 'A0':
      return 3; // 3 practice activities to reach 100% readiness
    case 'A1':
      return 4;
    case 'A2':
      return 5;
    case 'B1':
      return 6;
    case 'B2':
      return 7;
    default:
      return 5;
  }
};

// --- CURATED PROMOTION EXAMS BY LANGUAGE & LEVEL ---

const PROMOTION_EXAMS_DATABASE: Record<string, Record<string, PromotionQuestion[]>> = {
  spanish: {
    'A0': [
      {
        id: 'es-a0-1',
        type: 'listening',
        question: 'Listen to the audio greeting. What is the speaker saying?',
        audioPrompt: '¡Hola! Buenos días, ¿cómo te llamas?',
        options: [
          'Hello! Good morning, what is your name?',
          'Goodbye! Have a good night, see you tomorrow.',
          'Please, where is the train station?',
          'Excuse me, how much does this cost?',
        ],
        correctAnswerIndex: 0,
        explanation: '"¡Hola! Buenos días, ¿cómo te llamas?" translates directly to "Hello! Good morning, what is your name?".',
        skillTag: 'Basic Greetings & Introductions',
      },
      {
        id: 'es-a0-2',
        type: 'vocabulary',
        question: 'Which of the following phrases politely expresses "Thank you very much, you are very kind"?',
        audioPrompt: 'Muchas gracias, muy amable.',
        options: [
          'Por favor y de nada.',
          'Muchas gracias, muy amable.',
          'Lo siento mucho, perdón.',
          'Hasta luego, adiós.',
        ],
        correctAnswerIndex: 1,
        explanation: '"Muchas gracias" means "Thank you very much" and "muy amable" means "very kind".',
        skillTag: 'Courtesies & Politeness',
      },
      {
        id: 'es-a0-3',
        type: 'dialogue',
        question: 'Someone introduces themselves: "Mucho gusto, soy Carlos." What is the most natural reply?',
        options: [
          'Encantado/a, soy María.',
          'No tengo dinero.',
          'La cuenta, por favor.',
          'Son las tres de la tarde.',
        ],
        correctAnswerIndex: 0,
        explanation: '"Mucho gusto" (Nice to meet you) is conventionally answered with "Encantado/a" (Delighted / Pleased to meet you).',
        skillTag: 'Conversational Etiquette',
      },
      {
        id: 'es-a0-4',
        type: 'vocabulary',
        question: 'How do you say the numbers "1, 2, 3" in Spanish?',
        options: [
          'Uno, dos, tres',
          'Diez, veinte, treinta',
          'Primero, segundo, tercero',
          'Lunes, martes, miércoles',
        ],
        correctAnswerIndex: 0,
        explanation: '"Uno, dos, tres" are the foundational cardinal numbers 1, 2, 3 in Spanish.',
        skillTag: 'Foundational Numbers',
      },
      {
        id: 'es-a0-5',
        type: 'reading',
        question: 'You see a café sign: "Agua mineral, café con leche y pan tostado". What is being offered?',
        options: [
          'Mineral water, coffee with milk, and toasted bread',
          'Orange juice, cold tea, and sweet pastries',
          'Beer, sparkling wine, and mixed salad',
          'Hot chocolate, pancakes, and fruit salad',
        ],
        correctAnswerIndex: 0,
        explanation: '"Agua mineral" = mineral water, "café con leche" = coffee with milk, "pan tostado" = toasted bread.',
        skillTag: 'Essential Signs & Menus',
      },
    ],
    'A1': [
      {
        id: 'es-a1-1',
        type: 'listening',
        question: 'Listen to the customer ordering in a café. What does she want to drink?',
        audioPrompt: 'Buenas tardes. Quisiera un zumo de naranja natural y una botella de agua sin gas, por favor.',
        options: [
          'Fresh orange juice and a bottle of still water',
          'A glass of red wine and sparkling water',
          'Hot black coffee and iced tea',
          'Apple cider and lemon soda',
        ],
        correctAnswerIndex: 0,
        explanation: '"Zumo de naranja natural" is fresh orange juice, and "agua sin gas" is still (non-carbonated) water.',
        skillTag: 'Ordering & Food',
      },
      {
        id: 'es-a1-2',
        type: 'grammar',
        question: 'Complete the sentence: "Nosotros ________ en el centro de Madrid."',
        options: [
          'vivo',
          'vives',
          'vivimos',
          'viven',
        ],
        correctAnswerIndex: 2,
        explanation: 'The 1st person plural (nosotros) form of "vivir" in present tense is "vivimos".',
        skillTag: 'Present Tense Regular Verbs',
      },
      {
        id: 'es-a1-3',
        type: 'dialogue',
        question: 'A passerby asks: "Perdone, ¿dónde está la farmacia más cercana?" Which is a clear direction?',
        options: [
          'Siga todo recto y gire a la derecha en la esquina.',
          'Tengo veintidós años.',
          'Me gusta mucho el fútbol.',
          'Ayer compré tres libros.',
        ],
        correctAnswerIndex: 0,
        explanation: '"Siga todo recto y gire a la derecha" means "Continue straight ahead and turn right at the corner".',
        skillTag: 'Directions & Spatial Navigation',
      },
      {
        id: 'es-a1-4',
        type: 'reading',
        question: 'Read the hotel notice: "El desayuno buffet se sirve en la primera planta de 07:30 a 10:30." When is breakfast served?',
        options: [
          'On the first floor from 7:30 to 10:30 AM',
          'In the rooftop garden after 11:00 AM',
          'In your room upon request at 6:00 AM',
          'In the basement starting at 8:30 PM',
        ],
        correctAnswerIndex: 0,
        explanation: '"Primera planta" = first floor; "07:30 a 10:30" = 7:30 to 10:30 AM.',
        skillTag: 'Reading Notices',
      },
    ],
    'A2': [
      {
        id: 'es-a2-1',
        type: 'listening',
        question: 'Listen to the weekend story. What happened to Daniel on Saturday?',
        audioPrompt: 'El sábado pasado fui al parque con mi perro, pero de repente empezó a llover fuerte y tuvimos que correr hacia la cafetería.',
        options: [
          'He went to the park with his dog, but it started raining heavily so they ran to a café.',
          'He went shopping for groceries and lost his umbrella on the bus.',
          'He stayed home all day studying for his driving exam.',
          'He took the train to the beach with his colleagues.',
        ],
        correctAnswerIndex: 0,
        explanation: '"Fui al parque con mi perro... empezó a llover fuerte y tuvimos que correr hacia la cafetería."',
        skillTag: 'Past Tense Narration (Pretérito Indefinido)',
      },
      {
        id: 'es-a2-2',
        type: 'grammar',
        question: 'Choose the correct form to express past habits: "Cuando era niño, siempre ________ al fútbol con mis primos."',
        options: [
          'jugué',
          'jugaba',
          'jugaré',
          'juego',
        ],
        correctAnswerIndex: 1,
        explanation: 'Habitual past actions in childhood take the Imperfect tense: "jugaba".',
        skillTag: 'Imperfect vs Preterite',
      },
      {
        id: 'es-a2-3',
        type: 'vocabulary',
        question: 'Which connector best explains a reason: "No pude ir a la fiesta ________ tenía mucha fiebre."',
        options: [
          'porque',
          'sin embargo',
          'además',
          'aunque',
        ],
        correctAnswerIndex: 0,
        explanation: '"Porque" introduces a causal explanation ("because I had a high fever").',
        skillTag: 'Cause & Effect Connectors',
      },
    ],
    'B1': [
      {
        id: 'es-b1-1',
        type: 'listening',
        question: 'Listen to the travel review. What does the speaker recommend about the mountain village?',
        audioPrompt: 'Si vas al pueblo en primavera, te aconsejo que alquiles una bicicleta eléctrica, porque las cuestas son muy empinadas pero las vistas sobre el valle son incomparables.',
        options: [
          'Renting an electric bicycle due to steep hills and peerless valley views',
          'Booking a tour bus early because tickets sell out in advance',
          'Avoiding spring visits due to frequent mudslides',
          'Staying in the historic center without visiting outer viewpoints',
        ],
        correctAnswerIndex: 0,
        explanation: 'The speaker recommends "alquiles una bicicleta eléctrica, porque las cuestas son muy empinadas pero las vistas... son incomparables".',
        skillTag: 'Giving Recommendations & Conditional Advice',
      },
      {
        id: 'es-b1-2',
        type: 'grammar',
        question: 'Complete with the appropriate subjunctive form: "Es necesario que nosotros ________ las normas del laboratorio."',
        options: [
          'respetamos',
          'respetemos',
          'respetarán',
          'respetarían',
        ],
        correctAnswerIndex: 1,
        explanation: 'Impersonal expressions of necessity ("Es necesario que...") trigger the present subjunctive: "respetemos".',
        skillTag: 'Present Subjunctive with Impersonal Expressions',
      },
    ],
  },
  french: {
    'A0': [
      {
        id: 'fr-a0-1',
        type: 'listening',
        question: 'Listen to the French greeting. What is being said?',
        audioPrompt: 'Bonjour ! Comment vous appelez-vous ?',
        options: [
          'Hello! What is your name?',
          'Good evening! Where do you live?',
          'Goodbye! See you next week.',
          'Please give me the train ticket.',
        ],
        correctAnswerIndex: 0,
        explanation: '"Bonjour ! Comment vous appelez-vous ?" translates to "Hello! What is your name?".',
        skillTag: 'Greetings & Politeness',
      },
      {
        id: 'fr-a0-2',
        type: 'vocabulary',
        question: 'How do you say "Please" politely in French when addressing someone formally?',
        audioPrompt: 'S’il vous plaît.',
        options: [
          'S’il vous plaît',
          'Merci beaucoup',
          'À bientôt',
          'Excusez-moi',
        ],
        correctAnswerIndex: 0,
        explanation: '"S’il vous plaît" is the formal and respectful French phrase for "Please".',
        skillTag: 'Core Courtesies',
      },
      {
        id: 'fr-a0-3',
        type: 'dialogue',
        question: 'Someone greets you: "Enchanté de faire votre connaissance." What is the proper polite response?',
        options: [
          'Enchanté(e) également !',
          'Je ne sais pas.',
          'L’addition, s’il vous plaît.',
          'Il est midi.',
        ],
        correctAnswerIndex: 0,
        explanation: '"Enchanté(e) également !" means "Delighted to meet you as well!".',
        skillTag: 'Introductions',
      },
      {
        id: 'fr-a0-4',
        type: 'vocabulary',
        question: 'Which sequence represents the numbers "1, 2, 3, 4" in French?',
        options: [
          'Un, deux, trois, quatre',
          'Dix, vingt, trente, quarante',
          'Premier, deuxième, troisième, quatrième',
          'Lundi, mardi, mercredi, jeudi',
        ],
        correctAnswerIndex: 0,
        explanation: '"Un, deux, trois, quatre" are the cardinal numbers 1, 2, 3, 4 in French.',
        skillTag: 'Basic Numbers',
      },
      {
        id: 'fr-a0-5',
        type: 'reading',
        question: 'You see a sign outside a bistro: "Café au lait, croissant frais et jus d’orange". What is on offer?',
        options: [
          'Coffee with milk, fresh croissant, and orange juice',
          'Hot tea, chocolate cake, and soda',
          'Steak with fries and red wine',
          'Ice cream and mineral water',
        ],
        correctAnswerIndex: 0,
        explanation: '"Café au lait" (coffee with milk), "croissant frais" (fresh croissant), and "jus d’orange" (orange juice).',
        skillTag: 'Everyday Signs',
      },
    ],
    'A1': [
      {
        id: 'fr-a1-1',
        type: 'grammar',
        question: 'Complete the sentence: "Nous ________ à Paris depuis deux ans."',
        options: [
          'habite',
          'habites',
          'habitons',
          'habitent',
        ],
        correctAnswerIndex: 2,
        explanation: 'For "nous" (we), regular -er verbs take the "-ons" ending in present tense: "habitons".',
        skillTag: 'Present Tense Conjugation',
      },
      {
        id: 'fr-a1-2',
        type: 'listening',
        question: 'Listen to the baker. What does he say to the customer?',
        audioPrompt: 'Bonjour madame, avec ceci ? Ce sera tout ?',
        options: [
          'Good morning ma\'am, anything else with this? Will that be all?',
          'Good evening, we are closed for the holidays.',
          'Please wait outside for ten minutes.',
          'Your credit card has been declined.',
        ],
        correctAnswerIndex: 0,
        explanation: '"Avec ceci ? Ce sera tout ?" is the classic French baker phrase: "Anything else with that? Will that be all?".',
        skillTag: 'Shopping & Bakery Dialogues',
      },
    ],
  },
  german: {
    'A0': [
      {
        id: 'de-a0-1',
        type: 'listening',
        question: 'Listen to the German greeting. What does it mean?',
        audioPrompt: 'Guten Tag! Wie heißen Sie?',
        options: [
          'Good day! What is your name?',
          'Good night! See you tomorrow.',
          'Please, where is the hotel?',
          'How much does a coffee cost?',
        ],
        correctAnswerIndex: 0,
        explanation: '"Guten Tag! Wie heißen Sie?" means "Good day! What is your name?".',
        skillTag: 'Greetings & Introductions',
      },
      {
        id: 'de-a0-2',
        type: 'vocabulary',
        question: 'How do you say "Please" and "Thank you" in German?',
        audioPrompt: 'Bitte und Danke.',
        options: [
          'Bitte und Danke',
          'Ja und Nein',
          'Guten Morgen und Gute Nacht',
          'Hallo und Tschüss',
        ],
        correctAnswerIndex: 0,
        explanation: '"Bitte" = Please, "Danke" = Thank you.',
        skillTag: 'Courtesies',
      },
      {
        id: 'de-a0-3',
        type: 'vocabulary',
        question: 'Count from 1 to 4 in German:',
        options: [
          'Eins, zwei, drei, vier',
          'Zehn, zwanzig, dreißig, vierzig',
          'Erste, zweite, dritte, vierte',
          'Montag, Dienstag, Mittwoch, Donnerstag',
        ],
        correctAnswerIndex: 0,
        explanation: '"Eins, zwei, drei, vier" are numbers 1, 2, 3, 4 in German.',
        skillTag: 'Foundational Numbers',
      },
      {
        id: 'de-a0-4',
        type: 'dialogue',
        question: 'Someone asks: "Wie geht es Ihnen?" What is a natural polite reply?',
        options: [
          'Sehr gut, danke! Und Ihnen?',
          'Ich habe kein Geld.',
          'Der Zug kommt um 10 Uhr.',
          'Ich heiße Peter.',
        ],
        correctAnswerIndex: 0,
        explanation: '"Sehr gut, danke! Und Ihnen?" (Very well, thank you! And you?) is the classic polite answer.',
        skillTag: 'Basic Conversation',
      },
    ],
  },
};

/**
 * Universal fallback exam generator for any language and level
 */
export const getPromotionExam = (
  language: LanguageOption,
  fromLevel: ProficiencyLevel
): PromotionExam => {
  const langKey = language.id.toLowerCase();
  const levelCode = fromLevel.split(' - ')[0] || 'A0';
  const nextLevel = getNextLevel(fromLevel) || 'A1 - Beginner';
  const nextLevelCode = nextLevel.split(' - ')[0] || 'A1';

  const specificExamQuestions =
    PROMOTION_EXAMS_DATABASE[langKey]?.[levelCode] ||
    PROMOTION_EXAMS_DATABASE['spanish']?.[levelCode] ||
    PROMOTION_EXAMS_DATABASE['spanish']['A0'];

  // Personalize title and questions for the requested language
  const localizedQuestions = specificExamQuestions.map((q, idx) => ({
    ...q,
    id: `exam-${langKey}-${levelCode}-${idx + 1}`,
  }));

  return {
    id: `promotion-${langKey}-${levelCode}-to-${nextLevelCode}`,
    fromLevel,
    toLevel: nextLevel,
    targetLanguage: language.name,
    title: `${language.name} CEFR Promotion Exam: ${levelCode} ➔ ${nextLevelCode}`,
    description: `Official competency exam to promote your CEFR standing from ${levelCode} to ${nextLevelCode}. Scored across listening comprehension, vocabulary accuracy, and communicative dialogue.`,
    passingScore: 70, // 70% passing score
    durationMinutes: 10,
    questions: localizedQuestions,
  };
};
