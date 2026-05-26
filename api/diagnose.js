export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { answers } = req.body;

  const prompt = `You are writing a personalised brand diagnostic for a founder, on behalf of osmil™ — a senior brand and design studio that works with solo entrepreneurs and small business founders who want to look professional and grow with clarity.

The founder answered these six questions:

1. How long have you been trading? "${answers.trading}"
2. How did your current brand come together? "${answers.brand_origin}"
3. Where does most of your new business come from? "${answers.new_biz}"
4. When someone asks "can I see your website?" how do you feel? "${answers.friction}"
5. What's coming up that makes brand feel more urgent? "${answers.upcoming}"
6. One word to describe how your brand makes you feel: "${answers.feeling}"

Write a warm, direct, honest brand read for this founder. Do NOT be generic. Respond in JSON only with this structure:
{
  "headline": "A punchy 6-10 word headline that names their specific situation",
  "diagnosis": "2-3 sentences that name what's really going on with their brand, written warmly and honestly. This should feel like a trusted senior creative has read their situation and is talking directly to them. No fluff, no hollow encouragement.",
  "steps": [
    "First concrete next step (1 sentence, action-oriented)",
    "Second concrete next step (1 sentence, action-oriented)",
    "Third concrete next step (1 sentence, action-oriented)"
  ]
}

Keep the tone: direct, warm, premium, like osmil™. No corporate speak. No hollow phrases like 'on a journey' or 'brand story'. Speak to them like a trusted adviser.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content.map(i => i.text || '').join('');
    const clean = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to generate diagnosis' });
  }
}
