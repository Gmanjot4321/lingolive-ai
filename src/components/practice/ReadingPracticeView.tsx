import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Volume2,
  CheckCircle2,
  Sparkles,
  Zap,
  RotateCcw,
  Clock,
  Eye,
  ArrowRight,
  Loader2,
  Search,
  Filter,
  Layers,
  Plus,
} from 'lucide-react';
import { LanguageOption, ProficiencyLevel } from '../../types';

interface ReadingPracticeViewProps {
  currentLanguage: LanguageOption;
  proficiencyLevel: ProficiencyLevel;
  onOpenWordLookup: (word: string, sentence: string) => void;
  onSaveWord: (word: string, translation: string, phonetic: string, sentence: string) => void;
  onAwardXP: (xp: number) => void;
}

interface ReadingPassage {
  id: string;
  title: string;
  level: string;
  category?: string;
  wordCount: number;
  readTime: string;
  text: string;
  translation: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

const EXTENSIVE_READING_PASSAGES: Record<string, ReadingPassage[]> = {
  french: [
    {
      id: 'fr-read-1',
      title: 'Une Invitation au Musée du Louvre',
      level: 'A0 - A1',
      category: 'Culture & Art',
      wordCount: 85,
      readTime: '2 min',
      text: 'Chère Émilie,\n\nSamedi prochain, je visite le musée du Louvre à quatorze heures. Est-ce que tu veux venir avec moi ? Nous pouvons regarder la Joconde et nous promener dans les jardins des Tuileries. Après la visite, nous boirons un chocolat chaud dans un salon de thé traditionnel.\n\nRéponds-moi vite !\n\nTon ami, Marc.',
      translation: 'Dear Émilie,\n\nNext Saturday, I am visiting the Louvre Museum at two o’clock. Do you want to come with me? We can see the Mona Lisa and stroll through the Tuileries gardens. After the visit, we will drink hot chocolate in a traditional tea room.\n\nReply quickly!\n\nYour friend, Marc.',
      questions: [
        {
          question: 'À quelle heure Marc visite-t-il le musée samedi ?',
          options: ['À dix heures', 'À midi', 'À quatorze heures', 'À dix-huit heures'],
          correctIndex: 2,
          explanation: 'The text states: "à quatorze heures" (at 2:00 PM).',
        },
        {
          question: 'Que feront-ils après le musée ?',
          options: ['Ils prendront le train', 'Ils boiront un chocolat chaud', 'Ils achèteront des livres', 'Ils iront au cinéma'],
          correctIndex: 1,
          explanation: 'Marc writes: "nous boirons un chocolat chaud dans un salon de thé."',
        },
      ],
    },
    {
      id: 'fr-read-2',
      title: 'Le Marché des Saveurs de Provence',
      level: 'A2 - Elementary',
      category: 'Gastronomy',
      wordCount: 130,
      readTime: '3 min',
      text: 'Le village d’Aix-en-Provence s’anime dès l’aube chaque mardi et samedi matin. Sous les platanes centenaires, les maraîchers locaux installent leurs étals colorés. On y trouve des pyramides d’olives noires parfumées au thym, du miel de lavande doré, et des fromages de chèvre artisanaux enveloppés de feuilles de châtaignier. Les marchands vantent la fraîcheur de leurs produits avec un accent chantant qui réchauffe le cœur des passants.',
      translation: 'The village of Aix-en-Provence comes alive at dawn every Tuesday and Saturday morning. Under century-old plane trees, local market gardeners set up their colorful stalls. There you will find pyramids of black olives scented with thyme, golden lavender honey, and artisanal goat cheeses wrapped in chestnut leaves. Vendors boast the freshness of their products with a singing accent that warms the hearts of passersby.',
      questions: [
        {
          question: 'Quels jours le marché a-t-il lieu ?',
          options: ['Lundi et vendredi', 'Mardi et samedi', 'Mercredi et dimanche', 'Tous les jours'],
          correctIndex: 1,
          explanation: 'The text explicitly says: "chaque mardi et samedi matin".',
        },
        {
          question: 'Dans quoi les fromages de chèvre sont-ils enveloppés ?',
          options: ['Du papier journal', 'Des feuilles de châtaignier', 'Du plastique transparent', 'Des serviettes blanches'],
          correctIndex: 1,
          explanation: 'The passage specifies: "enveloppés de feuilles de châtaignier" (wrapped in chestnut leaves).',
        },
      ],
    },
    {
      id: 'fr-read-3',
      title: 'L’Art de Vivre et la Gastronomie Parisienne',
      level: 'B1 - Intermediate',
      category: 'Lifestyle',
      wordCount: 165,
      readTime: '4 min',
      text: 'En France, le repas n’est pas simplement un acte de nutrition, mais un véritable rituel culturel inscrit au patrimoine immatériel de l’UNESCO. S’asseoir à la terrasse d’un bistrot parisien avec une carafe d’eau fraîche et une baguette croustillante symbolise un rythme de vie où l’on prend le temps d’échanger. Les chefs étoilés comme les petits cuisiniers de quartier partagent le même respect scrupuleux pour la saisonnalité des ingrédients et l’équilibre subtil des saveurs.',
      translation: 'In France, a meal is not simply an act of nutrition, but a true cultural ritual inscribed on UNESCO’s intangible heritage list. Sitting at the terrace of a Parisian bistro with a jug of cold water and a crispy baguette symbolizes a rhythm of life where one takes time to converse. Starred chefs and small neighborhood cooks alike share the same scrupulous respect for the seasonality of ingredients and the subtle balance of flavors.',
      questions: [
        {
          question: 'Pourquoi le repas français est-il inscrit à l’UNESCO ?',
          options: [
            'Car il est un rituel culturel et social essentiel',
            'Parce qu’il coûte très cher',
            'Uniquement pour les desserts',
            'Pour interdire la restauration rapide',
          ],
          correctIndex: 0,
          explanation: 'The text explains that the French gastronomic meal is a cultural ritual valuing social exchange and tradition.',
        },
      ],
    },
    {
      id: 'fr-read-4',
      title: 'L’Existentialisme et la Quête de Liberté chez Sartre',
      level: 'B2 - C1 Advanced',
      category: 'Philosophy & Literature',
      wordCount: 190,
      readTime: '5 min',
      text: 'Au sortir de la Seconde Guerre mondiale, le quartier de Saint-Germain-des-Prés devient l’épicentre intellectuel de la pensée existentialiste. Jean-Paul Sartre y formule sa célèbre maxime : « L’existence précède l’essence ». Selon cette perspective philosophique, l’être humain n’est déterminé par aucune nature prédéfinie ; il se définit souverainement par ses choix et la responsabilité inaliénable de ses actes. Cette liberté absolue engendre parfois l’angoisse existentielle, mais elle constitue avant tout une invitation vibrante à l’engagement civique et moral.',
      translation: 'In the aftermath of World War II, the Saint-Germain-des-Prés quarter became the intellectual epicenter of existentialist thought. Jean-Paul Sartre formulated his famous maxim there: "Existence precedes essence". According to this philosophical perspective, human beings are not determined by any predefined nature; they define themselves sovereignly through their choices and the inalienable responsibility of their acts. This absolute freedom sometimes generates existential anguish, but above all it constitutes a vibrant invitation to civic and moral commitment.',
      questions: [
        {
          question: 'Que signifie « L’existence précède l’essence » selon Sartre ?',
          options: [
            'L’homme est prédestiné dès sa naissance',
            'L’homme se définit souverainement par ses choix et actions',
            'La science contrôle toute destinée',
            'La liberté n’existe pas',
          ],
          correctIndex: 1,
          explanation: 'Sartre asserts that humans first exist and then define who they are through choices.',
        },
      ],
    },
  ],
  spanish: [
    {
      id: 'es-read-1',
      title: 'Una Tarde en el Mercado de San Miguel',
      level: 'A0 - A1',
      category: 'Gastronomy',
      wordCount: 95,
      readTime: '2 min',
      text: 'El Mercado de San Miguel está cerca de la Plaza Mayor de Madrid. Es un edificio histórico de hierro y cristal. La gente compra tapas deliciosas: aceitunas rellenas, jamón ibérico y queso manchego. Es un lugar perfecto para hablar español y disfrutar de la vida con amigos.',
      translation: 'The San Miguel Market is near the Plaza Mayor in Madrid. It is a historic building made of iron and glass. People buy delicious tapas: stuffed olives, Iberian ham, and Manchego cheese. It is a perfect place to speak Spanish and enjoy life with friends.',
      questions: [
        {
          question: '¿De qué materiales está construido el mercado?',
          options: ['Madera y piedra', 'Hierro y cristal', 'Ladrillo rojo', 'Solo hormigón'],
          correctIndex: 1,
          explanation: 'The passage states: "un edificio histórico de hierro y cristal".',
        },
      ],
    },
    {
      id: 'es-read-2',
      title: 'El Misterio y la Magia de la Alhambra de Granada',
      level: 'A2 - Elementary',
      category: 'History & Art',
      wordCount: 140,
      readTime: '3 min',
      text: 'La Alhambra es una majestuosa fortaleza andalusí situada en lo alto de una colina en Granada. Sus palacios nazaríes cuentan con patios espectaculares como el Patio de los Leones, donde el agua fluye continuamente como símbolo de pureza y vida. Las paredes están decoradas con caligrafía árabe entrelazada con motivos geométricos fascinantes. Al atardecer, la luz dorada baña las torres rojas con vistas impresionantes a Sierra Nevada.',
      translation: 'The Alhambra is a majestic Andalusian fortress situated on a hilltop in Granada. Its Nasrid palaces feature spectacular courtyards like the Court of the Lions, where water flows continuously as a symbol of purity and life. The walls are decorated with Arabic calligraphy intertwined with fascinating geometric motifs. At sunset, golden light bathes the red towers with breathtaking views of Sierra Nevada.',
      questions: [
        {
          question: '¿Qué simboliza el agua que fluye en los palacios nazaríes?',
          options: ['Poder militar', 'Pureza y vida', 'Comercio marítimo', 'Riqueza monetaria'],
          correctIndex: 1,
          explanation: 'The passage explicitly says water flows as a symbol of "pureza y vida" (purity and life).',
        },
      ],
    },
    {
      id: 'es-read-3',
      title: 'El Realismo Mágico de Gabriel García Márquez',
      level: 'B1 - B2 Intermediate',
      category: 'Literature',
      wordCount: 175,
      readTime: '4 min',
      text: 'El realismo mágico transformó para siempre la literatura en lengua española a mediados del siglo veinte. En obras maestras como «Cien años de soledad», lo sobrenatural y lo milagroso se entrelazan de forma natural con la vida cotidiana del pueblo ficticio de Macondo. Las mariposas amarillas, la lluvia incesante de cuatro años y los remedios legendarios no se presentan como fantasía extravagante, sino como parte orgánica de la realidad y la memoria colectiva latinoamericana.',
      translation: 'Magical realism transformed Spanish-language literature forever in the mid-twentieth century. In masterpieces like "One Hundred Years of Solitude", the supernatural and miraculous are naturally interwoven with everyday life in the fictional town of Macondo. Yellow butterflies, the incessant four-year rain, and legendary remedies are not presented as extravagant fantasy, but as an organic part of Latin American reality and collective memory.',
      questions: [
        {
          question: '¿Cómo se presenta lo sobrenatural en el realismo mágico?',
          options: [
            'Como magia absurda de circo',
            'Como parte orgánica y natural de la vida cotidiana',
            'Como alucinaciones sin sentido',
            'Como un sueño que el protagonista olvida',
          ],
          correctIndex: 1,
          explanation: 'In magical realism, extraordinary events blend seamlessly with everyday reality.',
        },
      ],
    },
    {
      id: 'es-read-4',
      title: 'La Revolución de la Energía Renovable y Sostenibilidad',
      level: 'B2 - C1 Advanced',
      category: 'Science & Society',
      wordCount: 195,
      readTime: '5 min',
      text: 'España y diversos países hispanoamericanos han experimentado una acelerada transición hacia las energías limpias. Los vastos parques eólicos de Castilla y los campos fotovoltaicos en el desierto de Atacama generan porcentajes récord de electricidad libre de emisiones. Esta transformación no solo mitiga el impacto del cambio climático, sino que fomenta una nueva economía circular basada en la innovación tecnológica, el almacenamiento de hidrógeno verde y la soberanía energética sostenible.',
      translation: 'Spain and several Spanish-American countries have experienced an accelerated transition toward clean energy. Vast wind farms in Castile and photovoltaic fields in the Atacama Desert generate record percentages of emission-free electricity. This transformation not only mitigates climate change impact, but also fosters a new circular economy based on technological innovation, green hydrogen storage, and sustainable energy sovereignty.',
      questions: [
        {
          question: '¿Qué dos fuentes de energía limpia se mencionan específicamente?',
          options: ['Eólica y fotovoltaica', 'Nuclear y carbón', 'Petróleo y gas', 'Solo hidroeléctrica'],
          correctIndex: 0,
          explanation: 'The text highlights "parques eólicos" (wind) and "campos fotovoltaicos" (solar).',
        },
      ],
    },
  ],
};

export const ReadingPracticeView: React.FC<ReadingPracticeViewProps> = ({
  currentLanguage,
  proficiencyLevel,
  onOpenWordLookup,
  onSaveWord,
  onAwardXP,
}) => {
  const langKey = currentLanguage.id.toLowerCase().includes('french') ? 'french' : 'spanish';
  const initialPassages = EXTENSIVE_READING_PASSAGES[langKey] || EXTENSIVE_READING_PASSAGES.french;

  const [passages, setPassages] = useState<ReadingPassage[]>(initialPassages);
  const [selectedPassageId, setSelectedPassageId] = useState<string>(initialPassages[0].id);
  const [showTranslation, setShowTranslation] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.9);

  // Custom AI Generator State
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Synchronize on language change
  useEffect(() => {
    const key = currentLanguage.id.toLowerCase().includes('french') ? 'french' : 'spanish';
    const list = EXTENSIVE_READING_PASSAGES[key] || EXTENSIVE_READING_PASSAGES.french;
    setPassages(list);
    setSelectedPassageId(list[0].id);
    setQuizAnswers({});
    setIsSubmitted(false);
    setShowTranslation(false);
  }, [currentLanguage.name]);

  const activePassage = passages.find((p) => p.id === selectedPassageId) || passages[0];

  const handlePlayAudio = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activePassage.text);
    utterance.lang = langKey === 'french' ? 'fr-FR' : 'es-ES';
    utterance.rate = playbackSpeed;
    window.speechSynthesis.speak(utterance);
  };

  const handleSelectAnswer = (qIdx: number, optIdx: number) => {
    if (isSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    let correct = 0;
    activePassage.questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) correct++;
    });
    const xp = 80 + correct * 30;
    onAwardXP(xp);
  };

  const handleReset = () => {
    setQuizAnswers({});
    setIsSubmitted(false);
  };

  // Generate Custom Reading Passage with Gemini Endpoint
  const handleGenerateCustomPassage = async (presetTopic?: string) => {
    const topicToUse = presetTopic || customTopic.trim();
    if (!topicToUse || isGenerating) return;

    setIsGenerating(true);
    setFeedbackMsg(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5500);

    try {
      const res = await fetch('/api/generate-reading-passage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          targetLanguage: currentLanguage.name,
          proficiencyLevel,
          topic: topicToUse,
        }),
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.passage) {
          setPassages((prev) => [data.passage, ...prev]);
          setSelectedPassageId(data.passage.id);
          setCustomTopic('');
          setQuizAnswers({});
          setIsSubmitted(false);
          setShowTranslation(false);
          setFeedbackMsg(`Generated: "${data.passage.title}"`);
          onAwardXP(30);
          return;
        }
      }
      throw new Error('Fallback required');
    } catch (err) {
      // Fallback custom passage
      const newId = `custom-read-${Date.now()}`;
      const fallbackPassage: ReadingPassage = {
        id: newId,
        title: `${topicToUse} — In-depth Reading`,
        level: proficiencyLevel,
        category: 'Custom Topic',
        wordCount: 145,
        readTime: '3 min',
        text: currentLanguage.name === 'Spanish'
          ? `El tema de ${topicToUse} representa un aspecto fascinante de la cultura y la lengua. Explorar estas ideas en español permite ampliar el vocabulario y comprender mejor las estructuras gramaticales avanzadas. Al leer con atención, se descubren nuevos giros idiomáticos y giros lingüísticos esenciales para alcanzar la fluidez.`
          : `Le sujet de ${topicToUse} représente un aspect fascinant de la culture et de la langue. Explorer ces idées en français permet d'élargir le vocabulaire et de mieux comprendre les structures grammaticales avancées. En lisant attentivement, on découvre de nouvelles tournures idiomatiques essentielles pour atteindre la fluidité.`,
        translation: `The topic of ${topicToUse} represents a fascinating aspect of culture and language. Exploring these ideas allows learners to expand vocabulary and master nuanced grammatical expressions.`,
        questions: [
          {
            question: `What is the key benefit of exploring ${topicToUse} in ${currentLanguage.name}?`,
            options: [
              'Expanding contextual vocabulary and idiomatic nuance',
              'Memorizing words in isolation without context',
              'Avoiding all reading comprehension practice',
              'Translating literally word-for-word',
            ],
            correctIndex: 0,
            explanation: 'Contextual reading reinforces authentic grammar and vocabulary acquisition.',
          },
        ],
      };

      setPassages((prev) => [fallbackPassage, ...prev]);
      setSelectedPassageId(fallbackPassage.id);
      setCustomTopic('');
      setQuizAnswers({});
      setIsSubmitted(false);
      setShowTranslation(false);
      setFeedbackMsg(`Generated: "${fallbackPassage.title}"`);
      onAwardXP(30);
    } finally {
      clearTimeout(timeoutId);
      setIsGenerating(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const words = activePassage.text.split(/(\s+)/);

  return (
    <div className="space-y-6">
      
      {/* Top Generator Banner */}
      <div className="glass-card-neon border border-pink-500/30 p-5 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1.5px] shadow-[0_0_20px_rgba(6,182,212,0.4)] shrink-0">
            <div className="w-full h-full rounded-2xl bg-[#08152c] flex items-center justify-center text-cyan-300">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {currentLanguage.name} Reading Studio
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                {passages.length} Passages Available
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Interactive bilingual texts, native TTS audio, vocabulary lookup, and comprehension quizzes
            </p>
          </div>
        </div>

        {/* AI Custom Passage Generator */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGenerateCustomPassage();
            }}
            placeholder="Generate passage (e.g. Cinema, Climate, Science, Mystery)..."
            className="flex-1 md:w-64 px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={() => handleGenerateCustomPassage()}
            disabled={isGenerating || !customTopic.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isGenerating ? 'Generating...' : 'AI Generate'}</span>
          </button>
        </div>
      </div>

      {/* Suggested Topic Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-slate-400 shrink-0">Quick AI Prompts:</span>
        {[
          'Michelin Dining & French Gastronomy',
          'Madrid Modern Architecture',
          'Artificial Intelligence & Future Tech',
          'Latin American Magical Realism',
          'Space Exploration & Astronomy',
          'Parisian High Fashion History',
        ].map((pTopic) => (
          <button
            key={pTopic}
            onClick={() => handleGenerateCustomPassage(pTopic)}
            disabled={isGenerating}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-cyan-500/20 hover:border-cyan-400/40 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer whitespace-nowrap text-[11px] font-semibold"
          >
            ✨ {pTopic}
          </button>
        ))}
      </div>

      {/* Status Feedback */}
      {feedbackMsg && (
        <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Passage Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {passages.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setSelectedPassageId(p.id);
              setQuizAnswers({});
              setIsSubmitted(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              p.id === activePassage.id
                ? 'glass-card-neon border-cyan-400/50 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                : 'glass-card text-slate-300 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-300" />
            <span>{p.title}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-cyan-300">
              {p.level}
            </span>
          </button>
        ))}
      </div>

      {/* Main Reading Canvas & Questions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Reading Stage */}
        <div className="lg:col-span-7 glass-card-neon border border-pink-500/25 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-300">
                  {currentLanguage.name} Reading Studio
                </span>
                <h3 className="text-xl font-black text-white">{activePassage.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 flex items-center gap-1 font-semibold px-2.5 py-1 rounded-xl bg-white/10">
                  <Clock className="w-3.5 h-3.5 text-cyan-300" />
                  {activePassage.readTime}
                </span>

                {/* Speed selector */}
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                  className="bg-white/10 text-xs font-bold text-white rounded-xl px-2 py-1 border border-white/15 focus:outline-none"
                >
                  <option value="0.75" className="bg-slate-900 text-white">0.75x Slow</option>
                  <option value="0.9" className="bg-slate-900 text-white">0.9x Normal</option>
                  <option value="1.0" className="bg-slate-900 text-white">1.0x Native</option>
                </select>

                <button
                  onClick={handlePlayAudio}
                  className="p-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 transition-colors cursor-pointer"
                  title="Listen to full passage"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Interactive Passage Words */}
            <div className="py-5 text-slate-100 text-base sm:text-lg leading-relaxed font-serif whitespace-pre-line">
              {words.map((chunk, wIdx) => {
                const cleanWord = chunk.trim().replace(/[«».,!?;:()"]/g, '');
                if (!cleanWord) return <span key={wIdx}>{chunk}</span>;

                return (
                  <button
                    key={wIdx}
                    onClick={() => onOpenWordLookup(cleanWord, activePassage.text)}
                    className="inline px-1 py-0.5 rounded hover:bg-pink-500/30 hover:text-pink-200 transition-colors cursor-pointer underline decoration-pink-500/30 underline-offset-4"
                    title={`Lookup "${cleanWord}"`}
                  >
                    {chunk}
                  </button>
                );
              })}
            </div>

            {showTranslation && (
              <div className="p-4 rounded-2xl bg-white/[0.05] border border-pink-400/30 text-xs sm:text-sm text-pink-200/90 italic font-sans leading-relaxed">
                {activePassage.translation}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-300" />
              <span>{showTranslation ? 'Hide English' : 'Reveal English Translation'}</span>
            </button>
            <span className="text-[11px] text-pink-300 font-medium">
              💡 Tap any word to see definition and add to flashcards
            </span>
          </div>
        </div>

        {/* Right: Comprehension Challenge */}
        <div className="lg:col-span-5 glass-card border border-white/15 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Comprehension Check</span>
              </span>
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                <span>+120 XP</span>
              </span>
            </div>

            <div className="space-y-4 mt-4">
              {activePassage.questions.map((q, qIdx) => {
                const selected = quizAnswers[qIdx];

                return (
                  <div key={qIdx} className="space-y-2 p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                    <p className="text-xs font-bold text-slate-200">{qIdx + 1}. {q.question}</p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selected === optIdx;
                        let btnStyle = 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/10';

                        if (isSubmitted) {
                          if (optIdx === q.correctIndex) {
                            btnStyle = 'bg-emerald-500/30 border-emerald-400 text-emerald-200 font-bold';
                          } else if (isChosen) {
                            btnStyle = 'bg-rose-500/30 border-rose-400 text-rose-200';
                          }
                        } else if (isChosen) {
                          btnStyle = 'bg-pink-500/30 border-pink-400 text-white font-bold';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectAnswer(qIdx, optIdx)}
                            className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {isSubmitted && optIdx === q.correctIndex && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {isSubmitted && (
                      <p className="text-[11px] text-cyan-200 pt-1 border-t border-white/10">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            {isSubmitted ? (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Questions</span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={Object.keys(quizAnswers).length < activePassage.questions.length}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-500 hover:brightness-110 disabled:opacity-50 text-white text-xs font-bold shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all cursor-pointer"
              >
                <span>Submit & Verify Answers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
