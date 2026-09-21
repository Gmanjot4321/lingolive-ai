export interface LevelGreeting {
  text: string;
  translation: string;
  phonetic?: string;
  suggestedStarters: string[];
  pedagogicalFocus: string;
}

export const LEVEL_GREETINGS: Record<string, Record<string, LevelGreeting>> = {
  spanish: {
    'A0 - Absolute Beginner (Zero Knowledge)': {
      text: '¡Hola! Bienvenido. (Hello! Welcome.) Don’t worry if you know zero Spanish—we will learn step by step together! Let’s start with your very first greeting: "¡Hola!". Try saying it or click below!',
      translation: 'Hello! Welcome. Don’t worry if you know zero Spanish—we will learn together!',
      phonetic: 'OH-lah',
      suggestedStarters: ['¡Hola!', '¿Cómo estás?', 'How do I say thank you?'],
      pedagogicalFocus: 'Zero-knowledge survival: 1-2 words at a time with phonetic guidance.',
    },
    'A1 - Beginner': {
      text: '¡Hola! Mucho gusto. Me alegro de practicar español contigo. ¿Cómo te llamas y de qué ciudad eres?',
      translation: 'Hello! Nice to meet you. I am glad to practice Spanish with you. What is your name and which city are you from?',
      phonetic: 'OH-lah! MOO-choh GOO-stoh. Meh ah-LEH-groh deh prahk-tee-KAHR...',
      suggestedStarters: ['Me llamo Alex y soy de Madrid', '¡Hola! Mucho gusto', 'Soy estudiante de español'],
      pedagogicalFocus: 'Basic high-frequency vocabulary, present tense, and simple personal introductions.',
    },
    'A2 - Elementary': {
      text: '¡Hola! Qué bueno verte de nuevo. Cuéntame un poco sobre tu rutina diaria: ¿qué sueles hacer por las mañanas y qué hiciste el fin de semana pasado?',
      translation: 'Hello! Great to see you again. Tell me a bit about your daily routine: what do you usually do in the mornings and what did you do last weekend?',
      suggestedStarters: ['Por las mañanas tomo café y salgo a caminar', 'El fin de semana descansé con mi familia', 'Suelo trabajar temprano y cocinar por la tarde'],
      pedagogicalFocus: 'Everyday routines, simple past (pretérito indefinido), and basic future plans.',
    },
    'B1 - Intermediate': {
      text: '¡Hola! Me da mucho gusto saludarte. Hoy me gustaría que conversemos sobre viajes y experiencias culturales. Si pudieras viajar a cualquier destino del mundo mañana mismo, ¿a dónde irías y qué te motiva a elegirlo?',
      translation: 'Hello! It gives me great pleasure to greet you. Today I would like us to talk about travel and cultural experiences. If you could travel to any destination tomorrow, where would you go and what motivates your choice?',
      suggestedStarters: ['Me encantaría viajar a los Andes por su naturaleza', 'Prefiero recorrer ciudades históricas con museos', 'Creo que viajar transforma nuestra forma de ver la vida'],
      pedagogicalFocus: 'Expressing opinions, past anecdotes, conditional desires, and connected discourse.',
    },
    'B2 - Upper Intermediate': {
      text: '¡Qué tal! Es un verdadero gusto conversar contigo. Estaba reflexionando sobre el impacto de la digitalización acelerada en nuestras interacciones humanas cotidianas. ¿Consideras que la tecnología fomenta una conexión genuina o tiende a aislar a las personas?',
      translation: 'How is it going! It is a real pleasure to talk with you. I was reflecting on the impact of rapid digitalization on our daily human interactions. Do you consider that technology fosters genuine connection or tends to isolate people?',
      suggestedStarters: ['Tiene un doble filo: amplía el alcance pero superficializa el contacto', 'Considero que la tecnología es solo un medio; el uso define el resultado', 'Depende de la madurez digital y el contexto generacional'],
      pedagogicalFocus: 'Complex argumentation, idiomatic subtleties, subjunctive triggers, and debate pacing.',
    },
    'C1 - Advanced / Fluent': {
      text: 'Saludos cordiales. Resulta sumamente estimulante profundizar en cuestiones donde convergen la lingüística, la identidad y la cosmovisión. A menudo se debate hasta qué punto las estructuras intrínsecas de nuestro idioma moldean de manera inadvertida nuestra percepción cognitiva de la realidad. ¿Cuál es tu postura ante este determinismo lingüístico?',
      translation: 'Warm greetings. It is deeply stimulating to delve into matters where linguistics, identity, and worldview converge. It is often debated to what extent intrinsic linguistic structures inadvertently shape our cognitive perception of reality. What is your stance on this linguistic determinism?',
      suggestedStarters: ['Indudablemente, cada lengua predispone esquemas conceptuales específicos', 'Sostengo que el pensamiento abstracto trasciende las barreras gramaticales', 'Las metáforas culturales encapsulan formas irrepetibles de entender el tiempo'],
      pedagogicalFocus: 'Native rhetorical elegance, sophisticated discourse markers, philosophical depth, and lexical precision.',
    },
  },

  french: {
    'A0 - Absolute Beginner (Zero Knowledge)': {
      text: 'Bonjour! Bienvenue. (Hello! Welcome.) Don’t worry if you know zero French—we will discover the language together! Let’s start with your very first greeting: "Bonjour". Try saying it or click below!',
      translation: 'Hello! Welcome. Don’t worry if you know zero French—we will discover the language together!',
      phonetic: 'bohn-ZHOOR',
      suggestedStarters: ['Bonjour!', 'Comment ça va?', 'How do I say thank you?'],
      pedagogicalFocus: 'Zero-knowledge survival: phonetic breakdowns and foundational greetings.',
    },
    'A1 - Beginner': {
      text: 'Bonjour! Enchanté(e). Je suis ravi de pratiquer le français avec vous. Comment vous appelez-vous et d’où venez-vous?',
      translation: 'Hello! Delighted. I am pleased to practice French with you. What is your name and where are you from?',
      phonetic: 'bohn-ZHOOR! ahn-shahn-TAY...',
      suggestedStarters: ['Je m’appelle Sarah et j’habite à Paris', 'Bonjour! Enchanté', 'J’apprends le français depuis peu'],
      pedagogicalFocus: 'Simple present tense, polite forms, and basic self-introductions.',
    },
    'A2 - Elementary': {
      text: 'Bonjour! Quel plaisir de vous retrouver. Racontez-moi un peu votre quotidien: qu’aimez-vous faire pendant vos week-ends ou votre temps libre?',
      translation: 'Hello! What a pleasure to see you again. Tell me a bit about your daily life: what do you like to do on weekends or in your free time?',
      suggestedStarters: ['Pendant mon temps libre, j’aime cuisiner et lire', 'Le week-end dernier, je me suis promené au parc', 'J’aime beaucoup découvrir de nouveaux cafés'],
      pedagogicalFocus: 'Passé composé, routine descriptions, and everyday conversational exchanges.',
    },
    'B1 - Intermediate': {
      text: 'Bonjour! Ravi de vous accueillir. Aujourd’hui, parlons de voyages et d’art de vivre. Selon vous, quel est l’aspect le plus fascinant lorsqu’on découvre une culture étrangère?',
      translation: 'Hello! Delighted to welcome you. Today, let’s speak about travel and lifestyle. In your opinion, what is the most fascinating aspect when discovering a foreign culture?',
      suggestedStarters: ['Pour moi, la gastronomie locale est la porte d’entrée idéale', 'C’est surtout la façon dont les gens échangent au quotidien', 'Voyager nous oblige à remettre en question nos certitudes'],
      pedagogicalFocus: 'Expressing opinions, compound clauses, future and conditional nuances.',
    },
    'B2 - Upper Intermediate': {
      text: 'Bonjour! C’est un plaisir d’échanger avec vous. Une question contemporaine me vient à l’esprit: pensez-vous que le télétravail généralisé renforce l’autonomie individuelle ou fragilise le tissu social d’une équipe?',
      translation: 'Hello! It is a pleasure to exchange with you. A contemporary question comes to mind: do you think widespread remote work strengthens individual autonomy or weakens the social fabric of a team?',
      suggestedStarters: ['C’est un équilibre délicat entre flexibilité et sentiment d’appartenance', 'À mon sens, cela responsabilise davantage les collaborateurs', 'Le manque d’interactions spontanées peut nuire à l’innovation collective'],
      pedagogicalFocus: 'Subjunctive triggers, nuanced debate arguments, and spontaneous conversational flow.',
    },
    'C1 - Advanced / Fluent': {
      text: 'Mes salutations les plus chaleureuses. Il est particulièrement enrichissant d’aborder des sujets où s’entremêlent philosophie et mutations sociétales. Face à l’accélération constante de nos modes de vie, estimez-vous que la lenteur soit devenue le luxe suprême de notre époque?',
      translation: 'My warmest greetings. It is particularly enriching to address topics where philosophy and societal mutations intertwine. Given the constant acceleration of our lifestyles, do you believe slowness has become the ultimate luxury of our era?',
      suggestedStarters: ['Absolument, préserver son attention est devenu un acte de résistance intellectuelle', 'La recherche de lenteur témoigne d’une quête de sens plus profonde', 'Cette dichotomie entre vitesse et contemplation conditionne notre rapport au monde'],
      pedagogicalFocus: 'Sophisticated register, French rhetorical precision, and abstract intellectual discourse.',
    },
  },

  german: {
    'A0 - Absolute Beginner (Zero Knowledge)': {
      text: 'Hallo! Willkommen. (Hello! Welcome.) Don’t worry if you know zero German—we will master it together! Let’s start with your very first greeting: "Hallo!". Try saying it or click below!',
      translation: 'Hello! Welcome. Don’t worry if you know zero German—we will learn together!',
      phonetic: 'HAH-loh',
      suggestedStarters: ['Hallo!', 'Wie geht es dir?', 'How do I say thank you?'],
      pedagogicalFocus: 'Zero-knowledge survival: foundational greetings and phonetic pronunciation.',
    },
    'A1 - Beginner': {
      text: 'Hallo! Freut mich sehr. Ich freue mich darauf, mit dir Deutsch zu üben. Wie heißt du und woher kommst du?',
      translation: 'Hello! Nice to meet you. I look forward to practicing German with you. What is your name and where are you from?',
      suggestedStarters: ['Ich heiße Lukas und komme aus Berlin', 'Hallo! Freut mich auch', 'Ich lerne seit kurzem Deutsch'],
      pedagogicalFocus: 'Basic sentence structure, verb conjugations (Präsens), and personal questions.',
    },
    'B1 - Intermediate': {
      text: 'Hallo! Schön, dich wiederzusehen. Heute möchte ich über Reisen und Hobbys sprechen. Wenn du morgen überallhin reisen könntest, welches Land würdest du wählen und warum?',
      translation: 'Hello! Nice to see you again. Today I would like to talk about travel and hobbies. If you could travel anywhere tomorrow, which country would you choose and why?',
      suggestedStarters: ['Ich würde gerne die Schweizer Berge erkunden', 'Ich interessiere mich sehr für historische Städte', 'Reisen hilft mir dabei, neue Perspektiven zu gewinnen'],
      pedagogicalFocus: 'Nebensätze (weil, dass, wenn), Konjunktiv II, and expressing personal motivations.',
    },
    'B2 - Upper Intermediate': {
      text: 'Guten Tag! Es ist mir ein Vergnügen, mich mit dir auszutauschen. Glaubst du, dass moderne Technologien wie künstliche Intelligenz traditionelle Bildungswege grundlegend verändern werden?',
      translation: 'Good day! It is a pleasure to exchange thoughts with you. Do you believe that modern technologies like artificial intelligence will fundamentally change traditional educational paths?',
      suggestedStarters: ['Zweifellos wird der Unterricht personalisierter und flexibler', 'Technologie kann den menschlichen Dialog im Klassenzimmer nicht ersetzen', 'Es kommt entscheidend auf die Vermittlung von Medienkompetenz an'],
      pedagogicalFocus: 'Complex connectors (sowohl...als auch, einerseits...andererseits), debating abstract societal trends.',
    },
    'C1 - Advanced / Fluent': {
      text: 'Herzlich willkommen zu unserem Diskurs. Inwiefern prägen sprachliche Denkmuster und idiomatische Feinheiten unser gesellschaftliches Wertegefüge? Ich bin gespannt auf deine differenzierte Einschätzung.',
      translation: 'A warm welcome to our discourse. In what ways do linguistic thought patterns and idiomatic nuances shape our societal value system? I look forward to your nuanced evaluation.',
      suggestedStarters: ['Sprache ist zweifellos ein Spiegel und zugleich Gestalter gesellschaftlicher Realität', 'Begriffe transportieren historisch gewachsene Konnotationen', 'Die semantische Präzision bestimmt maßgeblich die Tiefe unseres Denkens'],
      pedagogicalFocus: 'Academic register, nominal style, sophisticated idioms, and conceptual argumentation.',
    },
  },

  japanese: {
    'A0 - Absolute Beginner (Zero Knowledge)': {
      text: 'こんにちは！ようこそ。(Konnichiwa! Welcome.) Don’t worry if you know zero Japanese—we will take it step by step! Let’s begin with your first word: "こんにちは" (Konnichiwa = Hello). Try saying it or click below!',
      translation: 'Hello! Welcome. Don’t worry if you know zero Japanese—we will take it step by step!',
      phonetic: 'Kohn-nee-chee-wah',
      suggestedStarters: ['こんにちは (Konnichiwa)', 'ありがとうございます (Arigatou gozaimasu)', 'How do I say nice to meet you?'],
      pedagogicalFocus: 'Zero-knowledge survival: Romaji guidance, basic polite greetings.',
    },
    'A1 - Beginner': {
      text: 'こんにちは！はじめまして。日本語の練習をはじめましょう。お名前は何ですか？どこから来ましたか？',
      translation: 'Hello! Nice to meet you. Let’s start practicing Japanese. What is your name? Where are you from?',
      phonetic: 'Konnichiwa! Hajimemashite. Nihongo no renshuu o hajimemashou. Onamae wa nan desu ka?',
      suggestedStarters: ['はじめまして、ケンです (Hajimemashite, Ken desu)', 'アメリカから来ました (Amerika kara kimashita)', 'よろしくお願いします (Yoroshiku onegaishimasu)'],
      pedagogicalFocus: 'Basic desu/masu polite form, self-introductions, and daily pleasantries.',
    },
    'B1 - Intermediate': {
      text: 'こんにちは！お元気ですか？今日は日本の文化や旅行について話しましょう。もし日本に行くなら、どんな場所を訪れてみたいですか？',
      translation: 'Hello! How are you? Today let’s talk about Japanese culture and travel. If you were to go to Japan, what kind of places would you like to visit?',
      phonetic: 'Konnichiwa! Ogenki desu ka? Kyou wa Nihon no bunka ya ryokou ni tsuite...',
      suggestedStarters: ['京都の古いお寺や庭園を見学したいです', '東京の美味しい食べ物を巡りたいです', '自然が豊かな北海道に興味があります'],
      pedagogicalFocus: 'Te-form connectors, tara conditional, expressing personal preferences.',
    },
    'B2 - Upper Intermediate': {
      text: 'こんにちは！最近のデジタル技術の進歩についてどう思われますか？特にAIが私たちの働き方やコミュニケーションに与える影響について、ご意見を聞かせてください。',
      translation: 'Hello! What do you think about recent advances in digital technology? In particular, please share your thoughts on the impact of AI on our working styles and communication.',
      phonetic: 'Konnichiwa! Saikin no dejitaru gijutsu no shinpo ni tsuite dou omowaremasu ka?',
      suggestedStarters: ['効率化が進む一方で、人間らしい温かみが重要になると思います', 'クリエイティブな分野での共同作業が期待できます', '個人のプライバシーや倫理的な課題にも配慮が必要です'],
      pedagogicalFocus: 'Keigo basics, expressing complex opinions with to omoimasu / ni tsuite, nuanced social debates.',
    },
    'C1 - Advanced / Fluent': {
      text: 'お目にかかれて光栄です。言語構造と文化的アイデンティティの相互作用について、非常に興味深い議論がございます。言語が思考の枠組みを規定するという仮説について、どのようにお考えでしょうか。',
      translation: 'It is an honor to meet you. There is a fascinating discussion regarding the interplay between linguistic structure and cultural identity. How do you view the hypothesis that language determines frameworks of thought?',
      suggestedStarters: ['確かに独自の語彙体系は世界観の差異を如実に反映していると言えます', '概念的思考は言語の制約をある程度超越できるのではないでしょうか', '翻訳困難なニュアンスの存在こそが文化の深奥を物語っています'],
      pedagogicalFocus: 'High-level Sonkeigo/Kenjougo, literary idioms, conceptual Japanese discourse.',
    },
  },
};

/**
 * Fallback generator for languages without an explicit entry
 */
export function getLevelGreeting(
  languageId: string,
  languageName: string,
  level: string,
  samplePhrase: string,
  sampleTranslation: string,
  personaName: string
): LevelGreeting {
  const langTable = LEVEL_GREETINGS[languageId];
  if (langTable && langTable[level]) {
    return langTable[level];
  }

  const isA0 = level.includes('A0');
  const isA1 = level.includes('A1');
  const isA2 = level.includes('A2');
  const isB1 = level.includes('B1');
  const isB2 = level.includes('B2');
  const isC1 = level.includes('C1');

  if (isA0) {
    return {
      text: `Hello! I'm ${personaName}. Don't worry if you know zero ${languageName}—we will learn together step by step! Let's start with your very first greeting: "${samplePhrase}". Try saying it or click below!`,
      translation: `(Welcome to your first ${languageName} lesson)`,
      phonetic: samplePhrase,
      suggestedStarters: [samplePhrase, 'Hello!', 'How do I say thank you?'],
      pedagogicalFocus: 'Zero-knowledge survival: foundational greetings and phonetic pronunciation.',
    };
  }

  if (isA1) {
    return {
      text: `${samplePhrase}! I am ${personaName}. Nice to meet you. What is your name and where are you from?`,
      translation: `${sampleTranslation}! What is your name and where are you from?`,
      suggestedStarters: [`${samplePhrase}!`, `My name is Alex`, `Nice to meet you`],
      pedagogicalFocus: 'High-frequency beginner vocabulary and simple present tense.',
    };
  }

  if (isA2) {
    return {
      text: `${samplePhrase}! Great to practice ${languageName} together. Tell me about your typical day or what you did last weekend!`,
      translation: `${sampleTranslation}! Tell me about your routine or recent activities.`,
      suggestedStarters: ['I like to relax on weekends', 'My daily routine is simple', 'What do you like to do?'],
      pedagogicalFocus: 'Everyday routines, past tense narrations, and simple future intentions.',
    };
  }

  if (isB1) {
    return {
      text: `${samplePhrase}! I am glad to speak with you today. Let's discuss travel, culture, and our favorite experiences. What is a place you dream of visiting?`,
      translation: `${sampleTranslation}! What is a place you dream of visiting and why?`,
      suggestedStarters: ['I would love to travel to the mountains', 'I enjoy learning about local food', 'Traveling opens the mind'],
      pedagogicalFocus: 'Connected discourse, expressing reasons and opinions, conditional phrasing.',
    };
  }

  if (isB2) {
    return {
      text: `${samplePhrase}! It is a pleasure to talk with you. How do you think modern technology and digital tools are reshaping communication in our society today?`,
      translation: `${sampleTranslation}! What are your thoughts on technology reshaping communication?`,
      suggestedStarters: ['It connects us faster but reduces depth', 'It depends on how mindful we are', 'I find it mostly beneficial'],
      pedagogicalFocus: 'Nuanced debate, abstract arguments, complex sentences, and idiomatic expressions.',
    };
  }

  // C1
  return {
    text: `${samplePhrase}! It is a privilege to engage in this conversation. To what extent do you believe that mastering another language fundamentally transforms the way we conceptualize the world?`,
    translation: `${sampleTranslation}! How does language mastery alter conceptual thought?`,
    suggestedStarters: ['Language certainly shapes our worldview', 'Conceptual thinking often precedes speech', 'Untranslatable words prove cultural uniqueness'],
    pedagogicalFocus: 'Sophisticated rhetorical mastery, native idioms, and philosophical depth.',
  };
}
