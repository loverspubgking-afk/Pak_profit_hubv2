import Link from 'next/link';
import { Bell, CreditCard, LayoutDashboard, LogOut, ShieldCheck, UserCircle, Wallet } from 'lucide-react';
import type { Profile } from '@/lib/types';
import { BrandLogo } from '@/components/brand-logo';
import { getInitials } from '@/lib/utils';
import { signOutAction } from '@/app/actions';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/plans', label: 'Plans', icon: CreditCard },
  { href: '/deposit', label: 'Deposit', icon: Wallet },
  { href: '/withdraw', label: 'Withdraw', icon: CreditCard },
  { href: '/transactions', label: 'Transactions', icon: Bell },
  { href: '/leaderboard', label: 'Leaderboard', icon: ShieldCheck },
  { href: '/profile', label: 'Profile', icon: UserCircle },
  { href: '/support', label: 'Support', icon: ShieldCheck }
];

export async function AppShell({ children, profile, brandName = 'Pak Profit Hub' }: { children: React.ReactNode; profile: Profile; brandName?: string }) {
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="sidebar-top">
          <BrandLogo brandName={brandName} />
          <p className="muted small">Premium daily earning web platform</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="sidebar-link">
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
          {profile.role !== 'user' && (
            <Link href="/admin" className="sidebar-link is-admin">
              <ShieldCheck size={18} />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>
        <div className="sidebar-user shell-card">
          <div className="avatar-badge">{getInitials(profile.full_name, profile.email)}</div>
          <div>
            <strong>{profile.full_name || profile.email?.split('@')[0]}</strong>
            <p>{profile.role.replace('_', ' ')}</p>
          </div>
        </div>
      </aside>
      <div className="app-content">
        <header className="topbar shell-card">
          <div>
            <p className="muted small">Welcome back</p>
            <h3>{profile.full_name || profile.email?.split('@')[0]}</h3>
          </div>
          <form action={signOutAction}>
            <button type="submit" className="btn btn-ghost btn-icon-text">
              <LogOut size={16} /> Sign out
            </button>
          </form>
        </header>
        <main className="content-area">{children}</main>
      </div>
      <nav className="mobile-nav shell-card">
        {navItems.slice(0, 5).map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="mobile-nav-link">
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
