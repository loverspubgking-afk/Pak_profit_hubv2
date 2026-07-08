import { AppShell } from '@/components/app-shell';
import { AuthSubmitButton } from '@/components/auth-submit-button';
import { submitDepositAction } from '@/app/actions';
import { getPlatformSettings, getSessionWithProfile } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function DepositPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { profile } = await getSessionWithProfile();
  const settings = await getPlatformSettings();
  const admin = createAdminClient();
  const params = await searchParams;
  const message = typeof params.success === 'string' ? params.success : typeof params.error === 'string' ? params.error : null;
  const type = params.success ? 'success' : params.error ? 'error' : null;
  const { data: paymentMethods } = await admin.from('payment_methods').select('*').eq('is_active', true).order('sort_order');

  return (
    <AppShell profile={profile!} brandName={settings?.default_brand_name || 'Pak Profit Hub'}>
      <div className="stack">
        <div>
          <p className="section-label">Deposit</p>
          <h2 style={{ marginTop: 4 }}>Fund your wallet</h2>
        </div>
        {message && <div className={`notice ${type === 'error' ? 'error' : 'success'}`}>{decodeURIComponent(message)}</div>}
        <div className="form-grid">
          <div className="form-card stack">
            <h3>Approved payment methods</h3>
            {(paymentMethods || []).map((method) => (
              <div className="notice" key={method.id}>
                <strong>{method.label}</strong>
                <p className="muted small" style={{ margin: '6px 0 0' }}>{method.public_details}</p>
              </div>
            ))}
          </div>
          <div className="form-card">
            <h3>Submit deposit proof</h3>
            <form action={submitDepositAction} className="stack" style={{ marginTop: 16 }}>
              <div className="input-group">
                <label>Amount</label>
                <input className="input" type="number" min={settings?.minimum_deposit || 280} name="amount" required />
              </div>
              <div className="input-group">
                <label>Payment method</label>
                <select className="select" name="paymentMethod" required>
                  {(paymentMethods || []).map((method) => <option key={method.id} value={method.label}>{method.label}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Reference number</label>
                <input className="input" type="text" name="referenceNumber" required />
              </div>
              <div className="input-group">
                <label>Payment screenshot</label>
                <input className="input" type="file" name="screenshot" accept="image/*" required />
              </div>
              <AuthSubmitButton idle="Submit deposit" loading="Submitting..." />
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
