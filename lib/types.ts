export type UserRole = 'user' | 'staff_admin' | 'super_admin';
export type UserStatus = 'active' | 'blocked';
export type UserPlanStatus = 'active' | 'completed' | 'cancelled';
export type DepositStatus = 'pending' | 'approved' | 'rejected';
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';
export type NotificationKind = 'system' | 'deposit' | 'withdrawal' | 'earning' | 'referral' | 'bonus' | 'admin';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  wallet_balance: number;
  total_earned: number;
  referral_code: string;
  referred_by: string | null;
  avatar_url: string | null;
  welcome_bonus_granted?: boolean;
  created_at: string;
}

export interface BrandSettings {
  id: number;
  site_name: string;
  site_tagline: string;
  logo_mark: string | null;
  primary_color: string;
  accent_color: string;
  hero_title: string;
  hero_subtitle: string;
}

export interface PlatformSettings {
  id: number;
  support_email: string;
  support_whatsapp: string;
  telegram_url: string | null;
  minimum_deposit: number;
  minimum_withdrawal: number;
  referral_bonus: number;
  welcome_bonus: number;
  maintenance_mode: boolean;
  maintenance_message: string | null;
  announcement_active: boolean;
  announcement_text: string | null;
  default_brand_name: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  investment_amount: number;
  daily_earning: number;
  duration_days: number;
  total_payout: number;
  badge: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface UserPlan {
  id: string;
  user_id: string;
  plan_id: string;
  invested_amount: number;
  daily_earning: number;
  duration_days: number;
  total_payout: number;
  collected_amount: number;
  claimed_days: number;
  started_at: string;
  ends_at: string;
  status: UserPlanStatus;
  created_at: string;
  plan?: Plan;
}

export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  reference_number: string;
  screenshot_url: string | null;
  status: DepositStatus;
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  profiles?: Pick<Profile, 'full_name' | 'email'>;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  account_title: string;
  account_number: string;
  status: WithdrawalStatus;
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  profiles?: Pick<Profile, 'full_name' | 'email'>;
}

export interface Transaction {
  id: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  status: string;
  description: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  kind: NotificationKind;
  read_at: string | null;
  created_at: string;
}

export interface DashboardStats {
  balance: number;
  totalEarned: number;
  activePlans: number;
  referralBonus: number;
}
