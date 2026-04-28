import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { messages, projects, blocks } = await req.json();

    const projectSummary = projects?.length
      ? projects.map(p => `- ${p.name} (${p.priority} priority, ${p.progress||0}% done, deadline: ${p.deadline ? new Date(p.deadline).toLocaleDateString() : 'none'})`).join('\n')
      : 'No projects yet.';

    const todayBlocks = blocks?.filter(b => {
      const now = new Date();
      const dow = now.getDay();
      const todayIdx = dow === 0 ? 6 : dow - 1;
      const mon = new Date(now);
      mon.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
      mon.setHours(0,0,0,0);
      const wk = mon.toISOString().slice(0,10);
      return b.week_key === wk && b.day_index === todayIdx;
    }) || [];

    const scheduleSummary = todayBlocks.length
      ? todayBlocks.map(b => `- ${b.start_time}–${b.end_time}: ${b.title} (${b.type})`).join('\n')
      : 'Nothing scheduled today.';

    const systemPrompt = `You are Guardian AI, a friendly and focused time management assistant built into the Guardian app. You help users stay productive, manage deadlines, and make the most of their schedule.

The user's current projects:
${projectSummary}

Today's schedule:
${scheduleSummary}

Keep responses concise and practical. You can reference their actual projects and schedule. Be encouraging but direct. Don't use excessive bullet points — talk like a smart, helpful friend. If they ask something unrelated to productivity/time management, gently redirect.`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
    });

    return Response.json({ reply: response.content[0].text });
  } catch (err) {
    console.error('AI error:', err);
    return Response.json({ error: 'AI request failed' }, { status: 500 });
  }
}
