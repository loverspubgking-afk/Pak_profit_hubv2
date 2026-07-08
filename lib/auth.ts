import { redirect } from 'next/navigation';
import type { Profile, PlatformSettings } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';

export async function getSessionWithProfile(allowAnonymous = false) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user && !allowAnonymous) redirect('/login');

  let profile: Profile | null = null;

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, status, wallet_balance, total_earned, referral_code, referred_by, avatar_url, welcome_bonus_granted, created_at')
      .eq('id', user.id)
      .single();
    profile = data as Profile | null;

    if (profile?.status === 'blocked') {
      await supabase.auth.signOut();
      redirect('/login?blocked=1');
    }

    const { data: platformData } = await supabase.from('platform_settings').select('*').eq('id', 1).single();
    const platform = platformData as PlatformSettings | null;
    if (platform?.maintenance_mode && profile && !['staff_admin', 'super_admin'].includes(profile.role)) {
      redirect('/maintenance');
    }
  }

  return { supabase, user, profile };
}

export async function requireRole(roles: Array<Profile['role']>) {
  const { profile } = await getSessionWithProfile();
  if (!profile || !roles.includes(profile.role)) redirect('/dashboard');
  return profile;
}

export async function getPlatformSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from('platform_settings').select('*').eq('id', 1).single();
  return data as PlatformSettings | null;
}
