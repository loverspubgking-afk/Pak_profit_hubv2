import { AppShell } from '@/components/app-shell';
import { getPlatformSettings, getSessionWithProfile } from '@/lib/auth';

export default async function SupportPage() {
  const { profile } = await getSessionWithProfile();
  const settings = await getPlatformSettings();
  return (
    <AppShell profile={profile!} brandName={settings?.default_brand_name || 'Pak Profit Hub'}>
      <div className="stack">
        <div>
          <p className="section-label">Support</p>
          <h2 style={{ marginTop: 4 }}>Need help? Reach out directly</h2>
        </div>
        <div className="grid-3">
          <div className="feature-card">
            <h3>WhatsApp</h3>
            <p className="muted">Fastest route for deposit or withdrawal questions.</p>
            <a className="btn btn-primary" href={`https://wa.me/${(settings?.support_whatsapp || '').replace(/[^\d]/g, '')}`} target="_blank">Open WhatsApp</a>
          </div>
          <div className="feature-card">
            <h3>Email</h3>
            <p className="muted">For account, plan, or payout support.</p>
            <a className="btn btn-outline" href={`mailto:${settings?.support_email}`}>{settings?.support_email}</a>
          </div>
          <div className="feature-card">
            <h3>Telegram</h3>
            <p className="muted">Community or broadcast updates.</p>
            <a className="btn btn-ghost" href={settings?.telegram_url || '#'} target="_blank">Open Telegram</a>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
