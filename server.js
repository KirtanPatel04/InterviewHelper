import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/chat', (req, res) => {
  const { question, resume } = req.body || {};
  const resumeSummary = resume ? `I reviewed ${resume.length} characters of your resume.` : 'No resume was provided.';

  // Replace this with a call to your AI provider (OpenAI, Gemini, etc.).
  // Keep your API key in an environment variable like process.env.AI_API_KEY.
  const reply = `Based on your resume, here is a suggested answer. ${resumeSummary}\n\nYou asked: "${question}"`;
  res.json({ reply });
});

app.listen(PORT, () => {
  console.log(`Mock AI server listening on http://localhost:${PORT}`);
});
