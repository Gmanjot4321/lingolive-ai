import { CEFRStory } from '../types';

export const CEFR_STORIES: CEFRStory[] = [
  // --- FRENCH STORIES (Across CEFR Levels) ---
  {
    id: 'fr-a0-premier-cafe',
    title: 'Le Premier Café à Paris',
    englishTitle: 'The First Coffee in Paris',
    cefrLevel: 'A0 - Absolute Beginner (Zero Knowledge)',
    language: 'French',
    category: 'Everyday Life',
    summary: 'A simple, gentle morning in Saint-Germain. Learn essential greetings, ordering coffee, and polite courtesies.',
    coverEmoji: '☕',
    durationMinutes: 3,
    xpReward: 120,
    paragraphs: [
      {
        id: 'p1',
        targetText: 'Bonjour ! C’est le matin à Paris. Le soleil brille.',
        englishText: 'Hello! It is morning in Paris. The sun is shining.',
        keyWords: [
          { word: 'Bonjour', translation: 'Hello / Good morning', phonetic: 'boh-zhoor' },
          { word: 'le matin', translation: 'the morning', phonetic: 'luh mah-tah' },
          { word: 'Le soleil brille', translation: 'The sun shines', phonetic: 'luh soh-lay bree' },
        ],
      },
      {
        id: 'p2',
        targetText: 'Lucas entre dans un joli café près de la Seine.',
        englishText: 'Lucas walks into a pretty café near the Seine.',
        keyWords: [
          { word: 'entre', translation: 'enters / goes into', phonetic: 'ahntr' },
          { word: 'joli café', translation: 'pretty café', phonetic: 'zho-lee kah-fay' },
          { word: 'près de', translation: 'near to', phonetic: 'preh duh' },
        ],
      },
      {
        id: 'p3',
        targetText: 'Le serveur sourit et dit : « Bonjour monsieur ! Une table pour une personne ? »',
        englishText: 'The waiter smiles and says: "Hello sir! A table for one person?"',
        keyWords: [
          { word: 'Le serveur', translation: 'The waiter', phonetic: 'luh sair-vuhr' },
          { word: 'sourit', translation: 'smiles', phonetic: 'soo-ree' },
          { word: 'une personne', translation: 'one person', phonetic: 'ewn pair-sohn' },
        ],
      },
      {
        id: 'p4',
        targetText: '« Oui, s’il vous plaît. Un café au lait et un croissant chaud, s’il vous plaît. »',
        englishText: '"Yes, please. A coffee with milk and a warm croissant, please."',
        keyWords: [
          { word: 's’il vous plaît', translation: 'please', phonetic: 'seel voo pleh' },
          { word: 'café au lait', translation: 'coffee with milk', phonetic: 'kah-fay oh leh' },
          { word: 'croissant chaud', translation: 'warm croissant', phonetic: 'krwah-sahn shoh' },
        ],
      },
      {
        id: 'p5',
        targetText: '« Très bien ! Voilà votre café. Bonne journée ! » Lucas répond : « Merci beaucoup ! »',
        englishText: '"Very well! Here is your coffee. Have a nice day!" Lucas replies: "Thank you very much!"',
        keyWords: [
          { word: 'Voilà', translation: 'Here is / Here you go', phonetic: 'vwah-lah' },
          { word: 'Bonne journée', translation: 'Have a nice day', phonetic: 'buhn zhoor-nay' },
          { word: 'Merci beaucoup', translation: 'Thank you very much', phonetic: 'mair-see boh-koo' },
        ],
      },
    ],
    comprehensionQuiz: [
      {
        question: 'Où se passe l’histoire ? (Where does the story take place?)',
        options: ['Dans un café à Paris', 'À la gare de Lyon', 'Dans un musée', 'À la bibliothèque'],
        correctIndex: 0,
        explanation: 'The story takes place in a pretty café near the Seine in Paris (dans un joli café près de la Seine).',
      },
      {
        question: 'Que commande Lucas ? (What does Lucas order?)',
        options: ['Un thé vert et un biscuit', 'Un café au lait et un croissant chaud', 'Une pizza et de l’eau', 'Un jus d’orange'],
        correctIndex: 1,
        explanation: 'Lucas explicitly asks for "Un café au lait et un croissant chaud, s’il vous plaît."',
      },
      {
        question: 'Comment dit-on "Thank you very much" en français ?',
        options: ['Au revoir', 'S’il vous plaît', 'Merci beaucoup', 'Bonne nuit'],
        correctIndex: 2,
        explanation: '"Merci beaucoup" translates directly to "Thank you very much".',
      },
    ],
  },
  {
    id: 'fr-a1-boulangerie-secret',
    title: 'La Boulangerie de Madame Dupont',
    englishTitle: 'Madame Dupont’s Bakery',
    cefrLevel: 'A1 - Beginner',
    language: 'French',
    category: 'Everyday Life',
    summary: 'Discover the aromas of fresh baguettes, pain au chocolat, and friendly neighborhood conversations in Montmartre.',
    coverEmoji: '🥖',
    durationMinutes: 4,
    xpReward: 140,
    paragraphs: [
      {
        id: 'p1',
        targetText: 'Chaque matin à sept heures, Madame Dupont ouvre sa petite boulangerie à Montmartre.',
        englishText: 'Every morning at seven o’clock, Madame Dupont opens her small bakery in Montmartre.',
        keyWords: [
          { word: 'Chaque matin', translation: 'Every morning', phonetic: 'shahk mah-tah' },
          { word: 'ouvre', translation: 'opens', phonetic: 'oovr' },
          { word: 'boulangerie', translation: 'bakery', phonetic: 'boo-lahn-zhree' },
        ],
      },
      {
        id: 'p2',
        targetText: 'L’odeur du pain frais et du beurre doré attire les voisins de la rue.',
        englishText: 'The scent of fresh bread and golden butter attracts the neighbors of the street.',
        keyWords: [
          { word: 'L’odeur', translation: 'The smell / scent', phonetic: 'loh-duhr' },
          { word: 'pain frais', translation: 'fresh bread', phonetic: 'pah freh' },
          { word: 'les voisins', translation: 'the neighbors', phonetic: 'lay vwah-zah' },
        ],
      },
      {
        id: 'p3',
        targetText: 'Aujourd’hui, Sophie veut acheter une baguette tradition bien cuite et deux pains au chocolat pour ses enfants.',
        englishText: 'Today, Sophie wants to buy a well-baked traditional baguette and two pains au chocolat for her children.',
        keyWords: [
          { word: 'veut acheter', translation: 'wants to buy', phonetic: 'vuh ahsh-tay' },
          { word: 'bien cuite', translation: 'well-baked / crispy', phonetic: 'byah kweet' },
          { word: 'ses enfants', translation: 'her children', phonetic: 'sayz ahn-fahn' },
        ],
      },
      {
        id: 'p4',
        targetText: '« Ça fera quatre euros cinquante », dit Madame Dupont en souriant.',
        englishText: '"That will be four euros fifty," says Madame Dupont with a smile.',
        keyWords: [
          { word: 'Ça fera', translation: 'That will be (cost)', phonetic: 'sah fuh-rah' },
          { word: 'quatre euros', translation: 'four euros', phonetic: 'katr uh-roh' },
          { word: 'en souriant', translation: 'smiling', phonetic: 'ahn soo-ryahn' },
        ],
      },
    ],
    comprehensionQuiz: [
      {
        question: 'À quelle heure Madame Dupont ouvre-t-elle la boulangerie ?',
        options: ['À six heures', 'À sept heures', 'À huit heures', 'À midi'],
        correctIndex: 1,
        explanation: 'She opens her bakery at seven o’clock ("à sept heures").',
      },
      {
        question: 'Combien coûte la commande de Sophie ?',
        options: ['Deux euros', 'Trois euros cinquante', 'Quatre euros cinquante', 'Cinq euros'],
        correctIndex: 2,
        explanation: 'Madame Dupont states: "Ça fera quatre euros cinquante."',
      },
    ],
  },
  {
    id: 'fr-a2-chat-musee-orsay',
    title: 'Le Mystère du Chat du Musée d’Orsay',
    englishTitle: 'The Mystery of the Musée d’Orsay Cat',
    cefrLevel: 'A2 - Elementary',
    language: 'French',
    category: 'Mystery',
    summary: 'A curious ginger cat sneaks into the grand halls of the Musée d’Orsay every evening right before closing time.',
    coverEmoji: '🐈',
    durationMinutes: 5,
    xpReward: 160,
    paragraphs: [
      {
        id: 'p1',
        targetText: 'Au coucher du soleil, quand les derniers visiteurs quittent le musée d’Orsay, un étrange phénomène se produit.',
        englishText: 'At sunset, when the last visitors leave the Orsay Museum, a strange phenomenon occurs.',
        keyWords: [
          { word: 'Au coucher du soleil', translation: 'At sunset', phonetic: 'oh koo-shay dew soh-lay' },
          { word: 'derniers visiteurs', translation: 'last visitors', phonetic: 'dair-nyay vee-zee-tuhr' },
          { word: 'se produit', translation: 'happens / occurs', phonetic: 'suh proh-dwee' },
        ],
      },
      {
        id: 'p2',
        targetText: 'Gaston, le gardien de nuit, entend un petit miaulement sous la grande horloge en métal doré.',
        englishText: 'Gaston, the night watchman, hears a little meow beneath the great golden metal clock.',
        keyWords: [
          { word: 'gardien de nuit', translation: 'night watchman', phonetic: 'gar-dyah duh nwee' },
          { word: 'miaulement', translation: 'meowing', phonetic: 'myow-le-mahn' },
          { word: 'grande horloge', translation: 'large clock', phonetic: 'grahnd or-lozh' },
        ],
      },
      {
        id: 'p3',
        targetText: 'C’est un chat roux avec des yeux verts comme des émeraudes. Il marche fièrement devant les toiles de Monet et de Van Gogh.',
        englishText: 'It is a ginger cat with green eyes like emeralds. He walks proudly in front of the paintings of Monet and Van Gogh.',
        keyWords: [
          { word: 'chat roux', translation: 'ginger / red cat', phonetic: 'shah roo' },
          { word: 'les toiles', translation: 'the canvases / paintings', phonetic: 'lay twahl' },
          { word: 'fièrement', translation: 'proudly', phonetic: 'fyair-mahn' },
        ],
      },
      {
        id: 'p4',
        targetText: 'Le chat s’arrête toujours devant le tableau "La Nuit Étoilée". Gaston lui donne un morceau de sardine, et le chat ronronne doucement.',
        englishText: 'The cat always stops in front of the painting "Starry Night". Gaston gives him a piece of sardine, and the cat purrs softly.',
        keyWords: [
          { word: 's’arrête', translation: 'stops', phonetic: 'sah-reht' },
          { word: 'un morceau', translation: 'a piece', phonetic: 'uhn mor-soh' },
          { word: 'ronronne', translation: 'purrs', phonetic: 'rohn-rohn' },
        ],
      },
    ],
    comprehensionQuiz: [
      {
        question: 'Qui est Gaston ?',
        options: ['Un peintre impressionniste', 'Le gardien de nuit du musée', 'Un touriste perdu', 'Le directeur du musée'],
        correctIndex: 1,
        explanation: 'Gaston is introduced as "le gardien de nuit" (the night watchman).',
      },
      {
        question: 'Devant quel chef-d’œuvre le chat s’arrête-t-il toujours ?',
        options: ['La Joconde', 'La Nuit Étoilée', 'Le Penseur', 'Les Nymphéas'],
        correctIndex: 1,
        explanation: 'The text says: "Le chat s’arrête toujours devant le tableau La Nuit Étoilée."',
      },
    ],
  },
  {
    id: 'fr-b1-train-de-nuit',
    title: 'Le Train de Nuit pour la Côte d’Azur',
    englishTitle: 'The Night Train to the French Riviera',
    cefrLevel: 'B1 - Intermediate',
    language: 'French',
    category: 'Adventure',
    summary: 'Climb aboard the sleeper train leaving Paris-Austerlitz at midnight. Conversations, memories, and waking up to the Mediterranean sea.',
    coverEmoji: '🚆',
    durationMinutes: 6,
    xpReward: 200,
    paragraphs: [
      {
        id: 'p1',
        targetText: 'Il est vingt-deux heures quarante-cinq à la gare de Paris-Austerlitz. Les rails brillent sous les lampadaires d’acier alors que le train de nuit s’ébranle doucement.',
        englishText: 'It is 10:45 PM at Paris-Austerlitz station. The tracks glisten under steel streetlamps as the night train slowly begins to roll.',
        keyWords: [
          { word: 's’ébranle', translation: 'sets in motion / starts rolling', phonetic: 'say-brahnl' },
          { word: 'lampadaires d’acier', translation: 'steel lampposts', phonetic: 'lahm-pah-dair dah-syay' },
        ],
      },
      {
        id: 'p2',
        targetText: 'Dans la couchette numéro quatorze, Camille s’installe avec un carnet de croquis et une tasse de tisane tiède.',
        englishText: 'In sleeper berth number fourteen, Camille settles in with a sketchbook and a cup of warm herbal tea.',
        keyWords: [
          { word: 'couchette', translation: 'sleeper berth / bunk', phonetic: 'koo-sheht' },
          { word: 'carnet de croquis', translation: 'sketchbook', phonetic: 'kar-neh duh kroh-kee' },
        ],
      },
      {
        id: 'p3',
        targetText: 'Son compagnon de compartiment, un vieil horloger de Grasse nommé Henri, lui raconte comment sa famille distille la lavande et le jasmin depuis quatre générations.',
        englishText: 'Her compartment companion, an elderly watchmaker from Grasse named Henri, tells her how his family has distilled lavender and jasmine for four generations.',
        keyWords: [
          { word: 'distille', translation: 'distills', phonetic: 'dees-teel' },
          { word: 'quatre générations', translation: 'four generations', phonetic: 'katr zhay-nay-rah-syohn' },
        ],
      },
      {
        id: 'p4',
        targetText: 'Au petit matin, Camille tire le rideau : la brume parisienne a disparu, remplacée par l’immensité turquoise de la Méditerranée et le parfum des pins maritimes.',
        englishText: 'In the early morning, Camille draws back the curtain: the Parisian mist has vanished, replaced by the turquoise expanse of the Mediterranean and the scent of maritime pines.',
        keyWords: [
          { word: 'tire le rideau', translation: 'draws the curtain', phonetic: 'teer luh ree-doh' },
          { word: 'l’immensité turquoise', translation: 'turquoise expanse', phonetic: 'leem-mahn-see-tay toor-kwahz' },
        ],
      },
    ],
    comprehensionQuiz: [
      {
        question: 'D’où part le train de nuit ?',
        options: ['Gare du Nord', 'Gare de Lyon', 'Gare de Paris-Austerlitz', 'Gare Montparnasse'],
        correctIndex: 2,
        explanation: 'The train departs from "la gare de Paris-Austerlitz".',
      },
      {
        question: 'Que voit Camille au réveil lorsqu’elle tire le rideau ?',
        options: ['La pluie et la tour Eiffel', 'La Méditerranée et les pins maritimes', 'Des montagnes enneigées', 'Un champ de blé'],
        correctIndex: 1,
        explanation: 'Camille is greeted by the turquoise Mediterranean and maritime pines.',
      },
    ],
  },
  {
    id: 'fr-b2-enigme-libraire',
    title: 'L’Énigme du Vieux Libraire des Berges de Seine',
    englishTitle: 'The Riddle of the Old Seine Bookseller',
    cefrLevel: 'B2 - Upper Intermediate',
    language: 'French',
    category: 'Culture',
    summary: 'An intricate tale of historical Parisian bouquinistes, lost manuscripts from the Enlightenment, and linguistic deduction.',
    coverEmoji: '📜',
    durationMinutes: 7,
    xpReward: 250,
    paragraphs: [
      {
        id: 'p1',
        targetText: 'Le long du quai de Conti, les boîtes vertes des bouquinistes sont ouvertes face à l’Institut de France. Parmi elles, celle de Maître Barnabé recèle des trésors que seuls les yeux avertis savent déceler.',
        englishText: 'Along the Quai de Conti, the green boxes of the booksellers stand open facing the Institut de France. Among them, that of Master Barnabé conceals treasures that only discerning eyes know how to detect.',
      },
      {
        id: 'p2',
        targetText: 'Hier après-midi, en feuilletant une édition originale des Pensées de Pascal, une chercheuse en linguistique a découvert une annotation marginale rédigée en vers chiffrés.',
        englishText: 'Yesterday afternoon, while leafing through a first edition of Pascal’s Pensées, a linguistics researcher discovered a marginal annotation written in ciphered verse.',
      },
      {
        id: 'p3',
        targetText: '« Voyez-vous, ma chère enfant », murmura Barnabé en rajustant son lorgnon, « les mots ne sont pas de simples véhicules de sens ; ils constituent les archives vivantes de notre mémoire collective. »',
        englishText: '"You see, my dear child," whispered Barnabé, adjusting his spectacles, "words are not mere vehicles of meaning; they constitute the living archives of our collective memory."',
      },
    ],
    comprehensionQuiz: [
      {
        question: 'Où se situe la boutique de Maître Barnabé ?',
        options: ['Dans un centre commercial moderne', 'Sur les quais de Seine près de l’Institut de France', 'À l’aéroport Charles de Gaulle', 'Dans le quartier de La Défense'],
        correctIndex: 1,
        explanation: 'Barnabé is an authentic bouquiniste with a green box along the Quai de Conti near the Institut de France.',
      },
      {
        question: 'D’après Maître Barnabé, que représentent véritablement les mots ?',
        options: ['Des outils purement techniques', 'Des codes secrets mathématiques', 'Les archives vivantes de notre mémoire collective', 'Des symboles sans importance'],
        correctIndex: 2,
        explanation: 'Barnabé remarks that words "constituent les archives vivantes de notre mémoire collective".',
      },
    ],
  },

  // --- SPANISH STORIES ---
  {
    id: 'es-a0-paseo-plaza',
    title: 'Un Paseo por la Plaza Mayor',
    englishTitle: 'A Walk through the Plaza Mayor',
    cefrLevel: 'A0 - Absolute Beginner (Zero Knowledge)',
    language: 'Spanish',
    category: 'Everyday Life',
    summary: 'A sunny afternoon in central Madrid. Practice basic Spanish greetings, churros con chocolate, and asking for directions.',
    coverEmoji: '☀️',
    durationMinutes: 3,
    xpReward: 120,
    paragraphs: [
      {
        id: 'p1',
        targetText: '¡Hola! Es una tarde hermosa y soleada en Madrid.',
        englishText: 'Hello! It is a beautiful and sunny afternoon in Madrid.',
        keyWords: [
          { word: '¡Hola!', translation: 'Hello!', phonetic: 'OH-lah' },
          { word: 'tarde hermosa', translation: 'beautiful afternoon', phonetic: 'TAR-deh air-MOH-sah' },
        ],
      },
      {
        id: 'p2',
        targetText: 'Elena camina hacia la famosa Plaza Mayor con una amiga.',
        englishText: 'Elena walks toward the famous Plaza Mayor with a friend.',
        keyWords: [
          { word: 'camina', translation: 'walks', phonetic: 'kah-MEE-nah' },
          { word: 'amiga', translation: 'female friend', phonetic: 'ah-MEE-gah' },
        ],
      },
      {
        id: 'p3',
        targetText: 'En la terraza piden: «Dos chocolates calientes y seis churros crujientes, por favor.»',
        englishText: 'On the terrace they order: "Two hot chocolates and six crispy churros, please."',
        keyWords: [
          { word: 'por favor', translation: 'please', phonetic: 'por fah-VOR' },
          { word: 'churros crujientes', translation: 'crispy churros', phonetic: 'CHOO-rros kroo-HYEHN-tehs' },
        ],
      },
    ],
    comprehensionQuiz: [
      {
        question: '¿En qué ciudad tiene lugar la historia?',
        options: ['Barcelona', 'Madrid', 'Sevilla', 'Valencia'],
        correctIndex: 1,
        explanation: 'The story takes place in Madrid at the famous Plaza Mayor.',
      },
      {
        question: '¿Qué piden Elena y su amiga?',
        options: ['Paella y vino', 'Dos chocolates y seis churros', 'Café solo y ensalada', 'Tapas de jamón'],
        correctIndex: 1,
        explanation: 'They order "Dos chocolates calientes y seis churros crujientes".',
      },
    ],
  },
];
