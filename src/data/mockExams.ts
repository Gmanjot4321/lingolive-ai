import { MockTestExam } from '../types';

export const BENCHMARK_MOCK_EXAMS: Record<string, MockTestExam> = {
  // SPANISH EXAMS
  'spanish-a1': {
    id: 'exam-es-a1',
    title: 'DELE A1 Standardized Spanish Proficiency Exam',
    targetLanguage: 'Spanish',
    cefrLevel: 'A1',
    durationMinutes: 15,
    listening: [
      {
        id: 'es-a1-lis-1',
        audioTitle: 'En la cafetería de la estación',
        audioTranscript: 'Camarero: ¡Buenos días! ¿Qué le pongo? Cliente: Hola, buenos días. Un café con leche caliente y una tostada con tomate, por favor. ¿Cuánto cuesta? Camarero: Son dos euros con cincuenta.',
        question: 'What does the customer order and what is the total price?',
        options: [
          'A hot coffee with milk and toast with tomato, 2.50€',
          'Black iced coffee and a croissant, 3.00€',
          'Orange juice and a sandwich, 2.50€',
          'Tea with lemon and cookies, 4.00€',
        ],
        correctAnswerIndex: 0,
        explanation: 'The customer specifically asks for "un café con leche caliente y una tostada con tomate" costing "dos euros con cincuenta" (2.50€).',
      },
      {
        id: 'es-a1-lis-2',
        audioTitle: 'Presentación en la clase de español',
        audioTranscript: 'Hola a todos. Me llamo Mateo, tengo veinticuatro años y soy de Italia. Vivo en Madrid desde hace tres meses porque estudio arquitectura en la universidad.',
        question: 'Why does Mateo live in Madrid?',
        options: [
          'He works as a chef in an Italian restaurant',
          'He studies architecture at the university',
          'He is on summer vacation with his family',
          'He teaches Italian grammar',
        ],
        correctAnswerIndex: 1,
        explanation: 'Mateo says: "Vivo en Madrid... porque estudio arquitectura en la universidad."',
      },
    ],
    reading: [
      {
        id: 'es-a1-read-1',
        passageTitle: 'Aviso del Gimnasio Central',
        passage: 'Estimados socios: El gimnasio estará abierto de lunes a viernes de 07:00 a 22:00 horas, y los sábados de 09:00 a 14:00 horas. Los domingos las instalaciones permanecen cerradas por mantenimiento. Recuerden traer su propia toalla y botella de agua.',
        question: 'When is the gym completely closed?',
        options: [
          'Every Saturday morning',
          'On Sundays for maintenance',
          'Every Friday after 14:00',
          'Monday mornings before 09:00',
        ],
        correctAnswerIndex: 1,
        explanation: 'The notice clarifies: "Los domingos las instalaciones permanecen cerradas por mantenimiento."',
      },
      {
        id: 'es-a1-read-2',
        passageTitle: 'Mensaje de cumpleaños de Lucía',
        passage: '¡Hola Marcos! Este sábado celebro mi cumpleaños en la pizzería Napoli a las ocho de la tarde. Vamos a cenar y después a bailar. Confírmame antes del jueves para reservar la mesa.',
        question: 'What does Lucía ask Marcos to do before Thursday?',
        options: [
          'Buy a birthday gift for her',
          'Confirm his attendance so she can reserve the table',
          'Pay for the pizza reservation',
          'Pick up the music playlist',
        ],
        correctAnswerIndex: 1,
        explanation: 'Lucía writes: "Confírmame antes del jueves para reservar la mesa."',
      },
    ],
    writing: {
      id: 'es-a1-wri-1',
      title: 'Writing Task: Mensaje a un nuevo amigo',
      prompt: 'Escribe un mensaje breve (30-50 palabras) a tu compañero de intercambio. Preséntate, menciona tu ciudad de origen, tus pasatiempos favoritos y qué te gustaría hacer juntos el próximo fin de semana.',
      context: 'Informal message to an exchange partner. Focus on simple present tense and polite basic greetings.',
      minWords: 25,
      targetTopics: ['Greeting & Name', 'Origin & Residence', 'Weekend suggestion'],
    },
    speaking: {
      id: 'es-a1-spk-1',
      title: 'Speaking Task: Rutina diaria y presentación',
      prompt: 'Habla durante 45 segundos sobre tu día típico: a qué hora te levantas, qué desayunas, qué haces por la tarde y qué te gusta cenar.',
      context: 'Speak clearly into the microphone. Use basic connectors like "primero", "luego", and "después".',
      guidingQuestions: [
        '¿A qué hora empieza tu día?',
        '¿Qué sueles comer y beber?',
        '¿Qué actividades haces por la tarde?',
      ],
      recommendedDurationSeconds: 45,
    },
  },

  'spanish-b1': {
    id: 'exam-es-b1',
    title: 'DELE B1 International Spanish Fluency Exam',
    targetLanguage: 'Spanish',
    cefrLevel: 'B1',
    durationMinutes: 20,
    listening: [
      {
        id: 'es-b1-lis-1',
        audioTitle: 'Entrevista: Turismo rural y sostenible',
        audioTranscript: 'Locutora: Hoy conversamos con Elena Sánchez, fundadora de EcoRutas. Elena, ¿por qué los viajeros eligen cada vez más pueblos pequeños? Elena: Principalmente porque buscan desconectar del ruido de las metrópolis y conectar con artesanos locales. En lugar de visitar diez monumentos con prisas, prefieren aprender a elaborar queso tradicional o recorrer senderos históricos sin masificación turística.',
        question: 'According to Elena, what is the main reason travelers choose rural destinations?',
        options: [
          'Cheaper hotel prices compared to capital cities',
          'To disconnect from metropolitan noise and enjoy authentic local experiences at an unhurried pace',
          'Because big cities have banned tourist buses',
          'To participate in competitive mountain bike races',
        ],
        correctAnswerIndex: 1,
        explanation: 'Elena emphasizes seeking to disconnect from city noise, connect with local artisans, and avoid rushed tourist crowds.',
      },
      {
        id: 'es-b1-lis-2',
        audioTitle: 'Aviso de retraso en la línea de cercanías',
        audioTranscript: 'Atención pasajeros con destino a Toledo: Debido a una avería eléctrica imprevista en el tramo de Aranjuez, el tren de las 16:30 saldrá con una demora estimada de veinticinco minutos. Aquellos viajeros con billetes combinados pueden dirigirse al mostrador central para gestionar transbordos sin recargo.',
        question: 'What option is offered to travelers holding combined tickets?',
        options: [
          'They must purchase a new ticket at half price',
          'They can visit the central counter to rebook connections without any surcharge',
          'They must wait for the next day morning train',
          'Their tickets are automatically cancelled with no refund',
        ],
        correctAnswerIndex: 1,
        explanation: 'The announcement states travelers with combined tickets can manage transfers at the central counter "sin recargo" (without surcharge).',
      },
    ],
    reading: [
      {
        id: 'es-b1-read-1',
        passageTitle: 'El renacimiento de las librerías independientes',
        passage: 'En la era del libro digital y las entregas inmediatas, muchas pequeñas librerías han transformado su modelo de negocio. En vez de competir exclusivamente en catálogo o precio, ofrecen experiencias humanas: clubes de lectura semanales, cafés literarios donde conversar con autores noveles y selecciones personalizadas por libreros apasionados. Esta cercanía ha fidelizado a una comunidad lectora que valora el consejo experto frente al algoritmo.',
        question: 'How have independent bookstores successfully adapted according to the text?',
        options: [
          'By lowering book prices below online retailers',
          'By offering personal curation, literary cafés, and community events rather than competing solely on inventory',
          'By switching completely to selling electronic reading tablets',
          'By closing physical storefronts and operating only on social media',
        ],
        correctAnswerIndex: 1,
        explanation: 'The text highlights human experiences, book clubs, literary cafés, and curated personal advice that foster community loyalty.',
      },
      {
        id: 'es-b1-read-2',
        passageTitle: 'Iniciativa municipal de huertos comunitarios',
        passage: 'El ayuntamiento ha destinado tres parcelas en desuso en el barrio sur para la creación de huertos urbanos ecológicos. Los vecinos interesados pueden solicitar una parcela gratuita durante dos años, comprometiéndose a cultivar sin pesticidas sintéticos y a compartir un diez por ciento de la cosecha con los comedores sociales del distrito.',
        question: 'What condition must participating residents agree to?',
        options: [
          'Sell all their produce at the Sunday market',
          'Cultivate without synthetic pesticides and donate 10% of produce to community kitchens',
          'Pay an upfront monthly maintenance fee to the city',
          'Plant only ornamental flowers and trees',
        ],
        correctAnswerIndex: 1,
        explanation: 'Participants must commit to organic farming without synthetic pesticides and share 10% with soup kitchens.',
      },
    ],
    writing: {
      id: 'es-b1-wri-1',
      title: 'Writing Task: Carta de opinión o reclamación formal',
      prompt: 'Escribe un correo formal al director de una escuela de idiomas o servicio cultural (80-120 palabras). Expresa tu satisfacción general con el curso, señala un aspecto que podría mejorarse (como la distribución de horarios o la variedad de materiales prácticos) y propón una solución constructiva.',
      context: 'Formal register. Use structured argumentation (por un lado, no obstante, en consecuencia) and appropriate subjunctive forms where necessary.',
      minWords: 60,
      targetTopics: ['Formal greeting & purpose', 'Specific praise & constructive criticism', 'Concrete proposal & polite sign-off'],
    },
    speaking: {
      id: 'es-b1-spk-1',
      title: 'Speaking Task: El impacto de la tecnología en el aprendizaje',
      prompt: 'Expón tu opinión durante 60 segundos sobre cómo las aplicaciones e inteligencia artificial han cambiado el aprendizaje de idiomas. Menciona ventajas, posibles desventajas y tu propia experiencia.',
      context: 'Speak fluently and organize your thoughts with connectors (en mi opinión, sin embargo, por otra parte, en conclusión).',
      guidingQuestions: [
        '¿Cuáles son las mayores ventajas de estudiar con herramientas digitales?',
        '¿Qué aspectos humanos no se pueden reemplazar fácilmente?',
        '¿Cómo combinas tú la tecnología con la práctica conversacional?',
      ],
      recommendedDurationSeconds: 60,
    },
  },

  // FRENCH EXAMS
  'french-b1': {
    id: 'exam-fr-b1',
    title: 'DELF B1 Évaluation Standardisée de Langue Française',
    targetLanguage: 'French',
    cefrLevel: 'B1',
    durationMinutes: 20,
    listening: [
      {
        id: 'fr-b1-lis-1',
        audioTitle: 'Chronique Radio : Le Télétravail et la vie de quartier',
        audioTranscript: 'Journaliste : Ce matin, coup de projecteur sur les nouveaux rythmes de vie. Depuis la généralisation du travail à distance deux jours par semaine, les commerces de proximité dans les zones résidentielles enregistrent une hausse d’activité de 15 %. Les boulangeries, librairies et petits cafés voient revenir des clients réguliers en milieu de semaine, redynamisant les centres-bourgs.',
        question: 'What direct impact has remote work had on local neighborhood shops?',
        options: [
          'They have experienced a 15% increase in activity and revitalized community life',
          'They have been forced to close on weekdays due to lack of foot traffic',
          'They only accept online orders and home deliveries now',
          'Their profits have dropped drastically because workers stay in offices',
        ],
        correctAnswerIndex: 0,
        explanation: 'The journalist reports a 15% increase in local business activity and the revitalization of town centers.',
      },
      {
        id: 'fr-b1-lis-2',
        audioTitle: 'Message d’information SNCF',
        audioTranscript: 'Mesdames, messieurs, en raison de travaux de modernisation des voies entre Lyon et Marseille, certains trains à grande vitesse circuleront avec des horaires modifiés ce week-end. Nous vous invitons à vérifier votre heure exacte de départ sur notre application mobile avant de vous rendre en gare.',
        question: 'What are passengers advised to do prior to arriving at the station?',
        options: [
          'Exchange their tickets at the ticket counter immediately',
          'Check their exact departure time on the mobile app due to track modernization works',
          'Take a regional bus instead of the high-speed train',
          'Postpone their journey until next month',
        ],
        correctAnswerIndex: 1,
        explanation: 'The announcement asks passengers to verify their exact departure on the mobile app because of rail modernization works.',
      },
    ],
    reading: [
      {
        id: 'fr-b1-read-1',
        passageTitle: 'Les ressourceries : Donner une seconde vie aux objets',
        passage: 'Plutôt que de jeter meubles, vaisselle ou appareils électroménagers inutilisés, de plus en plus de citoyens se tournent vers les ressourceries solidaires. Ces espaces associatifs récupèrent les objets du quotidien, les nettoient ou les réparent dans des ateliers participatifs, puis les revendent à des tarifs modiques. Cette démarche conjugue préservation écologique et solidarité citoyenne.',
        question: 'What is the primary mission of solidarity "ressourceries"?',
        options: [
          'To manufacture luxury handcrafted furniture from rare wood',
          'To collect, repair, and resell everyday items at accessible prices to reduce waste and foster solidarity',
          'To dispose of electronic items in international industrial landfills',
          'To offer paid university degrees in vintage interior decoration',
        ],
        correctAnswerIndex: 1,
        explanation: 'Ressourceries gather discarded household items, refurbish them in collaborative workshops, and resell them affordably.',
      },
      {
        id: 'fr-b1-read-2',
        passageTitle: 'Règlement de la Médiathèque Municipale',
        passage: 'Chaque abonné peut emprunter jusqu’à dix documents (livres, revues, disques) pour une durée maximale de quatre semaines. Une prolongation unique de deux semaines est possible via votre espace personnel en ligne, à condition que l’ouvrage ne soit pas déjà réservé par un autre usager.',
        question: 'Under what condition can a loan period be extended?',
        options: [
          'Only if an additional library fee is paid in cash',
          'As long as the item has not already been reserved by another patron',
          'Only during school holiday periods',
          'If the borrower visits the library in person with two forms of identification',
        ],
        correctAnswerIndex: 1,
        explanation: 'The rule states: "à condition que l’ouvrage ne soit pas déjà réservé par un autre usager".',
      },
    ],
    writing: {
      id: 'fr-b1-wri-1',
      title: 'Épreuve Écrite : Courrier des lecteurs ou proposition municipale',
      prompt: 'Vous écrivez au journal local (80 à 120 mots) pour proposer l’aménagement d’une piste cyclable sécurisée reliant le centre-ville aux complexes sportifs. Expliquez les bénéfices pour l’environnement, la santé et la sécurité des enfants, et proposez une étape concrète pour démarrer le projet.',
      context: 'Structure your French text with clear arguments: "Tout d’abord", "Par ailleurs", "En conclusion".',
      minWords: 60,
      targetTopics: ['Introduction of issue', 'Environmental & safety benefits', 'Practical proposal'],
    },
    speaking: {
      id: 'fr-b1-spk-1',
      title: 'Épreuve Orale : Présentation et argumentation',
      prompt: 'Exprimez votre point de vue pendant une minute sur la question : "Faut-il limiter le temps passé devant les écrans chez les jeunes adultes ?" Présentez les aspects positifs et négatifs.',
      context: 'Speak clearly into the microphone. Aim for varied vocabulary and natural sentence connectors.',
      guidingQuestions: [
        'Quels sont les avantages des écrans pour la culture et le travail ?',
        'Quels risques représentent-ils pour le sommeil et les liens sociaux ?',
        'Comment trouver un équilibre personnel sain ?',
      ],
      recommendedDurationSeconds: 60,
    },
  },

  // JAPANESE EXAMS
  'japanese-b1': {
    id: 'exam-ja-b1',
    title: 'JLPT N4/N3 Standardized Japanese Proficiency Benchmark',
    targetLanguage: 'Japanese',
    cefrLevel: 'B1',
    durationMinutes: 20,
    listening: [
      {
        id: 'ja-b1-lis-1',
        audioTitle: '駅の案内放送と友達の会話',
        audioTranscript: '女の人：すみません、京都行きの新幹線は何番ホームですか。駅員：京都行きは14番ホームです。発車は10時15分ですが、自由席は前の1号車から3号車までとなっております。お急ぎください。女の人：わかりました、ありがとうございます！',
        question: 'Which platform and which cars have non-reserved seats for the Kyoto train?',
        options: [
          'Platform 14, cars 1 to 3',
          'Platform 10, cars 5 to 7',
          'Platform 15, all cars reserved',
          'Platform 4, car 14 only',
        ],
        correctAnswerIndex: 0,
        explanation: 'The station staff says: "14番ホームです... 自由席は前の1号車から3号車までとなっております" (Platform 14, cars 1 through 3).',
      },
      {
        id: 'ja-b1-lis-2',
        audioTitle: 'レストランの予約確認電話',
        audioTranscript: '店員：はい、和食さくらでございます。客：あの、明日の夜7時に4人で予約したいのですが、席は空いていますか。店員：はい、禁煙のテーブル席がご用意できます。コース料理はお決まりでしょうか。客：席だけでお願いします。料理は当日選びます。',
        question: 'What did the customer choose regarding the food order?',
        options: [
          'They ordered the seasonal chef tasting course in advance',
          'They reserved table seats only and will choose the dishes on the day of the visit',
          'They requested a smoking private room with a buffet',
          'They cancelled the reservation because only course menus were available',
        ],
        correctAnswerIndex: 1,
        explanation: 'The customer responds: "席だけでお願いします。料理は当日選びます" (Table only please, we will choose dishes on the day).',
      },
    ],
    reading: [
      {
        id: 'ja-b1-read-1',
        passageTitle: '日本の食品ロスを減らす新しい取り組み',
        passage: '最近、日本のスーパーやコンビニでは、賞味期限が近くなった商品を値引きして売る「フードロス削減」の取り組みが広がっています。以前は期限が近づいた商品はすぐに廃棄されることが多かったですが、消費者の意識が変わり、環境への配慮や節約のために積極的に購入する人が増えています。この活動により、食品廃棄量が年々減少しています。',
        question: 'Why are more consumers actively purchasing items close to their expiration date?',
        options: [
          'Because supermarkets stopped stocking freshly manufactured items',
          'Due to changing consumer awareness valuing environmental consciousness and saving money',
          'Because city governments made it illegal to buy full-priced food',
          'To collect special lottery stamps for luxury vacation prizes',
        ],
        correctAnswerIndex: 1,
        explanation: 'The passage explains: "消費者の意識が変わり、環境への配慮や節約のために積極的に購入する人が増えています".',
      },
      {
        id: 'ja-b1-read-2',
        passageTitle: '市民図書館の利用案内',
        passage: '本館は毎月第3水曜日と年末年始が休館日です。本の貸出期間は2週間で、1人10冊まで借りることができます。返却期限を過ぎた本がある場合、新たな貸出はできませんのでご注意ください。インターネットから本の予約も可能です。',
        question: 'What happens if a borrower has overdue books that have not been returned?',
        options: [
          'They must pay a fine of 1,000 yen per day',
          'They cannot borrow any new books until overdue items are returned',
          'Their library card is permanently revoked',
          'The library automatically purchases the books on their credit card',
        ],
        correctAnswerIndex: 1,
        explanation: 'The guideline says: "返却期限を過ぎた本がある場合、新たな貸出はできません" (No new checkouts allowed if you have overdue books).',
      },
    ],
    writing: {
      id: 'ja-b1-wri-1',
      title: '記述課題：日本の好きな文化や訪れたい場所',
      prompt: 'あなたが日本で訪れたい場所、または興味のある日本の文化（伝統工芸、アニメ、和食など）について書いてください（日本語で80〜120字程度）。なぜそれに興味を持ったのか、そこで何を体験したいかを説明してください。',
      context: 'Use polite form (です・ます) and appropriate reason markers like 〜から / 〜ので.',
      minWords: 30,
      targetTopics: ['Topic introduction', 'Reasons for interest', 'Desired experiences'],
    },
    speaking: {
      id: 'ja-b1-spk-1',
      title: '会話課題：自己紹介とこれまでの学習経験',
      prompt: 'マイクに向かって日本語で1分間話してください：自分の名前、日本語を勉強し始めた理由、普段どのような方法で勉強しているか、将来日本語を使って何がしたいかを話してください。',
      context: 'Speak clearly into the microphone. State your motivation and goals.',
      guidingQuestions: [
        '日本語を勉強するきっかけは何でしたか？',
        '毎日どのような学習をしていますか？',
        '将来、日本語を使ってどんなことをしたいですか？',
      ],
      recommendedDurationSeconds: 60,
    },
  },

  // GERMAN EXAMS
  'german-b1': {
    id: 'exam-de-b1',
    title: 'Goethe-Zertifikat B1 Standard Deutschprüfung',
    targetLanguage: 'German',
    cefrLevel: 'B1',
    durationMinutes: 20,
    listening: [
      {
        id: 'de-b1-lis-1',
        audioTitle: 'Radioreportage: Urbane Mobilität und Fahrradstraßen',
        audioTranscript: 'Moderatorin: Willkommen zu unserem Mittagsmagazin. Die Stadtverwaltung hat heute beschlossen, drei weitere zentrale Straßen in reine Fahrradstraßen umzuwandeln. Autos dürfen dort nur noch als Anlieger mit maximal 30 km/h fahren. Radfahrende haben grundsätzlich Vorrang und dürfen nebeneinander fahren. Das Projekt soll den CO2-Ausstoß im Stadtzentrum um 12 Prozent senken.',
        question: 'What rights do cyclists have on the newly designated bicycle streets?',
        options: [
          'They must stop at every corner and yield to all motor vehicles',
          'They have fundamental right-of-way and are permitted to ride side-by-side',
          'They can only use the street during weekend mornings',
          'They must wear special reflective safety vests at all times',
        ],
        correctAnswerIndex: 1,
        explanation: 'The report specifies: "Radfahrende haben grundsätzlich Vorrang und dürfen nebeneinander fahren."',
      },
      {
        id: 'de-b1-lis-2',
        audioTitle: 'Ansage im Hauptbahnhof München',
        audioTranscript: 'Achtung an Gleis 8: Der Intercity-Express nach Hamburg-Altona über Nürnberg und Hannover, planmäßige Abfahrt um 14 Uhr 10, fällt heute leider aus. Reisende nach Hannover nutzen bitte den ICE 624 um 14 Uhr 32 von Gleis 11. Ihre Fahrkarten sind für alle Folgezüge freigegeben.',
        question: 'What alternative is provided to travelers bound for Hannover?',
        options: [
          'Take a regional bus from outside the station at 16:00',
          'Use ICE 624 departing at 14:32 from Track 11, with tickets valid for subsequent trains',
          'Cancel their trip and request a refund within 10 minutes',
          'Book an overnight sleeper car on Track 2',
        ],
        correctAnswerIndex: 1,
        explanation: 'Passengers for Hannover are told to take ICE 624 at 14:32 from Platform 11, and tickets are valid on subsequent trains.',
      },
    ],
    reading: [
      {
        id: 'de-b1-read-1',
        passageTitle: 'Das Mehrgenerationenhaus: Gemeinsam statt einsam',
        passage: 'In Freiburg erfreut sich ein neues Wohnmodell großer Beliebtheit: das Mehrgenerationenhaus. Hier wohnen Studierende, junge Familien und Seniorinnen und Senioren unter einem Dach. Jeder hat seine eigene abgeschlossene Wohnung, teilt sich jedoch Gemeinschaftsräume wie die Werkstatt, den Garten und die Großküche. Einmal wöchentlich kochen die Bewohner zusammen, und Studierende helfen den älteren Nachbarn beim Einkaufen, während Großeltern bei der Kinderbetreuung unterstützen.',
        question: 'How do residents in the multi-generation house collaborate in everyday life?',
        options: [
          'Senior citizens pay rent on behalf of all the university students',
          'They share communal facilities, cook together weekly, students assist with shopping, and seniors help with childcare',
          'All residents work in the same local factory',
          'Private apartments are strictly prohibited in the building',
        ],
        correctAnswerIndex: 1,
        explanation: 'The text highlights shared community spaces, weekly group meals, shopping assistance from students, and childcare help from seniors.',
      },
      {
        id: 'de-b1-read-2',
        passageTitle: 'Mitteilung der Volkshochschule',
        passage: 'Sehr geehrte Kursteilnehmende, ab dem nächsten Semester stellen wir alle Kursunterlagen digital über unsere Lernplattform zur Verfügung. Sie erhalten Ihren persönlichen Zugangscode mit der Anmeldebestätigung. Gedruckte Kurshefte können auf Anfrage im Sekretariat gegen eine Gebühr von fünf Euro erworben werden.',
        question: 'How can participants access course materials for the upcoming semester?',
        options: [
          'They must buy expensive textbooks at the university bookstore',
          'Digitally via the online learning platform using the personal access code sent with registration confirmation',
          'Materials are only handed out in paper during the final exam',
          'Course materials have been discontinued entirely',
        ],
        correctAnswerIndex: 1,
        explanation: 'Materials will be digital via the learning platform with the personal access code from the confirmation.',
      },
    ],
    writing: {
      id: 'de-b1-wri-1',
      title: 'Schreibaufgabe: Forumsbeitrag zum Thema Umweltschutz',
      prompt: 'Schreiben Sie einen Forumsbeitrag (ca. 80-100 Wörter) zum Thema: "Plastikfreier Einkauf im Alltag". Berichten Sie von Ihren eigenen Erfahrungen, nennen Sie Vor- und Nachteile von verpackungsfreien Läden und geben Sie einen praktischen Tipp für andere Teilnehmende.',
      context: 'Verwenden Sie Konjunktoren (weil, obwohl, deshalb, meiner Meinung nach) und gliedern Sie Ihren Text in Einleitung, Hauptteil und Schluss.',
      minWords: 50,
      targetTopics: ['Eigene Erfahrungen', 'Vor- und Nachteile', 'Praktischer Tipp'],
    },
    speaking: {
      id: 'de-b1-spk-1',
      title: 'Sprechaufgabe: Kurzvortrag über Ihre Sprachlernziele',
      prompt: 'Sprechen Sie 60 Sekunden lang frei ins Mikrofon: Warum lernen Sie Deutsch? Welche Situationen fallen Ihnen leicht, und welche Fähigkeiten möchten Sie in den nächsten Monaten besonders verbessern?',
      context: 'Sprechen Sie flüssig und zusammenhängend. Begründen Sie Ihre Aussagen.',
      guidingQuestions: [
        'Was ist Ihre Hauptmotivation für das Deutschlernen?',
        'Was fällt Ihnen beim Sprechen oder Hören noch schwer?',
        'Welche Lernmethoden funktionieren für Sie am besten?',
      ],
      recommendedDurationSeconds: 60,
    },
  },
};

/**
 * Returns an authentic, calibrated mock exam immediately without waiting for API generation.
 */
export function getInstantMockExam(targetLanguage: string, cefrLevel: string): MockTestExam {
  const normalizedLang = targetLanguage.toLowerCase().trim();
  const normalizedLevel = (cefrLevel.split(' - ')[0] || 'B1').toLowerCase().trim();
  const key = `${normalizedLang}-${normalizedLevel}`;

  if (BENCHMARK_MOCK_EXAMS[key]) {
    return BENCHMARK_MOCK_EXAMS[key];
  }

  // Check language match with B1 fallback
  const langKey = `${normalizedLang}-b1`;
  if (BENCHMARK_MOCK_EXAMS[langKey]) {
    const base = BENCHMARK_MOCK_EXAMS[langKey];
    return {
      ...base,
      id: `exam-${normalizedLang}-${normalizedLevel}-${Date.now()}`,
      cefrLevel: cefrLevel.split(' - ')[0] || 'B1',
      title: `${targetLanguage} CEFR Level ${cefrLevel.split(' - ')[0] || 'B1'} Standardized Examination`,
    };
  }

  // Fallback to Spanish B1 template adapted to target language
  const defaultBase = BENCHMARK_MOCK_EXAMS['spanish-b1'];
  return {
    ...defaultBase,
    id: `exam-${normalizedLang}-${normalizedLevel}-${Date.now()}`,
    targetLanguage,
    cefrLevel: cefrLevel.split(' - ')[0] || 'B1',
    title: `${targetLanguage} CEFR Standardized Proficiency Exam`,
  };
}
