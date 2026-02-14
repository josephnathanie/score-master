import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Security check: Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Connect to Neon using the Environment Variable we set in Vercel
  const sql = neon(process.env.DATABASE_URL);
  
  const { username, home, away } = req.body;

  try {
    // Insert data into the table you created in the Neon SQL editor
    await sql`
      INSERT INTO predictions (username, prediction_home, prediction_away) 
      VALUES (${username}, ${parseInt(home)}, ${parseInt(away)})
    `;
    
    return res.status(200).json({ message: "Prediction stored successfully!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Database Error", error: error.message });
  }
}