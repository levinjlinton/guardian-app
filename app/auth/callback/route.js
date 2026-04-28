import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Handles the OAuth redirect from Google/GitHub after login
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
