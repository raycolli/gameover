import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { question, selectedAnswer, options, pdfContent } = req.body;

  try {
    const prompt = `You are tasked with validating a quiz answer. Use ONLY the provided PDF content as the source of truth.

PDF Content:
${pdfContent}

Question: "${question}"
All available options: ${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}
Selected answer: "${selectedAnswer}"

Instructions:
1. First, find the relevant information in the PDF content above
2. Based ONLY on the PDF content, determine if the selected answer is correct
3. Ignore any external knowledge and use only what's in the PDF
4. If the selected answer matches the information in the PDF, respond with "true"
5. If the selected answer contradicts or isn't supported by the PDF, respond with "false"

Respond with ONLY "true" or "false".`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a precise quiz validator that only uses the provided PDF content to validate answers."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 5
    });

    const result = completion.choices[0].message.content.toLowerCase().trim();
    const isCorrect = result === "true";

    // Get explanation for both correct and incorrect answers
    const explanationCompletion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "user",
          content: `
Based on this PDF content:
${pdfContent}

Question: "${question}"
Selected answer: "${selectedAnswer}"

Explain why this answer is ${isCorrect ? 'correct' : 'incorrect'} using specific references from the PDF content.`
        }
      ],
      temperature: 0.3,
      max_tokens: 150
    });

    const explanation = explanationCompletion.choices[0].message.content;

    res.status(200).json({ isCorrect, explanation });
  } catch (error) {
    console.error('Error checking answer:', error);
    res.status(500).json({ message: 'Error checking answer', error: error.message });
  }
} 