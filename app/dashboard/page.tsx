import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { collectPlanAction } from '@/app/actions';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPlatformSettings, getSessionWithProfile } from '@/lib/auth';
import { formatCurrency, formatDateTime } from '@/lib/utils';

function getCountdown(startedAt: string, claimedDays: number) {
  const nextAt = new Date(new Date(startedAt).getTime() + (claimedDays + 1) * 24 * 60 * 60 * 1000).getTime();
  const diff = Math.max(nextAt - Date.now(), 0);
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { profile } = await getSessionWithProfile();
  const admin = createAdminClient();
  const settings = await getPlatformSettings();
  const params = await searchParams;
  const success = typeof params.success === 'string' ? params.success : null;
  const error = typeof params.error === 'string' ? params.error : null;

  if (profile && !(profile as any).welcome_bonus_granted) {
    const { data: authUser } = await admin.auth.admin.getUserById(profile.id);
    if (authUser.user?.email_confirmed_at) {
      await admin.from('profiles').update({
        wallet_balance: Number(profile.wallet_balance) + Number(settings?.welcome_bonus || 25),
        total_earned: Number(profile.total_earned) + Number(settings?.welcome_bonus || 25),
        welcome_bonus_granted: true
      }).eq('id', profile.id);
      await admin.from('transactions').insert({
        user_id: profile.id,
        transaction_type: 'welcome_bonus',
        amount: Number(settings?.welcome_bonus || 25),
        status: 'approved',
        description: 'Welcome bonus after verified email'
      });
      await admin.from('notifications').insert({
        user_id: profile.id,
        kind: 'bonus',
        title: 'Welcome bonus credited',
        message: `${formatCurrency(Number(settings?.welcome_bonus || 25))} was added after verification.`
      });
      profile.wallet_balance += Number(settings?.welcome_bonus || 25);
      profile.total_earned += Number(settings?.welcome_bonus || 25);
    }
  }

  const [{ data: userPlans }, { data: transactions }, { data: notifications }] = await Promise.all([
    admin.from('user_plans').select('*, plan:plans(*)').eq('user_id', profile!.id).order('created_at', { ascending: false }),
    admin.from('transactions').select('*').eq('user_id', profile!.id).order('created_at', { ascending: false }).limit(8),
    admin.from('notifications').select('*').eq('user_id', profile!.id).order('created_at', { ascending: false }).limit(5)
  ]);

  const activePlans = (userPlans || []).filter((plan) => plan.status === 'active');
  const referralBonus = (transactions || []).filter((tx) => tx.transaction_type === 'referral_bonus').reduce((sum, tx) => sum + Number(tx.amount), 0);

  return (
    <AppShell profile={profile!} brandName={settings?.default_brand_name || 'Pak Profit Hub'}>
      <div className="stack">
        {settings?.announcement_active && settings.announcement_text && <div className="notice">{settings.announcement_text}</div>}
        {success && <div className="notice success">{decodeURIComponent(success)}</div>}
        {error && <div className="notice error">{decodeURIComponent(error)}</div>}

        <section className="dashboard-grid">
          <div className="dash-card">
            <span className="muted small">Wallet balance</span>
            <strong>{formatCurrency(profile!.wallet_balance)}</strong>
          </div>
          <div className="dash-card">
            <span className="muted small">Total earned</span>
            <strong>{formatCurrency(profile!.total_earned)}</strong>
          </div>
          <div className="dash-card">
            <span className="muted small">Active plans</span>
            <strong>{activePlans.length}</strong>
          </div>
          <div className="dash-card">
            <span className="muted small">Referral bonus</span>
            <strong>{formatCurrency(referralBonus)}</strong>
          </div>
        </section>

        <section className="chart-row">
          <div className="feature-card chart-box">
            <p className="section-label">Overview</p>
            <h3 style={{ marginTop: 4 }}>Portfolio progress</h3>
            <svg className="chart-svg" viewBox="0 0 640 220" fill="none">
              <path d="M0 190 C70 170, 120 145, 180 150 S270 105, 330 92 450 74, 520 48 580 34, 640 24" stroke="#E63946" strokeWidth="4" strokeLinecap="round" />
              <path d="M0 190 C70 170, 120 145, 180 150 S270 105, 330 92 450 74, 520 48 580 34, 640 24 L640 220 L0 220 Z" fill="rgba(230,57,70,0.13)" />
            </svg>
            <p className="muted small">Chart baseline starts from zero only. No negative values are displayed anywhere.</p>
          </div>
          <div className="feature-card chart-box">
            <p className="section-label">Notifications</p>
            <h3 style={{ marginTop: 4 }}>Recent updates</h3>
            <div className="stack" style={{ marginTop: 16 }}>
              {(notifications || []).length === 0 && <p className="muted">No notifications yet.</p>}
              {(notifications || []).map((item) => (
                <div className="notice" key={item.id}>
                  <strong>{item.title}</strong>
                  <p className="muted small" style={{ margin: '6px 0 0' }}>{item.message}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="stack">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <p className="section-label">Active plans</p>
              <h3 style={{ marginTop: 4 }}>Collect earnings plan by plan</h3>
            </div>
            <Link href="/plans" className="btn btn-outline">Buy new plan</Link>
          </div>

          {activePlans.length === 0 ? (
            <div className="feature-card" style={{ textAlign: 'center' }}>
              <h3>No active plans yet</h3>
              <p className="muted">Once you fund your wallet, activate a package and collect every 24 hours.</p>
              <Link href="/plans" className="btn btn-primary">Explore plans</Link>
            </div>
          ) : (
            <div className="grid-3">
              {activePlans.map((plan) => {
                const elapsedDays = Math.floor((Date.now() - new Date(plan.started_at).getTime()) / (24 * 60 * 60 * 1000));
                const eligibleDays = Math.min(plan.duration_days, Math.max(elapsedDays, 0));
                const dueDays = Math.max(eligibleDays - plan.claimed_days, 0);
                const progress = Math.min((plan.collected_amount / plan.total_payout) * 100, 100);
                return (
                  <div className="plan-card" key={plan.id}>
                    <div className="plan-topbar" />
                    <span className="badge">{plan.plan?.name || 'Active plan'}</span>
                    <div className="plan-price">{formatCurrency(plan.invested_amount)}</div>
                    <div className="plan-meta">
                      <div className="meta-row"><span>Daily earning</span><strong>{formatCurrency(plan.daily_earning)}</strong></div>
                      <div className="meta-row"><span>Claimed amount</span><strong>{formatCurrency(plan.collected_amount)}</strong></div>
                      <div className="meta-row"><span>Days used</span><strong>{plan.claimed_days}/{plan.duration_days}</strong></div>
                      <div className="meta-row"><span>Time to next cycle</span><strong>{dueDays > 0 ? 'Ready now' : getCountdown(plan.started_at, plan.claimed_days)}</strong></div>
                    </div>
                    <div className="notice" style={{ marginBottom: 14 }}>
                      Progress: {progress.toFixed(0)}% • Pending collect days: {dueDays}
                    </div>
                    <form action={collectPlanAction}>
                      <input type="hidden" name="userPlanId" value={plan.id} />
                      <button className="btn btn-primary btn-block" type="submit">
                        {dueDays > 0 ? `Collect ${formatCurrency(Math.min(dueDays * plan.daily_earning, plan.total_payout - plan.collected_amount))}` : 'Waiting for 24h cycle'}
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="table-card">
          <div style={{ padding: 20 }}>
            <p className="section-label">Recent transactions</p>
            <h3 style={{ marginTop: 4 }}>Wallet activity</h3>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {(transactions || []).map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.transaction_type}</td>
                    <td>{tx.description}</td>
                    <td>{formatCurrency(tx.amount)}</td>
                    <td><span className={`status-pill ${tx.status}`}>{tx.status}</span></td>
                    <td>{formatDateTime(tx.created_at)}</td>
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
