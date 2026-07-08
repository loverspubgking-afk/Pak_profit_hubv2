import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';

export function MarketingNav({ brandName = 'Pak Profit Hub' }: { brandName?: string }) {
  return (
    <header className="marketing-nav shell-card">
      <div className="shell-container nav-inner">
        <BrandLogo brandName={brandName} />
        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#plans">Plans</a>
          <a href="#support">Support</a>
        </nav>
        <div className="nav-actions">
          <Link className="btn btn-ghost" href="/login">
            Login
          </Link>
          <Link className="btn btn-primary" href="/signup">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
