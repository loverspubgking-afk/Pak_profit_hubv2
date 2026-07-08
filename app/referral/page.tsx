import { AppShell } from '@/components/app-shell';
import { getPlatformSettings, getSessionWithProfile } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatCurrency } from '@/lib/utils';

export default async function ReferralPage() {
  const { profile } = await getSessionWithProfile();
  const settings = await getPlatformSettings();
  const admin = createAdminClient();
  const { data: referred } = await admin.from('profiles').select('full_name, email, created_at').eq('referred_by', profile!.id).order('created_at', { ascending: false });
  const { data: referralTx } = await admin.from('transactions').select('amount').eq('user_id', profile!.id).eq('transaction_type', 'referral_bonus');
  const totalReferral = (referralTx || []).reduce((sum, item) => sum + Number(item.amount), 0);
  const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL}/signup?ref=${profile!.referral_code}`;

  return (
    <AppShell profile={profile!} brandName={settings?.default_brand_name || 'Pak Profit Hub'}>
      <div className="stack">
        <div className="feature-card">
          <p className="section-label">Referral</p>
          <h2 style={{ marginTop: 4 }}>Invite friends and earn a fixed bonus</h2>
          <p className="muted">Default bonus is {formatCurrency(settings?.referral_bonus || 100)} after your referral makes a first approved deposit.</p>
          <div className="notice" style={{ marginTop: 14 }}>
            <strong>Your referral link</strong>
            <p className="muted small" style={{ margin: '8px 0 0' }}>{referralLink}</p>
          </div>
        </div>
        <section className="metric-grid">
          <div className="dash-card"><span className="muted small">Referral bonus</span><strong>{formatCurrency(settings?.referral_bonus || 100)}</strong></div>
          <div className="dash-card"><span className="muted small">Total referred</span><strong>{referred?.length || 0}</strong></div>
          <div className="dash-card"><span className="muted small">Total earned</span><strong>{formatCurrency(totalReferral)}</strong></div>
        </section>
        <section className="table-card">
          <div style={{ padding: 20 }}>
            <h3 style={{ margin: 0 }}>Your referrals</h3>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Joined</th></tr></thead>
              <tbody>
                {(referred || []).map((item) => (
                  <tr key={`${item.email}-${item.created_at}`}>
                    <td>{item.full_name || item.email?.split('@')[0]}</td>
                    <td>{item.email}</td>
                    <td>{new Date(item.created_at).toLocaleDateString('en-PK')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
