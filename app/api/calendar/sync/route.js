import { google } from 'googleapis';
import { createClient, createAdminClient } from '@/lib/supabase/server';

// Push a Guardian schedule block to Google Calendar
export async function POST(req) {
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
    const { block, weekDates } = await req.json();
    const tokens = JSON.parse(settings.google_calendar_token);

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/callback`
    );
    oauth2Client.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const date = weekDates[block.day_index];
    const dateStr = new Date(date).toISOString().slice(0, 10);
    const startDateTime = `${dateStr}T${block.start_time}:00`;
    const endDateTime = `${dateStr}T${block.end_time}:00`;

    await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: block.title,
        description: `Guardian ${block.type} block`,
        start: { dateTime: startDateTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        end: { dateTime: endDateTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        colorId: { work: '9', break: '2', personal: '5', study: '6' }[block.type] || '9',
      },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('Sync error:', err);
    return Response.json({ error: 'Failed to sync' }, { status: 500 });
  }
}
