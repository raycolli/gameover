import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

function getRelevantContent(pdfContent) {
  // Get first ~2000 words or ~12000 characters
  const words = pdfContent.split(/\s+/);
  const relevantWords = words.slice(0, 2000).join(' ');
  return relevantWords.length > 12000 ? relevantWords.slice(0, 12000) : relevantWords;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pdfContent } = req.body;

    if (!pdfContent) {
      return res.status(400).json({ error: 'PDF content is required' });
    }

    // Get a manageable chunk of the content
    const relevantContent = getRelevantContent(pdfContent);

    const prompt = `Based on the following text excerpt from a PDF, generate 5 multiple choice questions. Focus on the key concepts and important information.

Text excerpt:
${relevantContent}

Generate 5 questions in the following JSON format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"]
    }
  ]
}

Requirements:
1. Generate exactly 5 questions
2. Each question must have exactly 4 options
3. Questions must be based only on the provided text
4. Questions should be clear and unambiguous
5. Return only valid JSON in the specified format`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a precise quiz generator that creates multiple choice questions based on provided text. Always return valid JSON in the specified format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    let questions;
    try {
      const response = JSON.parse(completion.choices[0].message.content);
      questions = response.questions;
      
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('No questions generated');
      }

      // Validate question format
      questions.forEach((q, index) => {
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`Invalid question format at index ${index}`);
        }
      });

    } catch (error) {
      console.error('Error parsing or validating questions:', error);
      return res.status(500).json({ error: 'Failed to generate valid questions' });
    }

    console.log('Generated questions:', questions); // Debug log
    return res.status(200).json({ questions });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate questions',
      details: error.message 
    });
  }
} 