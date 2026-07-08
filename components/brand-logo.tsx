import Link from 'next/link';

type BrandLogoProps = {
  height?: number;
  brandName?: string;
};

export function BrandLogo({ height = 40, brandName = 'Pak Profit Hub' }: BrandLogoProps) {
  return (
    <Link href="/" className="brand-logo" aria-label={brandName}>
      <svg viewBox="0 0 200 50" width={height * 3.8} height={height} role="img" aria-hidden="true">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#E63946" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
        </defs>
        <path
          d="M10 28 H40 L55 28 L68 12 L82 35 L96 22 L110 22 L126 22 L140 16 L152 10"
          fill="none"
          stroke="url(#logoGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M148 8 L152 10 L147 14" fill="none" stroke="url(#logoGradient)" strokeWidth="3" strokeLinecap="round" />
        <text x="165" y="22" fontFamily="Poppins, sans-serif" fontWeight="700" fontSize="20" fill="currentColor" textAnchor="end">
          {brandName.split(' ').slice(0, -1).join(' ') || 'Pak Profit'}
        </text>
        <text x="196" y="22" fontFamily="Poppins, sans-serif" fontWeight="700" fontSize="20" fill="#E63946" textAnchor="end">
          {brandName.split(' ').slice(-1).join(' ') || 'Hub'}
        </text>
      </svg>
    </Link>
  );
}
