import { AppShell } from '@/components/app-shell';
import { AuthSubmitButton } from '@/components/auth-submit-button';
import { updateProfileAction } from '@/app/actions';
import { getPlatformSettings, getSessionWithProfile } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatCurrency } from '@/lib/utils';

export default async function ProfilePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { profile } = await getSessionWithProfile();
  const settings = await getPlatformSettings();
  const admin = createAdminClient();
  const { data: plans } = await admin.from('user_plans').select('id').eq('user_id', profile!.id).eq('status', 'active');
  const { data: referrals } = await admin.from('profiles').select('id').eq('referred_by', profile!.id);
  const params = await searchParams;
  const success = typeof params.success === 'string' ? params.success : null;

  return (
    <AppShell profile={profile!} brandName={settings?.default_brand_name || 'Pak Profit Hub'}>
      <div className="stack">
        {success && <div className="notice success">{decodeURIComponent(success)}</div>}
        <div className="feature-card" style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="avatar-badge" style={{ width: 84, height: 84, fontSize: 28 }}>{(profile?.full_name || profile?.email || 'P')[0]?.toUpperCase()}</div>
          <div>
            <h2 style={{ margin: 0 }}>{profile!.full_name || profile!.email?.split('@')[0]}</h2>
            <p className="muted">{profile!.email}</p>
            <p className="muted small">Wallet: {formatCurrency(profile!.wallet_balance)} • Active plans: {plans?.length || 0} • Referrals: {referrals?.length || 0}</p>
          </div>
        </div>
        <div className="form-card">
          <h3>Edit profile</h3>
          <form action={updateProfileAction} className="stack" style={{ marginTop: 16 }}>
            <div className="input-group">
              <label>Full name</label>
              <input className="input" type="text" name="fullName" defaultValue={profile!.full_name || ''} required />
            </div>
            <AuthSubmitButton idle="Save profile" loading="Saving..." />
          </form>
        </div>
      </div>
    </AppShell>
  );
}
