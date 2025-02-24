import OpenAI from "openai";
import pdfParse from "pdf-parse";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { file } = req.body;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Convert base64 file to text
    const dataBuffer = Buffer.from(file, "base64");
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text.substring(0, 1000); // Limit text length for OpenAI

    // Initialize OpenAI API (✅ FIXED IMPORT)
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Generate questions
    // Does this still get used???????? Yes
    const prompt = `Generate questions:\n\n${text}`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.status(200).json({ questions: response.choices[0].message.content });
  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
