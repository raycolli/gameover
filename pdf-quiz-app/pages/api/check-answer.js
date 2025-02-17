import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { question, selectedAnswer, options } = req.body;

  try {
    const prompt = `
Question: ${question}
Available options: ${options.join(', ')}
Selected answer: ${selectedAnswer}

Is the selected answer correct? Please respond with only "true" if the answer is correct, or "false" if it's incorrect. Base your response on factual knowledge.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 5
    });

    const result = completion.choices[0].message.content.toLowerCase().trim();
    const isCorrect = result === "true";

    res.status(200).json({ isCorrect });
  } catch (error) {
    console.error('Error checking answer:', error);
    res.status(500).json({ message: 'Error checking answer' });
  }
} 