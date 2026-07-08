import { AppShell } from '@/components/app-shell';
import { AuthSubmitButton } from '@/components/auth-submit-button';
import { submitWithdrawalAction } from '@/app/actions';
import { getPlatformSettings, getSessionWithProfile } from '@/lib/auth';
import { formatCurrency } from '@/lib/utils';

export default async function WithdrawPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { profile } = await getSessionWithProfile();
  const settings = await getPlatformSettings();
  const params = await searchParams;
  const message = typeof params.success === 'string' ? params.success : typeof params.error === 'string' ? params.error : null;
  const type = params.success ? 'success' : params.error ? 'error' : null;

  return (
    <AppShell profile={profile!} brandName={settings?.default_brand_name || 'Pak Profit Hub'}>
      <div className="stack">
        <div className="feature-card">
          <p className="section-label">Withdraw</p>
          <h2 style={{ marginTop: 4 }}>Request a payout</h2>
          <p className="muted">Available wallet balance: <strong>{formatCurrency(profile!.wallet_balance)}</strong></p>
        </div>
        {message && <div className={`notice ${type === 'error' ? 'error' : 'success'}`}>{decodeURIComponent(message)}</div>}
        <div className="form-card">
          <form action={submitWithdrawalAction} className="stack">
            <div className="form-grid">
              <div className="input-group">
                <label>Amount</label>
                <input className="input" type="number" min={settings?.minimum_withdrawal || 500} max={profile!.wallet_balance} name="amount" required />
              </div>
              <div className="input-group">
                <label>Method</label>
                <select className="select" name="paymentMethod" required>
                  <option>EasyPaisa</option>
                  <option>JazzCash</option>
                  <option>Bank Transfer</option>
                  <option>USDT</option>
                </select>
              </div>
              <div className="input-group">
                <label>Account title</label>
                <input className="input" type="text" name="accountTitle" required />
              </div>
              <div className="input-group">
                <label>Account number / wallet</label>
                <input className="input" type="text" name="accountNumber" required />
              </div>
            </div>
            <AuthSubmitButton idle="Request withdrawal" loading="Submitting..." />
          </form>
        </div>
      </div>
    </AppShell>
  );
}
