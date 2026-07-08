'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSessionWithProfile, requireRole } from '@/lib/auth';
import { formatCurrency } from '@/lib/utils';

async function assertAdmin() {
  return requireRole(['super_admin', 'staff_admin']);
}

async function assertSuperAdmin() {
  return requireRole(['super_admin']);
}

function cleanText(value: FormDataEntryValue | null) {
  return String(value || '').trim();
}

export async function signUpAction(formData: FormData) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const fullName = cleanText(formData.get('fullName'));
  const email = cleanText(formData.get('email')).toLowerCase();
  const password = cleanText(formData.get('password'));
  const referralCode = cleanText(formData.get('referralCode'));

  let referredBy: string | null = null;
  if (referralCode) {
    const { data: refProfile } = await admin.from('profiles').select('id').eq('referral_code', referralCode).maybeSingle();
    referredBy = refProfile?.id ?? null;
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email`,
      data: {
        full_name: fullName,
        referred_by: referredBy
      }
    }
  });

  if (error) redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  redirect('/verify-email?sent=1');
}

export async function signInAction(formData: FormData) {
  const supabase = await createClient();
  const email = cleanText(formData.get('email')).toLowerCase();
  const password = cleanText(formData.get('password'));

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect('/dashboard');
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function buyPlanAction(formData: FormData) {
  const { profile } = await getSessionWithProfile();
  const admin = createAdminClient();
  const planId = cleanText(formData.get('planId'));

  const { data: plan } = await admin.from('plans').select('*').eq('id', planId).eq('is_active', true).single();
  if (!plan) redirect('/plans?error=Plan not found');
  if ((profile?.wallet_balance ?? 0) < plan.investment_amount) {
    redirect('/plans?error=Insufficient wallet balance');
  }

  const now = new Date();
  const endsAt = new Date(now.getTime() + plan.duration_days * 24 * 60 * 60 * 1000).toISOString();

  await admin.from('user_plans').insert({
    user_id: profile!.id,
    plan_id: plan.id,
    invested_amount: plan.investment_amount,
    daily_earning: plan.daily_earning,
    duration_days: plan.duration_days,
    total_payout: plan.total_payout,
    claimed_days: 0,
    collected_amount: 0,
    status: 'active',
    started_at: now.toISOString(),
    ends_at: endsAt
  });

  await admin
    .from('profiles')
    .update({ wallet_balance: (profile?.wallet_balance ?? 0) - plan.investment_amount })
    .eq('id', profile!.id);

  await admin.from('transactions').insert({
    user_id: profile!.id,
    transaction_type: 'plan_purchase',
    amount: plan.investment_amount,
    status: 'approved',
    description: `Purchased ${plan.name} plan`
  });

  await admin.from('notifications').insert({
    user_id: profile!.id,
    kind: 'system',
    title: 'Plan activated',
    message: `${plan.name} is now active in your dashboard.`
  });

  revalidatePath('/dashboard');
  revalidatePath('/plans');
  redirect('/dashboard?success=Plan activated');
}

export async function collectPlanAction(formData: FormData) {
  const { profile } = await getSessionWithProfile();
  const admin = createAdminClient();
  const userPlanId = cleanText(formData.get('userPlanId'));

  const { data: userPlan } = await admin
    .from('user_plans')
    .select('*, plan:plans(name)')
    .eq('id', userPlanId)
    .eq('user_id', profile!.id)
    .single();

  if (!userPlan) redirect('/dashboard?error=Plan not found');

  const startedAt = new Date(userPlan.started_at).getTime();
  const now = Date.now();
  const elapsedDays = Math.floor((now - startedAt) / (24 * 60 * 60 * 1000));
  const eligibleDays = Math.min(userPlan.duration_days, Math.max(elapsedDays, 0));
  const dueDays = eligibleDays - userPlan.claimed_days;

  if (dueDays <= 0) redirect('/dashboard?error=No earning ready yet');

  const baseDue = dueDays * Number(userPlan.daily_earning);
  const remainingToMaturity = Number(userPlan.total_payout) - Number(userPlan.collected_amount);
  const collectAmount = Math.min(baseDue, remainingToMaturity);
  const nextClaimedDays = userPlan.claimed_days + dueDays;
  const completed = nextClaimedDays >= userPlan.duration_days || Number(userPlan.collected_amount) + collectAmount >= Number(userPlan.total_payout);

  await admin
    .from('user_plans')
    .update({
      claimed_days: nextClaimedDays,
      collected_amount: Number(userPlan.collected_amount) + collectAmount,
      status: completed ? 'completed' : 'active'
    })
    .eq('id', userPlan.id);

  await admin
    .from('profiles')
    .update({
      wallet_balance: Number(profile!.wallet_balance) + collectAmount,
      total_earned: Number(profile!.total_earned) + collectAmount
    })
    .eq('id', profile!.id);

  await admin.from('transactions').insert({
    user_id: profile!.id,
    transaction_type: completed ? 'maturity_collect' : 'daily_collect',
    amount: collectAmount,
    status: 'approved',
    description: `${dueDays} day(s) collected from ${userPlan.plan?.name ?? 'plan'}`
  });

  await admin.from('notifications').insert({
    user_id: profile!.id,
    kind: 'earning',
    title: completed ? 'Plan completed' : 'Daily earning collected',
    message: `${formatCurrency(collectAmount)} has been added to your wallet.`
  });

  revalidatePath('/dashboard');
  redirect('/dashboard?success=Collect completed');
}

export async function submitDepositAction(formData: FormData) {
  const { profile } = await getSessionWithProfile();
  const admin = createAdminClient();
  const amount = Number(cleanText(formData.get('amount')));
  const paymentMethod = cleanText(formData.get('paymentMethod'));
  const referenceNumber = cleanText(formData.get('referenceNumber'));
  const screenshot = formData.get('screenshot') as File | null;

  let screenshotUrl: string | null = null;
  if (screenshot && screenshot.size > 0) {
    const ext = screenshot.name.split('.').pop() || 'jpg';
    const filePath = `${profile!.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const arrayBuffer = await screenshot.arrayBuffer();
    const { error: uploadError } = await admin.storage
      .from('payment-proofs')
      .upload(filePath, Buffer.from(arrayBuffer), { contentType: screenshot.type, upsert: false });
    if (uploadError) redirect(`/deposit?error=${encodeURIComponent(uploadError.message)}`);
    const { data } = admin.storage.from('payment-proofs').getPublicUrl(filePath);
    screenshotUrl = data.publicUrl;
  }

  await admin.from('deposits').insert({
    user_id: profile!.id,
    amount,
    payment_method: paymentMethod,
    reference_number: referenceNumber,
    screenshot_url: screenshotUrl,
    status: 'pending'
  });

  await admin.from('notifications').insert({
    user_id: profile!.id,
    kind: 'deposit',
    title: 'Deposit submitted',
    message: 'Your deposit request is now waiting for admin approval.'
  });

  revalidatePath('/deposit');
  redirect('/deposit?success=Deposit submitted');
}

export async function submitWithdrawalAction(formData: FormData) {
  const { profile } = await getSessionWithProfile();
  const admin = createAdminClient();
  const amount = Number(cleanText(formData.get('amount')));
  const paymentMethod = cleanText(formData.get('paymentMethod'));
  const accountTitle = cleanText(formData.get('accountTitle'));
  const accountNumber = cleanText(formData.get('accountNumber'));

  if ((profile?.wallet_balance ?? 0) < amount) redirect('/withdraw?error=Insufficient wallet balance');

  await admin.from('withdrawals').insert({
    user_id: profile!.id,
    amount,
    payment_method: paymentMethod,
    account_title: accountTitle,
    account_number: accountNumber,
    status: 'pending'
  });

  await admin.from('profiles').update({ wallet_balance: Number(profile!.wallet_balance) - amount }).eq('id', profile!.id);
  await admin.from('transactions').insert({
    user_id: profile!.id,
    transaction_type: 'withdrawal_request',
    amount,
    status: 'pending',
    description: `Withdrawal request via ${paymentMethod}`
  });
  await admin.from('notifications').insert({
    user_id: profile!.id,
    kind: 'withdrawal',
    title: 'Withdrawal submitted',
    message: 'Your withdrawal is pending review by the admin team.'
  });

  revalidatePath('/withdraw');
  redirect('/withdraw?success=Withdrawal submitted');
}

export async function updateProfileAction(formData: FormData) {
  const { profile } = await getSessionWithProfile();
  const admin = createAdminClient();
  await admin.from('profiles').update({ full_name: cleanText(formData.get('fullName')) }).eq('id', profile!.id);
  revalidatePath('/profile');
  redirect('/profile?success=Profile updated');
}

export async function updateBrandSettingsAction(formData: FormData) {
  await assertSuperAdmin();
  const admin = createAdminClient();
  await admin.from('brand_settings').upsert({
    id: 1,
    site_name: cleanText(formData.get('siteName')),
    site_tagline: cleanText(formData.get('siteTagline')),
    hero_title: cleanText(formData.get('heroTitle')),
    hero_subtitle: cleanText(formData.get('heroSubtitle')),
    primary_color: cleanText(formData.get('primaryColor')) || '#E63946',
    accent_color: cleanText(formData.get('accentColor')) || '#FFD700'
  });
  revalidatePath('/');
  revalidatePath('/admin');
  redirect('/admin?tab=branding&success=Brand updated');
}

export async function updatePlatformSettingsAction(formData: FormData) {
  await assertSuperAdmin();
  const admin = createAdminClient();
  await admin.from('platform_settings').upsert({
    id: 1,
    support_email: cleanText(formData.get('supportEmail')),
    support_whatsapp: cleanText(formData.get('supportWhatsApp')),
    telegram_url: cleanText(formData.get('telegramUrl')),
    minimum_deposit: Number(cleanText(formData.get('minimumDeposit'))),
    minimum_withdrawal: Number(cleanText(formData.get('minimumWithdrawal'))),
    referral_bonus: Number(cleanText(formData.get('referralBonus'))),
    welcome_bonus: Number(cleanText(formData.get('welcomeBonus'))),
    announcement_active: formData.get('announcementActive') === 'on',
    announcement_text: cleanText(formData.get('announcementText')),
    maintenance_mode: formData.get('maintenanceMode') === 'on',
    maintenance_message: cleanText(formData.get('maintenanceMessage')),
    default_brand_name: cleanText(formData.get('defaultBrandName')) || 'Pak Profit Hub'
  });
  revalidatePath('/');
  revalidatePath('/admin');
  redirect('/admin?tab=settings&success=Settings updated');
}

export async function createOrUpdatePlanAction(formData: FormData) {
  await assertSuperAdmin();
  const admin = createAdminClient();
  const id = cleanText(formData.get('id'));
  const payload = {
    name: cleanText(formData.get('name')),
    slug: cleanText(formData.get('slug')),
    investment_amount: Number(cleanText(formData.get('investmentAmount'))),
    daily_earning: Number(cleanText(formData.get('dailyEarning'))),
    duration_days: Number(cleanText(formData.get('durationDays'))),
    total_payout: Number(cleanText(formData.get('totalPayout'))),
    badge: cleanText(formData.get('badge')) || null,
    is_active: formData.get('isActive') === 'on',
    sort_order: Number(cleanText(formData.get('sortOrder')) || '0')
  };

  if (id) await admin.from('plans').update(payload).eq('id', id);
  else await admin.from('plans').insert(payload);

  revalidatePath('/plans');
  revalidatePath('/admin');
  redirect('/admin?tab=plans&success=Plan saved');
}

export async function approveDepositAction(formData: FormData) {
  const actor = await assertAdmin();
  const admin = createAdminClient();
  const depositId = cleanText(formData.get('depositId'));

  const { data: deposit } = await admin.from('deposits').select('*').eq('id', depositId).single();
  if (!deposit || deposit.status !== 'pending') redirect('/admin?tab=deposits&error=Invalid deposit');

  const { data: profile } = await admin.from('profiles').select('*').eq('id', deposit.user_id).single();
  await admin.from('deposits').update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: actor.id }).eq('id', depositId);
  await admin.from('profiles').update({ wallet_balance: Number(profile.wallet_balance) + Number(deposit.amount) }).eq('id', deposit.user_id);
  await admin.from('transactions').insert({
    user_id: deposit.user_id,
    transaction_type: 'deposit',
    amount: deposit.amount,
    status: 'approved',
    description: `Deposit approved via ${deposit.payment_method}`
  });

  const { count } = await admin.from('deposits').select('*', { count: 'exact', head: true }).eq('user_id', deposit.user_id).eq('status', 'approved');
  if ((count || 0) === 1 && profile.referred_by) {
    const { data: settings } = await admin.from('platform_settings').select('referral_bonus').eq('id', 1).single();
    await admin.from('profiles').update({
      wallet_balance: Number((await admin.from('profiles').select('wallet_balance').eq('id', profile.referred_by).single()).data?.wallet_balance || 0) + Number(settings?.referral_bonus || 100),
      total_earned: Number((await admin.from('profiles').select('total_earned').eq('id', profile.referred_by).single()).data?.total_earned || 0) + Number(settings?.referral_bonus || 100)
    }).eq('id', profile.referred_by);
    await admin.from('transactions').insert({
      user_id: profile.referred_by,
      transaction_type: 'referral_bonus',
      amount: Number(settings?.referral_bonus || 100),
      status: 'approved',
      description: 'Referral bonus after first approved deposit'
    });
    await admin.from('notifications').insert({
      user_id: profile.referred_by,
      kind: 'referral',
      title: 'Referral bonus credited',
      message: `${formatCurrency(Number(settings?.referral_bonus || 100))} has been added after your referral made a deposit.`
    });
  }

  await admin.from('notifications').insert({
    user_id: deposit.user_id,
    kind: 'deposit',
    title: 'Deposit approved',
    message: `${formatCurrency(deposit.amount)} has been added to your wallet.`
  });

  revalidatePath('/admin');
  redirect('/admin?tab=deposits&success=Deposit approved');
}

export async function rejectDepositAction(formData: FormData) {
  const actor = await assertAdmin();
  const admin = createAdminClient();
  const depositId = cleanText(formData.get('depositId'));
  const note = cleanText(formData.get('note'));
  const { data: deposit } = await admin.from('deposits').select('*').eq('id', depositId).single();
  if (!deposit) redirect('/admin?tab=deposits&error=Deposit not found');

  await admin.from('deposits').update({ status: 'rejected', admin_note: note, reviewed_at: new Date().toISOString(), reviewed_by: actor.id }).eq('id', depositId);
  await admin.from('notifications').insert({
    user_id: deposit.user_id,
    kind: 'deposit',
    title: 'Deposit rejected',
    message: note || 'Your deposit request was rejected by admin review.'
  });
  revalidatePath('/admin');
  redirect('/admin?tab=deposits&success=Deposit rejected');
}

export async function approveWithdrawalAction(formData: FormData) {
  const actor = await assertAdmin();
  const admin = createAdminClient();
  const withdrawalId = cleanText(formData.get('withdrawalId'));
  const { data: withdrawal } = await admin.from('withdrawals').select('*').eq('id', withdrawalId).single();
  if (!withdrawal) redirect('/admin?tab=withdrawals&error=Withdrawal not found');

  await admin.from('withdrawals').update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: actor.id }).eq('id', withdrawalId);
  await admin.from('transactions').insert({
    user_id: withdrawal.user_id,
    transaction_type: 'withdrawal',
    amount: withdrawal.amount,
    status: 'approved',
    description: `Withdrawal approved via ${withdrawal.payment_method}`
  });
  await admin.from('notifications').insert({
    user_id: withdrawal.user_id,
    kind: 'withdrawal',
    title: 'Withdrawal approved',
    message: `${formatCurrency(withdrawal.amount)} has been approved for payout.`
  });
  revalidatePath('/admin');
  redirect('/admin?tab=withdrawals&success=Withdrawal approved');
}

export async function rejectWithdrawalAction(formData: FormData) {
  const actor = await assertAdmin();
  const admin = createAdminClient();
  const withdrawalId = cleanText(formData.get('withdrawalId'));
  const note = cleanText(formData.get('note'));
  const { data: withdrawal } = await admin.from('withdrawals').select('*').eq('id', withdrawalId).single();
  const { data: profile } = await admin.from('profiles').select('wallet_balance').eq('id', withdrawal.user_id).single();

  await admin.from('withdrawals').update({ status: 'rejected', admin_note: note, reviewed_at: new Date().toISOString(), reviewed_by: actor.id }).eq('id', withdrawalId);
  await admin.from('profiles').update({ wallet_balance: Number(profile?.wallet_balance || 0) + Number(withdrawal.amount) }).eq('id', withdrawal.user_id);
  await admin.from('notifications').insert({
    user_id: withdrawal.user_id,
    kind: 'withdrawal',
    title: 'Withdrawal rejected',
    message: note || 'Your withdrawal request was rejected and funds were returned to wallet.'
  });
  revalidatePath('/admin');
  redirect('/admin?tab=withdrawals&success=Withdrawal rejected');
}
