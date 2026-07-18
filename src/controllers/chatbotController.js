const { findBestMatch, detectLanguage } = require('../utils/chatbotKnowledge');

/**
 * POST /api/chatbot/message
 * Body: { message: string, language?: 'english' | 'telugu' | 'tenglish' }
 * Returns: { answer: string, topic: string, found: boolean }
 */
const handleMessage = async (req, res) => {
  try {
    const { message, language } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ message: 'Please provide a valid message.' });
    }

    const userMessage = message.trim();

    // Detect or use provided language
    const detectedLang = language || detectLanguage(userMessage);

    // Find the best matching answer
    const match = findBestMatch(userMessage);

    if (!match) {
      const fallbacks = {
        english: "Sorry, I can only answer questions about LocalShift app. Please ask something related to how the app works, payments, shifts, or how to apply.",
        telugu: "క్షమించండి, నేను LocalShift యాప్ గురించిన ప్రశ్నలకు మాత్రమే సమాధానం ఇవ్వగలను. దయచేసి యాప్ ఎలా పని చేస్తుందో, పేమెంట్స్, షిఫ్ట్స్, లేదా అప్లై ఎలా చేయాలో అడగండి.",
        tenglish: "Sorry, nenu LocalShift app gurinchi questions ki matrame answers ivvagalanu. App ela panichestundo, payments, shifts, leda apply ela cheyalo adagandi."
      };

      return res.json({
        found: false,
        answer: fallbacks[detectedLang] || fallbacks.english,
        topic: null,
        language: detectedLang
      });
    }

    const answer = match.answers[detectedLang] || match.answers.english;

    return res.json({
      found: true,
      answer,
      topic: match.topic,
      language: detectedLang
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ message: 'Chatbot server error', error: error.message });
  }
};

module.exports = { handleMessage };
