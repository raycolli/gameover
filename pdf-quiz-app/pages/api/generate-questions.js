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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pdfContent } = req.body;

    if (!pdfContent) {
      return res.status(400).json({ error: 'PDF content is required' });
    }

    const prompt = `Based on the following text from a PDF, generate 5 multiple choice questions. Each question should have 4 options.
    
Text: ${pdfContent.substring(0, 3000)} // Limit text length to avoid token limits

Format each question as follows:
{
  "question": "Question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"]
}

Return the questions as a JSON array.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates multiple choice questions based on PDF content. Return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    let questions;
    try {
      const response = JSON.parse(completion.choices[0].message.content);
      questions = response.questions || [];
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      return res.status(500).json({ error: 'Failed to parse questions' });
    }

    return res.status(200).json({ questions });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate questions',
      details: error.message 
    });
  }
} 