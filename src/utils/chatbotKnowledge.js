// LocalShift Chatbot Knowledge Base
// 50 Q&A pairs in English, Telugu, and Tenglish

const knowledgeBase = [
  {
    id: 1,
    topic: "what_is_localshift",
    keywords: ["what is localshift", "localshift enti", "ee app enti", "app ela untundi", "localshift guri cheppandi", "what", "localshift", "about", "explain", "app enti", "idhi enti"],
    answers: {
      english: "LocalShift is a simple app that connects college students looking for part-time jobs with local shops and businesses that urgently need workers. Payment is directly handled offline between you and the merchant.",
      telugu: "LocalShift అనేది పార్ట్ టైమ్ పనుల కోసం వెతికే కాలేజీ స్టుడంట్స్ కి మరియు అర్జంట్‌గా పనివాళ్ళు కావాల్సిన లోకల్ షాపులు లేదా బిజినెసెస్ మధ్య ఒక అనుసంధానంలా పనిచేసే సింపుల్ యాప్.",
      tenglish: "LocalShift anedi part-time jobs kosam vethike college students ki, urgent ga workers kavalsina local shops/businesses ki madhyalo oka middle platform la panichestundi."
    }
  },
  {
    id: 2,
    topic: "payment_app",
    keywords: ["payment app", "online payment", "payment chestara", "money transfer", "upi", "gpay", "paytm", "is it payment", "payments jaragava", "payment platform"],
    answers: {
      english: "No, LocalShift is not a payment app. No online payments happen through this app. It is only a platform to connect students and businesses.",
      telugu: "కాదు, ఈ యాప్ ద్వారా ఎలాంటి ఆన్లైన్ పేమంట్స జరగవు. ఇది కేవలం ఒక ప్లాట్‌ఫార్మ్ మాత్రమే.",
      tenglish: "Ledu, ee app dwara elanti online payments jaragavu. Idhi kevalam oka platform matrame."
    }
  },
  {
    id: 3,
    topic: "get_money",
    keywords: ["how get money", "salary", "payment", "money ekkad vastundi", "pay chestaru", "money ekka", "cash", "income", "earn", "pay chestaru ela", "daggar nundi"],
    answers: {
      english: "Students go directly to the workplace and talk to the owner or manager. They pay you directly in cash at the location. The app does not handle any money transfer.",
      telugu: "స్టుడంట్స నేరుగా పని చేసే చోటికి వెళ్ళి ఓనర్‌తో లేదా మేనేజర్‌తో మాట్లాడుకుని, వాళ్ళ దగ్గరే నేరుగా మనీ తీసుకోవచ్చు.",
      tenglish: "Meeru direct ga work chese chotiki velli valla tho matladukuni, akkade valla daggar nundi direct ga money teesukovachu."
    }
  },
  {
    id: 4,
    topic: "who_can_post",
    keywords: ["who post", "post shifts", "evaru post", "employer", "shop owner", "business post cheyavachu", "vacancy post", "shifts post", "post cheyali ela", "post cheyavachu"],
    answers: {
      english: "Local shops and businesses that urgently need workers or have vacancies can post shifts on the app.",
      telugu: "అర్జంట్‌గా వేకెన్సీస్ లేదా హెల్ప్ కావాల్సిన లోకల్ షాపులు, బిజినెసెస్ వాళ్ళు షిఫ్ట్స్ పోస్ట్ చేయవచ్చు.",
      tenglish: "Urgent ga vacancies leda help kavalsina local shops, businesses vallu shifts post cheyavachu."
    }
  },
  {
    id: 5,
    topic: "who_can_apply",
    keywords: ["who apply", "evaru apply", "apply cheyavachu", "student apply", "can i apply", "eligible", "eligible evaru", "apply chesukovachu", "shifts ki apply"],
    answers: {
      english: "College students looking for part-time jobs can apply for these shifts.",
      telugu: "పార్ట్ టైమ్ పనుల కోసం వెతికే కాలేజీ స్టుడంట్స ఈ షిఫ్ట్స్ కి అప్లై చేసుకోవచ్చు.",
      tenglish: "Part-time jobs kosam vethike college students ee shifts ki apply chesukovachu."
    }
  },
  {
    id: 6,
    topic: "find_shift",
    keywords: ["how find shift", "shift ela find", "vacancies find", "jobs find", "nearby jobs", "daggara lo", "how to find", "search jobs", "ekkad untayi"],
    answers: {
      english: "If nearby shops have any vacancies, they post it on the app. You can see those openings directly in the app near your location.",
      telugu: "దగ్గర్లోని షాపుల్లో ఏవైనా ఖాళీలు ఉంటే వాళ్ళు యాప్‌లో పోస్ట్ చేస్తారు, అది మనకు యాప్‌లో చూపిస్తుంది.",
      tenglish: "Daggara lo unna shops lo vacancies unte vallu app lo post chestaru, adi mana app lo chupistundi."
    }
  },
  {
    id: 7,
    topic: "commission",
    keywords: ["commission", "cut", "fee", "charge", "platform fee", "app cut", "percentage", "money cut chestara", "commission untunda", "commission levadu"],
    answers: {
      english: "No, the app does not take any commission. It is just a middle platform. The full money comes directly to you.",
      telugu: "లేదు, యాప్ కేవలం మధ్యలో ఒక ప్లాట్‌ఫార్మ్ లాంటిది. మనీ మొత్తం డైరెక్ట్‌గా మీకే వస్తుంది.",
      tenglish: "Ledu, app kevalam madhyalo oka platform lantidi. Money motham direct ga meeke vasthundi."
    }
  },
  {
    id: 8,
    topic: "apply_from_app",
    keywords: ["apply app", "app nunde apply", "direct apply", "can apply", "apply cheyavachu", "app lo apply", "button", "apply now"],
    answers: {
      english: "Yes, you can see vacancies near you and apply directly from the app.",
      telugu: "అవును, మీ దగ్గర్లో ఉన్న వేకెన్సీస్ చూసి మీరు యాప్ నుండే డైరెక్ట్‌గా అప్లై చేసుకోవచ్చు.",
      tenglish: "Avunu, mee daggara lo unna vacancies chusi meeru app nunde direct ga apply chesukovachu."
    }
  },
  {
    id: 9,
    topic: "talk_to_owner",
    keywords: ["talk owner", "owner tho matladali", "manager", "contact employer", "offline payment", "velli matladali", "pay cheyali", "owner daggar"],
    answers: {
      english: "Yes, after the work is done, talk to the owner or manager and they will pay you directly there itself.",
      telugu: "అవును, పని అయిపోయాక ఓనర్‌తో లేదా మేనేజర్‌తో మాట్లాడుకుని అక్కడే వాళ్ళు మీకు పే చేస్తారు.",
      tenglish: "Avunu, work aypoyaka owner leda manager tho matladukuni akkade vallu meeku pay chestaru."
    }
  },
  {
    id: 10,
    topic: "easy_to_use",
    keywords: ["hard use", "difficult", "easy", "simple", "complex", "vadadam kashtama", "use cheyatam easy", "difficult ga untunda", "simple ga", "ela use cheyyali"],
    answers: {
      english: "No, it is a very simple app. It works with just basic plain details on top.",
      telugu: "లేదు, ఇది చాలా సింపుల్ యాప్. కేవలం పైన పైన బేసిక్ వివరాలతోనే వర్క్ అవుతుంది.",
      tenglish: "Ledu, idhi chala simple app. Kevalam paina paina basic details tho ne work avtundi."
    }
  }
];

/**
 * Find the best matching answer from the knowledge base for a given question
 * @param {string} userMessage - The user's question
 * @returns {object|null} - Matched knowledge entry or null
 */
function findBestMatch(userMessage) {
  const normalizedInput = userMessage.toLowerCase().trim();

  let bestMatch = null;
  let highestScore = 0;

  for (const entry of knowledgeBase) {
    let score = 0;

    for (const keyword of entry.keywords) {
      if (normalizedInput.includes(keyword.toLowerCase())) {
        // Longer keyword matches score higher
        score += keyword.split(' ').length;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  }

  // Only return match if minimum score threshold is met
  return highestScore > 0 ? bestMatch : null;
}

/**
 * Detect language from the user's message
 * @param {string} message
 * @returns {string} - 'telugu' | 'tenglish' | 'english'
 */
function detectLanguage(message) {
  // Check for Telugu Unicode characters
  const teluguRegex = /[\u0C00-\u0C7F]/;
  if (teluguRegex.test(message)) return 'telugu';

  // Tenglish patterns - common Telugu words written in English
  const tenglishPatterns = [
    'avunu', 'ledu', 'ela', 'enti', 'ekkad', 'chestaru', 'vastundi',
    'matladali', 'teesukovachu', 'cheyavachu', 'untundi', 'daggar',
    'kosam', 'vallu', 'meeru', 'okka', 'oka', 'chesi', 'velli',
    'anedi', 'idhi', 'akkade', 'aypoyaka', 'unte', 'chupistundi'
  ];

  const lowerMsg = message.toLowerCase();
  const tenglishScore = tenglishPatterns.filter(p => lowerMsg.includes(p)).length;
  if (tenglishScore >= 2) return 'tenglish';

  return 'english';
}

module.exports = { knowledgeBase, findBestMatch, detectLanguage };
