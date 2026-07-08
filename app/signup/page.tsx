import Link from 'next/link';
import { AuthSubmitButton } from '@/components/auth-submit-button';
import { BrandLogo } from '@/components/brand-logo';
import { signUpAction } from '@/app/actions';

export default async function SignupPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const error = typeof params.error === 'string' ? params.error : null;
  const ref = typeof params.ref === 'string' ? params.ref : '';

  return (
    <div className="auth-shell">
      <div className="auth-side">
        <div>
          <BrandLogo height={60} brandName="Pak Profit Hub" />
          <h2 className="section-title" style={{ marginTop: 24 }}>Join a premium daily earning platform</h2>
          <p className="muted">Sign up, verify email, claim your welcome bonus, and activate fixed-value earning plans.</p>
          <div className="stack" style={{ marginTop: 28 }}>
            {['Fixed-value earning packages', 'Manual deposit review and secure controls', 'Referral bonus after first approved deposit'].map((item) => (
              <div className="notice" key={item}>{item}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="auth-card-wrap">
        <div className="auth-card shell-card">
          <h1 style={{ marginTop: 0 }}>Create account</h1>
          <p className="muted">Start your journey with a verified profile.</p>
          {error && <div className="notice error" style={{ marginTop: 14 }}>{decodeURIComponent(error)}</div>}
          <form action={signUpAction} style={{ marginTop: 20 }}>
            <div className="input-group">
              <label>Full name</label>
              <input className="input" type="text" name="fullName" required placeholder="Enter your full name" />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input className="input" type="email" name="email" required placeholder="you@example.com" />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input className="input" type="password" name="password" required minLength={8} placeholder="Minimum 8 characters" />
            </div>
            <div className="input-group">
              <label>Referral code (optional)</label>
              <input className="input" type="text" name="referralCode" defaultValue={ref} placeholder="Referral code" />
            </div>
            <AuthSubmitButton idle="Create account" loading="Creating account..." />
          </form>
          <div className="auth-meta muted small">
            Already registered? <Link href="/login" style={{ color: 'var(--accent-red)' }}>Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
