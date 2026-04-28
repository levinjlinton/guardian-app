import { google } from 'googleapis';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data: settings } = await admin.from('user_settings')
    .select('google_calendar_token')
    .eq('user_id', user.id)
    .single();

  if (!settings?.google_calendar_token) {
    return Response.json({ error: 'not_connected' }, { status: 400 });
  }

  try {
    const tokens = JSON.parse(settings.google_calendar_token);
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/callback`
    );
    oauth2Client.setCredentials(tokens);

    // Auto-refresh token if needed
    oauth2Client.on('tokens', async (newTokens) => {
      const merged = { ...tokens, ...newTokens };
      await admin.from('user_settings').update({
        google_calendar_token: JSON.stringify(merged),
      }).eq('user_id', user.id);
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + 14);

    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: weekEnd.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50,
    });

    const events = (res.data.items || []).map(e => ({
      id: e.id,
      title: e.summary || 'Untitled',
      start: e.start?.dateTime || e.start?.date,
      end: e.end?.dateTime || e.end?.date,
      allDay: !e.start?.dateTime,
      description: e.description || '',
      color: e.colorId,
    }));

    return Response.json({ events });
  } catch (err) {
    console.error('Calendar events error:', err);
    return Response.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
