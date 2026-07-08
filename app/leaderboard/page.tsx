import { AppShell } from '@/components/app-shell';
import { getPlatformSettings, getSessionWithProfile } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatCurrency, getDisplayName } from '@/lib/utils';

export default async function LeaderboardPage() {
  const { profile } = await getSessionWithProfile();
  const settings = await getPlatformSettings();
  const admin = createAdminClient();
  const { data: leaders } = await admin.from('profiles').select('id, full_name, email, total_earned').order('total_earned', { ascending: false }).limit(20);

  return (
    <AppShell profile={profile!} brandName={settings?.default_brand_name || 'Pak Profit Hub'}>
      <div className="stack">
        <div>
          <p className="section-label">Leaderboard</p>
          <h2 style={{ marginTop: 4 }}>Top earners</h2>
        </div>
        <section className="table-card">
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Rank</th><th>User</th><th>Total earned</th></tr></thead>
              <tbody>
                {(leaders || []).map((user, index) => (
                  <tr key={user.id} style={user.id === profile!.id ? { background: 'rgba(230,57,70,0.08)' } : undefined}>
                    <td>#{index + 1}</td>
                    <td>{getDisplayName(user)} {user.id === profile!.id ? <span className="badge" style={{ marginLeft: 8 }}>You</span> : null}</td>
                    <td>{formatCurrency(user.total_earned || 0)}</td>
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
