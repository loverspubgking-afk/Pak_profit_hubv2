import Link from 'next/link';
import { ArrowRight, BadgeDollarSign, ChartSpline, ShieldCheck, WalletCards } from 'lucide-react';
import { MarketingNav } from '@/components/marketing-nav';
import { createClient } from '@/lib/supabase/server';
import { formatCompactCurrency, formatCurrency } from '@/lib/utils';
import type { BrandSettings, Plan, PlatformSettings } from '@/lib/types';

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: brand }, { data: settings }, { data: plans }] = await Promise.all([
    supabase.from('brand_settings').select('*').eq('id', 1).maybeSingle(),
    supabase.from('platform_settings').select('*').eq('id', 1).maybeSingle(),
    supabase.from('plans').select('*').eq('is_active', true).order('sort_order').limit(3)
  ]);

  const brandData = brand as BrandSettings | null;
  const platform = settings as PlatformSettings | null;
  const featuredPlans = (plans || []) as Plan[];
  const brandName = brandData?.site_name || platform?.default_brand_name || 'Pak Profit Hub';

  if (platform?.maintenance_mode) {
    return (
      <div className="shell-container page-section" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div className="form-card" style={{ maxWidth: 680, textAlign: 'center' }}>
          <span className="badge">Maintenance Mode</span>
          <h1 className="section-title">We are currently upgrading {brandName}</h1>
          <p className="muted">{platform.maintenance_message || 'Please check back shortly.'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <MarketingNav brandName={brandName} />
      <section className="hero" id="home">
        <div className="shell-container hero-grid">
          <div className="hero-copy">
            <span className="badge">Trusted by fast-growing Pakistani investors</span>
            <h1>
              Daily earning platform built for <span className="hero-gradient">serious growth</span>
            </h1>
            <p className="muted" style={{ fontSize: 18 }}>
              {brandData?.hero_subtitle ||
                'Launch a premium investment web experience with fixed package values, manual approvals, referral rewards, and a professional admin backend.'}
            </p>
            <div className="hero-actions">
              <Link href="/signup" className="btn btn-primary">
                Start earning now <ArrowRight size={18} />
              </Link>
              <Link href="/plans" className="btn btn-outline">
                Explore packages
              </Link>
            </div>
            <div className="stats-row">
              <div className="stat-box">
                <strong>10,000+</strong>
                <span className="muted">Active users</span>
              </div>
              <div className="stat-box">
                <strong>PKR 50M+</strong>
                <span className="muted">Paid out</span>
              </div>
              <div className="stat-box">
                <strong>99.9%</strong>
                <span className="muted">System uptime</span>
              </div>
            </div>
          </div>
          <div className="hero-panel">
            <div className="mock-line" style={{ width: '38%' }} />
            <div className="mock-grid">
              <div className="mock-card">
                <span className="muted small">Wallet balance</span>
                <strong>{formatCurrency(28500)}</strong>
              </div>
              <div className="mock-card">
                <span className="muted small">Active plans</span>
                <strong>4</strong>
              </div>
            </div>
            <div className="mock-chart">
              <svg viewBox="0 0 480 220" fill="none">
                <path d="M0 190 C60 170, 90 120, 140 128 S240 95, 300 70 390 54, 480 20" stroke="#E63946" strokeWidth="4" strokeLinecap="round" />
                <path d="M0 190 C60 170, 90 120, 140 128 S240 95, 300 70 390 54, 480 20 L480 220 L0 220 Z" fill="url(#area)" opacity="0.35" />
                <defs>
                  <linearGradient id="area" x1="0" y1="0" x2="0" y2="220">
                    <stop offset="0%" stopColor="#E63946" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section" id="about">
        <div className="shell-container">
          <p className="section-label">How it works</p>
          <h2 className="section-title">Three steps from signup to daily collection</h2>
          <div className="grid-3" style={{ marginTop: 28 }}>
            {[
              ['Create account', 'Open your profile, verify email, and unlock the starter bonus.'],
              ['Fund your wallet', 'Submit a manual deposit and wait for admin approval.'],
              ['Buy and collect', 'Purchase fixed-value plans and collect every 24 hours per plan.']
            ].map(([title, text], idx) => (
              <div className="feature-card" key={title}>
                <div className="icon-wrap">{idx + 1}</div>
                <h3>{title}</h3>
                <p className="muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section-tight" id="plans">
        <div className="shell-container">
          <p className="section-label">Featured plans</p>
          <h2 className="section-title">Fixed-value earning packages</h2>
          <div className="grid-3" style={{ marginTop: 24 }}>
            {featuredPlans.map((plan) => (
              <div className="plan-card" key={plan.id}>
                <div className="plan-topbar" />
                <span className="badge">{plan.badge || 'Popular package'}</span>
                <h3 style={{ marginTop: 18 }}>{plan.name}</h3>
                <div className="plan-price">{formatCurrency(plan.investment_amount)}</div>
                <div className="plan-meta">
                  <div className="meta-row"><span>Daily earning</span><strong>{formatCurrency(plan.daily_earning)}</strong></div>
                  <div className="meta-row"><span>Duration</span><strong>{plan.duration_days} days</strong></div>
                  <div className="meta-row"><span>Total payout</span><strong>{formatCurrency(plan.total_payout)}</strong></div>
                </div>
                <Link href="/signup" className="btn btn-primary btn-block">Activate this package</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="shell-container">
          <p className="section-label">Why users stay</p>
          <h2 className="section-title">Built like a serious fintech experience</h2>
          <div className="grid-4" style={{ marginTop: 24 }}>
            {[
              { Icon: WalletCards, title: 'Manual deposit control', text: 'Every payment proof is verified inside a dedicated admin workflow.' },
              { Icon: ChartSpline, title: 'Plan-based daily earnings', text: 'Each plan keeps its own 24-hour earning cycle and maturity state.' },
              { Icon: BadgeDollarSign, title: 'Referral bonus engine', text: 'Referral rewards trigger after the first approved deposit.' },
              { Icon: ShieldCheck, title: 'Admin-grade controls', text: 'Super admin controls branding, packages, payments, and platform settings.' }
            ].map(({ Icon, title, text }) => (
              <div className="feature-card" key={title}>
                <div className="icon-wrap"><Icon size={22} /></div>
                <h3>{title}</h3>
                <p className="muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="support" className="page-section-tight" style={{ background: '#05050E' }}>
        <div className="shell-container">
          <div className="footer-grid">
            <div>
              <h3>{brandName}</h3>
              <p className="muted">Pakistan-focused daily earning platform with fixed package values and professional admin control.</p>
            </div>
            <div>
              <strong>Explore</strong>
              <div className="stack small muted" style={{ marginTop: 10 }}>
                <Link href="/plans">Plans</Link>
                <Link href="/signup">Register</Link>
                <Link href="/login">Login</Link>
              </div>
            </div>
            <div>
              <strong>Support</strong>
              <div className="stack small muted" style={{ marginTop: 10 }}>
                <a href={`mailto:${platform?.support_email || 'support@example.com'}`}>{platform?.support_email || 'support@example.com'}</a>
                <a href={platform?.telegram_url || '#'}>Telegram</a>
              </div>
            </div>
            <div>
              <strong>Quick data</strong>
              <div className="stack small muted" style={{ marginTop: 10 }}>
                <span>Min deposit: {formatCurrency(platform?.minimum_deposit || 280)}</span>
                <span>Min withdraw: {formatCurrency(platform?.minimum_withdrawal || 500)}</span>
                <span>Referral bonus: {formatCompactCurrency(platform?.referral_bonus || 100)}</span>
              </div>
            </div>
          </div>
          <div className="footer-note">
            <span>© 2026 {brandName}. All rights reserved.</span>
            <span>Built for Vercel + Supabase deployment.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
