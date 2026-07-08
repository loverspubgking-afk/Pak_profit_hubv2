import { MarketingNav } from '@/components/marketing-nav';
import { createClient } from '@/lib/supabase/server';
import type { BrandSettings, PlatformSettings } from '@/lib/types';

export default async function AboutPage() {
  const supabase = await createClient();
  const [{ data: brand }, { data: settings }] = await Promise.all([
    supabase.from('brand_settings').select('*').eq('id', 1).maybeSingle(),
    supabase.from('platform_settings').select('*').eq('id', 1).maybeSingle()
  ]);

  const brandData = brand as BrandSettings | null;
  const platform = settings as PlatformSettings | null;
  const brandName = brandData?.site_name || platform?.default_brand_name || 'Pak Profit Hub';

  return (
    <>
      <MarketingNav brandName={brandName} />
      <section className="page-section">
        <div className="shell-container stack">
          <div>
            <p className="section-label">About</p>
            <h1 className="section-title">About {brandName}</h1>
            <p className="muted">A premium Pakistani web platform focused on structured plans, fixed daily earning, and professional admin controls.</p>
          </div>
          <div className="feature-card">
            <h3>Our platform model</h3>
            <p className="muted">Users create verified accounts, fund their wallets through manually approved payment channels, activate fixed-value plans, and collect plan earnings on a 24-hour cycle. Every plan is tracked separately with a real backend workflow.</p>
          </div>
          <div className="grid-3">
            <div className="feature-card"><h3>Trust</h3><p className="muted">Manual approvals, role-based admin workflows, and server-backed records.</p></div>
            <div className="feature-card"><h3>Control</h3><p className="muted">Super admin can manage branding, settings, bonuses, plans, and payment methods.</p></div>
            <div className="feature-card"><h3>Growth</h3><p className="muted">Users can activate multiple plans and reuse wallet balance for future packages.</p></div>
          </div>
        </div>
      </section>
    </>
  );
}
