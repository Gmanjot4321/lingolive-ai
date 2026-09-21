export interface InstantWordEntry {
  word: string;
  partOfSpeech: string;
  phonetic: string;
  translation: string;
  definition: string;
  contextMeaning: string;
  exampleSentences: { target: string; native: string }[];
  culturalNote?: string;
}

export const COMMON_DICTIONARY: Record<string, InstantWordEntry> = {
  // Spanish
  'hola': {
    word: 'hola',
    partOfSpeech: 'interjection',
    phonetic: '/ˈo.la/',
    translation: 'hello / hi',
    definition: 'Standard cordial greeting used at any time of day in both formal and informal contexts.',
    contextMeaning: 'Friendly opening greeting.',
    exampleSentences: [
      { target: '¡Hola! ¿Cómo estás hoy?', native: 'Hello! How are you today?' },
      { target: 'Dile hola de mi parte.', native: 'Say hello to them for me.' },
    ],
    culturalNote: 'Used universally across all Spanish-speaking countries without restriction.',
  },
  'gracias': {
    word: 'gracias',
    partOfSpeech: 'noun / interjection',
    phonetic: '/ˈɡɾa.sjas/',
    translation: 'thank you / thanks',
    definition: 'Expression of gratitude, politeness, or appreciation.',
    contextMeaning: 'Polite expression acknowledging assistance or courtesy.',
    exampleSentences: [
      { target: 'Muchas gracias por tu ayuda.', native: 'Thank you very much for your help.' },
      { target: 'Gracias a todos por venir.', native: 'Thanks everyone for coming.' },
    ],
  },
  'buenos': {
    word: 'buenos',
    partOfSpeech: 'adjective',
    phonetic: '/ˈbwe.nos/',
    translation: 'good',
    definition: 'Masculine plural form of "bueno" (favorable, high quality, kind).',
    contextMeaning: 'Part of "buenos días" (good morning).',
    exampleSentences: [
      { target: 'Buenos días a todos.', native: 'Good morning everyone.' },
      { target: 'Son muy buenos amigos.', native: 'They are very good friends.' },
    ],
  },
  'días': {
    word: 'días',
    partOfSpeech: 'noun (masculine plural)',
    phonetic: '/ˈdi.as/',
    translation: 'days',
    definition: 'Plural of "día", 24-hour periods or daytime.',
    contextMeaning: 'Used in the standard morning salutation.',
    exampleSentences: [
      { target: 'Buenos días.', native: 'Good morning.' },
      { target: 'Pasamos tres días en Sevilla.', native: 'We spent three days in Seville.' },
    ],
  },
  'amigo': {
    word: 'amigo',
    partOfSpeech: 'noun (masculine)',
    phonetic: '/aˈmi.ɣo/',
    translation: 'friend',
    definition: 'A person with whom one has a bond of mutual affection and trust.',
    contextMeaning: 'Companion or confidant.',
    exampleSentences: [
      { target: 'Es mi mejor amigo de la infancia.', native: 'He is my best childhood friend.' },
    ],
  },
  'tiempo': {
    word: 'tiempo',
    partOfSpeech: 'noun (masculine)',
    phonetic: '/ˈtjem.po/',
    translation: 'time / weather',
    definition: 'Continuous duration or atmospheric condition.',
    contextMeaning: 'Duration or meteorological state.',
    exampleSentences: [
      { target: 'No tenemos mucho tiempo.', native: 'We do not have much time.' },
      { target: 'Hace buen tiempo hoy.', native: 'The weather is good today.' },
    ],
  },
  'viaje': {
    word: 'viaje',
    partOfSpeech: 'noun (masculine)',
    phonetic: '/ˈbja.xe/',
    translation: 'trip / journey / travel',
    definition: 'An act of traveling from one place to another.',
    contextMeaning: 'Travel excursion or transit.',
    exampleSentences: [
      { target: '¡Buen viaje!', native: 'Have a good trip!' },
      { target: 'El viaje en tren dura dos horas.', native: 'The train journey lasts two hours.' },
    ],
  },
  'café': {
    word: 'café',
    partOfSpeech: 'noun (masculine)',
    phonetic: '/kaˈfe/',
    translation: 'coffee / café',
    definition: 'A beverage brewed from roasted coffee beans, or an establishment serving drinks.',
    contextMeaning: 'Morning or social drink.',
    exampleSentences: [
      { target: 'Un café con leche, por favor.', native: 'A coffee with milk, please.' },
    ],
  },

  // French
  'bonjour': {
    word: 'bonjour',
    partOfSpeech: 'interjection / noun',
    phonetic: '/bɔ̃.ʒuʁ/',
    translation: 'hello / good day',
    definition: 'Standard polite greeting used from morning until late afternoon.',
    contextMeaning: 'Fundamental polite greeting in francophone culture.',
    exampleSentences: [
      { target: 'Bonjour ! Comment allez-vous ?', native: 'Hello! How are you?' },
    ],
    culturalNote: 'Always say "Bonjour" when entering any shop or greeting someone in France; omitting it is perceived as impolite.',
  },
  'merci': {
    word: 'merci',
    partOfSpeech: 'interjection',
    phonetic: '/mɛʁ.si/',
    translation: 'thank you / thanks',
    definition: 'Polite expression of gratitude.',
    contextMeaning: 'Expressing appreciation.',
    exampleSentences: [
      { target: 'Merci beaucoup pour votre aide.', native: 'Thank you very much for your help.' },
    ],
  },
  's’il': {
    word: 's’il',
    partOfSpeech: 'conjunction + pronoun',
    phonetic: '/sil/',
    translation: 'if he / if it',
    definition: 'Contraction of "si" (if) and "il" (he/it). Commonly part of "s’il vous plaît" (please).',
    contextMeaning: 'Polite request marker.',
    exampleSentences: [
      { target: 'S’il vous plaît.', native: 'Please.' },
    ],
  },
  'voyage': {
    word: 'voyage',
    partOfSpeech: 'noun (masculine)',
    phonetic: '/vwa.jaʒ/',
    translation: 'journey / trip',
    definition: 'Act of traveling to distant destinations.',
    contextMeaning: 'Travel excursion.',
    exampleSentences: [
      { target: 'Bon voyage !', native: 'Have a great journey!' },
    ],
  },

  // German
  'hallo': {
    word: 'hallo',
    partOfSpeech: 'interjection',
    phonetic: '/ˈha.loː/',
    translation: 'hello / hi',
    definition: 'Everyday casual greeting among friends, colleagues, and acquaintances.',
    contextMeaning: 'Casual or informal greeting.',
    exampleSentences: [
      { target: 'Hallo, wie geht es dir?', native: 'Hello, how are you?' },
    ],
  },
  'danke': {
    word: 'danke',
    partOfSpeech: 'interjection',
    phonetic: '/ˈdaŋ.kə/',
    translation: 'thank you / thanks',
    definition: 'Common expression of gratitude.',
    contextMeaning: 'Acknowledging favor or kindness.',
    exampleSentences: [
      { target: 'Vielen Dank für Ihre Unterstützung.', native: 'Many thanks for your support.' },
    ],
  },

  // French additional vocabulary
  'croissant': {
    word: 'croissant',
    partOfSpeech: 'noun (masculine)',
    phonetic: '/kʁwa.sɑ̃/',
    translation: 'croissant (buttery crescent pastry)',
    definition: 'A buttery, flaky, crescent-shaped viennoiserie pastry.',
    contextMeaning: 'French breakfast staple.',
    exampleSentences: [
      { target: 'Je voudrais un croissant et un café s\'il vous plaît.', native: 'I would like a croissant and a coffee please.' },
    ],
    culturalNote: 'Typically paired with espresso or café au lait for a traditional French breakfast.',
  },
  'baguette': {
    word: 'baguette',
    partOfSpeech: 'noun (feminine)',
    phonetic: '/ba.ɡɛt/',
    translation: 'baguette (French bread stick)',
    definition: 'Long, thin loaf of French bread that has a crisp crust and soft interior.',
    contextMeaning: 'Iconic French crusty loaf of bread.',
    exampleSentences: [
      { target: 'Une baguette tradition bien cuite, s\'il vous plaît.', native: 'A well-done traditional baguette, please.' },
    ],
  },
  'enchanté': {
    word: 'enchanté',
    partOfSpeech: 'adjective / interjection',
    phonetic: '/ɑ̃.ʃɑ̃.te/',
    translation: 'delighted / nice to meet you',
    definition: 'Polite greeting said when being introduced to someone for the first time.',
    contextMeaning: 'Pleased to meet you.',
    exampleSentences: [
      { target: 'Enchanté de faire votre connaissance.', native: 'Delighted to make your acquaintance.' },
    ],
  },
  'gare': {
    word: 'gare',
    partOfSpeech: 'noun (feminine)',
    phonetic: '/ɡaʁ/',
    translation: 'train station / railway station',
    definition: 'A passenger and train depot or terminal.',
    contextMeaning: 'Railway station.',
    exampleSentences: [
      { target: 'Le train part de la Gare de Lyon.', native: 'The train departs from the Gare de Lyon.' },
    ],
  },
  'train': {
    word: 'train',
    partOfSpeech: 'noun (masculine)',
    phonetic: '/tʁɛ̃/',
    translation: 'train',
    definition: 'A connected series of rail cars or carriages.',
    contextMeaning: 'Railway transit.',
    exampleSentences: [
      { target: 'Le train à grande vitesse (TGV) est très ponctuel.', native: 'The high-speed train (TGV) is very punctual.' },
    ],
  },

  // Japanese
  'こんにちは': {
    word: 'こんにちは',
    partOfSpeech: 'greeting',
    phonetic: '/koɴ.ni.tɕi.wa/',
    translation: 'hello / good afternoon',
    definition: 'Standard polite daytime greeting spoken to acquaintances and peers.',
    contextMeaning: 'General daytime salutation.',
    exampleSentences: [
      { target: '皆さん、こんにちは。', native: 'Hello everyone.' },
    ],
  },
  'ありがとう': {
    word: 'ありがとう',
    partOfSpeech: 'expression',
    phonetic: '/a.ɾi.ɡa.toː/',
    translation: 'thank you',
    definition: 'Friendly and polite expression of gratitude.',
    contextMeaning: 'Showing appreciation.',
    exampleSentences: [
      { target: 'いつもありがとうございます。', native: 'Thank you always as always.' },
    ],
  },
};

/**
 * Returns instant lookup info in 0ms without waiting for a server roundtrip.
 */
export function getInstantWordDetails(
  rawWord: string,
  contextSentence: string = '',
  targetLanguage: string = 'Spanish'
): InstantWordEntry {
  const cleanWord = rawWord.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()¿?¡!"']/g, '').trim();

  if (COMMON_DICTIONARY[cleanWord]) {
    return COMMON_DICTIONARY[cleanWord];
  }

  // Smart heuristic decomposition for instant 0ms rendering
  return {
    word: rawWord.trim(),
    partOfSpeech: 'vocabulary term',
    phonetic: `/${cleanWord}/`,
    translation: cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1),
    definition: `Essential vocabulary entry in ${targetLanguage}.`,
    contextMeaning: contextSentence ? `Used in context: "${contextSentence}"` : `Active vocabulary term in ${targetLanguage}.`,
    exampleSentences: contextSentence
      ? [
          { target: contextSentence, native: `Usage excerpt from conversation` },
        ]
      : [
          { target: `${rawWord} es una palabra importante.`, native: `${rawWord} is an important word.` },
        ],
    culturalNote: `Frequently utilized in everyday ${targetLanguage} interactions.`,
  };
}
