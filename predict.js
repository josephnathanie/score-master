import { neon } from '@neondatabase/serverless';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'POST only' });

  const { username, home, away } = req.body;
  const sql = neon(process.env.DATABASE_URL);
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    // 1. Save prediction to Neon Database
    await sql`INSERT INTO predictions (username, home_score, away_score) VALUES (${username}, ${home}, ${away})`;

    // 2. Treat the pick as a prompt for Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a pro NBA analyst. A user named ${username} predicts a game will end ${home} to ${away}. 
                    Analyze if this score is realistic for a modern NBA game. 
                    Then, give your own 'Gemini Lock' expert pick for tonight's slate in 2 sentences. Use basketball lingo.`;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    return res.status(200).json({ 
      message: "Stored & Analyzed", 
      analysis: aiResponse 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "AI or DB Error" });
  }
}