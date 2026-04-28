import { google } from 'googleapis';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const userId = searchParams.get('state');

  if (!code || !userId) {
    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?cal_error=1`);
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);

    // Store tokens in user_settings
    const supabase = createAdminClient();
    await supabase.from('user_settings').update({
      google_calendar_token: JSON.stringify(tokens),
    }).eq('user_id', userId);

    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?cal_connected=1`);
  } catch (err) {
    console.error('Calendar callback error:', err);
    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?cal_error=1`);
  }
}
