/**
 * Mock AI client for demo purposes. Replace the logic in `askAI` with
 * a real API call (e.g., OpenAI, Gemini) and keep secrets in environment variables on the server.
 */
export async function askAI(question: string, resumeText: string): Promise<string> {
  const payload = { question, resume: resumeText };

  // In a real app, you would call a backend endpoint that forwards to your AI provider.
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.reply) return data.reply;
    }
  } catch (err) {
    console.warn('Falling back to mock AI response:', err);
  }

  const summary = resumeText ? `Here is how to answer using your background: ${resumeText.slice(0, 240)}...` : '';
  const cannedResponses = [
    'Here is a concise takeaway you can share with the interviewer.',
    'Based on your experience, here is a tailored response.',
    'Lean on your past work to answer clearly and confidently.',
    'Draw connections between the role and your recent achievements.',
  ];
  const random = Math.floor(Math.random() * cannedResponses.length);

  await new Promise((resolve) => setTimeout(resolve, 700 + Math.random() * 700));
  return `${cannedResponses[random]}\n\nQuestion I heard: "${question}"\n${summary}`;
}
