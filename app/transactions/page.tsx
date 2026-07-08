import { AppShell } from '@/components/app-shell';
import { getPlatformSettings, getSessionWithProfile } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default async function TransactionsPage() {
  const { profile } = await getSessionWithProfile();
  const settings = await getPlatformSettings();
  const admin = createAdminClient();
  const { data: transactions } = await admin.from('transactions').select('*').eq('user_id', profile!.id).order('created_at', { ascending: false });

  return (
    <AppShell profile={profile!} brandName={settings?.default_brand_name || 'Pak Profit Hub'}>
      <div className="stack">
        <div>
          <p className="section-label">Transactions</p>
          <h2 style={{ marginTop: 4 }}>Full wallet history</h2>
        </div>
        <section className="table-card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
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
