import { BrandLogo } from '@/components/brand-logo';

export default function MaintenancePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}>
      <div className="form-card" style={{ maxWidth: 640 }}>
        <BrandLogo height={60} brandName="Pak Profit Hub" />
        <h1 className="section-title">Under maintenance</h1>
        <p className="muted">We are applying system updates. Please check again shortly.</p>
      </div>
    </div>
  );
}
