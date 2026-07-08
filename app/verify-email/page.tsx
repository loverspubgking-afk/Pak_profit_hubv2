import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const sent = params.sent === '1';

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div className="auth-card shell-card" style={{ maxWidth: 520, textAlign: 'center' }}>
        <BrandLogo height={56} brandName="Pak Profit Hub" />
        <h1 style={{ marginTop: 24 }}>Verify your email</h1>
        <p className="muted">
          {sent
            ? 'We sent a verification email to your inbox. Complete verification, then login to access your dashboard.'
            : 'Check your inbox for the verification message sent by Supabase Auth.'}
        </p>
        <div className="stack" style={{ marginTop: 18 }}>
          <div className="notice">If OTP mode is enabled in Supabase email templates, users can verify with a code-based flow.</div>
          <div className="notice">If OTP is not configured, the platform will use the secure verification link flow.</div>
        </div>
        <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link className="btn btn-primary" href="/login">Go to login</Link>
          <Link className="btn btn-ghost" href="/signup">Back to signup</Link>
        </div>
      </div>
    </div>
  );
}
