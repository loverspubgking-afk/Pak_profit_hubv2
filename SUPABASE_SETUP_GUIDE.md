# Supabase Setup Guide - Roman English

Yeh file aapko **bilkul step-by-step** batayegi ke Supabase side par kya karna hai.

---

# STEP 1: Supabase account open karo
- Supabase dashboard kholo
- login karo
- agar account nahi hai to sign up karo

---

# STEP 2: New project banao
- **New Project** par click karo
- project name do, for example:
  - `pak-profit-hub`
- strong database password set karo
- nearest region choose karo
- create project

Project banne me thoda time lag sakta hai.

---

# STEP 3: API keys lo
Project open karo.
Phir jao:
- **Project Settings**
- **API**

Yahan se yeh copy karo:

## Required values
- Project URL
- anon public key
- service_role key

### Important
- `anon key` public side ke liye hoti hai
- `service_role key` secret hoti hai
- service role key ko kisi public file me mat dalo

---

# STEP 4: SQL schema run karo
Project me jao:
- **SQL Editor**
- New query

Ab project ke andar wali file kholo:
- `supabase/schema.sql`

Uska **poora content** copy karo.
Phir SQL Editor me paste karo.
Phir **Run** karo.

Yeh kaam karega:
- tables create
- enums create
- profile trigger create
- settings create
- default plans insert
- payment methods insert
- storage bucket create
- RLS policies set

Agar error aaye to `TROUBLESHOOTING_ROMAN_URDU.md` kholo.

---

# STEP 5: Check tables create hui ya nahi
Supabase me jao:
- **Table Editor**

Check karo yeh tables nazar aa rahi hon:
- profiles
- brand_settings
- platform_settings
- payment_methods
- plans
- user_plans
- deposits
- withdrawals
- transactions
- notifications

Agar yeh tables nahi bani to schema dobara run karo.

---

# STEP 6: Check storage bucket
Supabase me:
- **Storage**

Check karo bucket bani ho:
- `payment-proofs`

Agar nahi bani to schema dobara run karo.

---

# STEP 7: Auth URL configuration karo
Supabase me jao:
- **Authentication**
- **URL Configuration**

Yahan pehle local URLs daalo:

```text
http://localhost:3000/verify-email
http://localhost:3000/login
```

Baad me production deploy hone ke baad yeh bhi add karo:

```text
https://your-site-name.netlify.app/verify-email
https://your-site-name.netlify.app/login
```

Agar custom domain hai to woh bhi add karo.

---

# STEP 8: Email auth settings check karo
Supabase me:
- **Authentication**
- **Providers**
- **Email**

Yahan ensure karo ke email auth enabled ho.

## Verification flow
Project abhi normal Supabase email verification flow ke saath theek chalega.

## OTP note
Agar aap email OTP style chahte ho aur Supabase template me `{{ .Token }}` use karna chaho to woh bhi configure ho sakta hai.
Agar OTP template configure nahi karte to normal verification link flow kaam karega.

Abhi ke liye normal verification link easiest aur safest hai.

---

# STEP 9: Local env file ke liye values ready rakho
Ab `.env.local` me yeh values dalni hongi:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

# STEP 10: First user signup karo
Ab local app chalao:

```bash
npm run dev
```

Phir browser me:
- `/signup`

Yahan apna real email use karke signup karo.

---

# STEP 11: Email verify karo
Inbox kholo.
Verification email aayegi.
Uske through verify karo.

Agar email nahi aayi:
- spam folder check karo
- redirect URLs check karo
- email auth settings check karo

---

# STEP 12: First super admin banao
Signup ke baad aapka account normal user hota hai.
Admin banane ke liye SQL Editor me yeh chalao:

```sql
update public.profiles
set role = 'super_admin'
where email = 'your-email@example.com';
```

Agar staff admin bhi banana ho:

```sql
update public.profiles
set role = 'staff_admin'
where email = 'staff@example.com';
```

---

# STEP 13: Admin login test karo
Ab site me login karo.
Phir yeh open karo:
- `/admin`

Agar khul jaye to admin setup theek hai.

---

# STEP 14: Admin panel me kya kya update karna hai
Super admin login ke baad pehle yeh cheezen update karo:

## Branding
- site name
- site tagline
- hero title
- hero subtitle
- colors

## Platform settings
- support email
- support WhatsApp
- Telegram URL
- minimum deposit
- minimum withdrawal
- referral bonus
- welcome bonus
- announcement text
- maintenance message

## Plans
- investment amount
- daily earning
- duration days
- total payout
- badge
- active status

---

# STEP 15: Payment methods ko real data se replace karo
Default values ko replace karo:
- EasyPaisa number
- JazzCash number
- bank account details
- USDT wallet

Yeh admin panel ya directly DB se update ho sakta hai.

---

# STEP 16: Test full business flow
Ab yeh test karo:

1. signup
2. verify email
3. login
4. admin panel
5. deposit submit
6. deposit approve
7. wallet update
8. plan buy
9. collect earning
10. withdrawal submit
11. withdrawal approve/reject
12. referral bonus
13. welcome bonus

---

# Agar SQL run karte waqt issue aaye
Common reasons:
- project ready nahi hua tha
- duplicate objects pe issue
- partial run hua

## Fix
SQL Editor me schema dobara run karo.
Schema file me bohat jagah `if not exists` use hua hai, is liye safe hai.

---

# Important security note
## Kabhi bhi yeh chat/public repo me mat do:
- `SUPABASE_SERVICE_ROLE_KEY`

Yeh sirf env variable me rahegi.

---

# Supabase side complete hone ke baad next kya karna hai?
Ab next file kholo:

## `NETLIFY_DEPLOY_GUIDE.md`

Usme live deploy ka full step-by-step hai.
