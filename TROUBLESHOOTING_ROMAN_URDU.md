# Troubleshooting - Roman Urdu Guide

Yeh file un common problems ke liye hai jo setup ya deploy ke dauran aa sakti hain.

---

# Problem 1: `npm install` fail ho raha hai
## Possible reasons
- Node version old hai
- internet issue
- package manager cache issue

## Check karo
```bash
node -v
npm -v
```

## Fix
Node 20 use karo.
Phir:

```bash
rm -rf node_modules package-lock.json
npm install
```

Windows par PowerShell use kar rahe ho to manually folder delete bhi kar sakte ho.

---

# Problem 2: `npm run dev` chal nahi raha
## Check
Kya `.env.local` file bani hui hai?
Kya env vars sahi hain?

## Fix
`.env.local` me yeh 4 values honi chahiye:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Phir server dobara chalao:

```bash
npm run dev
```

---

# Problem 3: `npm run build` fail ho raha hai
## Sab se pehle
Terminal ka exact error dekho.

## Common reasons
- env vars missing
- TypeScript issue
- code me manual edit galat ho gaya

## Fix
1. `.env.local` check karo
2. latest project files use karo
3. phir run karo:

```bash
npm run build
```

Agar build local me fail ho raha hai to deploy par bhi fail hoga.

---

# Problem 4: Signup ho raha hai lekin email verify nahi aa rahi
## Possible reasons
- Supabase auth URLs set nahi
- email template issue
- spam folder

## Fix
Supabase me jao:
- Authentication
- URL Configuration

Add karo:

```text
http://localhost:3000/verify-email
http://localhost:3000/login
https://your-site-name.netlify.app/verify-email
https://your-site-name.netlify.app/login
```

Phir spam/junk folder check karo.

---

# Problem 5: Login ke baad dashboard nahi khul raha
## Possible reasons
- email verify nahi hui
- profile row create nahi hui
- schema run nahi hua

## Fix
### Step 1
Check karo `supabase/schema.sql` poori run hui thi ya nahi.

### Step 2
Supabase table `profiles` me dekho user row bani hai ya nahi.

### Step 3
Agar schema run nahi hui thi to dobara run karo.

---

# Problem 6: Admin panel open nahi ho raha
## Reason
User super admin nahi bana.

## Fix
Supabase SQL Editor me yeh query chalao:

```sql
update public.profiles
set role = 'super_admin'
where email = 'your-email@example.com';
```

Phir logout karo aur dobara login karo.

---

# Problem 7: Deposit submit ho rahi hai lekin screenshot upload nahi ho raha
## Possible reasons
- storage bucket create nahi hui
- storage policy issue
- file size/type issue

## Fix
### Step 1
Supabase me Storage kholo
Check karo bucket `payment-proofs` bani hai ya nahi.

### Step 2
Agar bucket missing hai to schema dobara run karo.

### Step 3
File image format me honi chahiye.

---

# Problem 8: Deposit approve karne par wallet update nahi ho raha
## Possible reasons
- admin action execute nahi hui
- database permission issue
- profile data mismatch

## Check
- `deposits` table me status changed?
- `transactions` me row bani?
- `profiles.wallet_balance` update hua?

## Fix
Aksar issue schema / policies / env key ka hota hai.
Check karo:
- `SUPABASE_SERVICE_ROLE_KEY` sahi set hai
- Netlify me bhi same env var add hai

---

# Problem 9: Withdrawal request ke baad amount minus nahi hua ya reject par wapas nahi aya
## Fix check
Yeh flow backend action se hota hai.
Check:
- `withdrawals` table
- `transactions` table
- `profiles.wallet_balance`

Agar mismatch ho to production se pehle test cycle complete karo.

---

# Problem 10: Referral bonus nahi mila
## Zaroori rules
Referral bonus tab milega jab:
- referred user signup kare
- uska relation save ho
- uska **first approved deposit** ho

## Check karo
1. referred user ke `profiles.referred_by` me correct referrer id saved hai?
2. deposit **approved** status me gaya?
3. pehla approved deposit tha ya doosra?

## Fix
Signup link me `?ref=CODE` sahi pass hona chahiye.

---

# Problem 11: Welcome bonus nahi mila
## Rule
Welcome bonus tab milega jab:
- user email verify kare
- phir dashboard flow run ho

## Check karo
- `profiles.welcome_bonus_granted`
- `auth.users.email_confirmed_at`

## Fix
Email verify karke login karo, phir dashboard kholo.

---

# Problem 12: Netlify deploy fail ho raha hai
## Common reasons
- env vars missing
- wrong build settings
- Supabase keys missing

## Check karo
Netlify me:
- build command: `npm run build`
- publish dir `.next`
- plugin active via `netlify.toml`

## Env vars check
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

## Fix
Env vars add karke site ko **redeploy** karo.

---

# Problem 13: Netlify par login/signup chal raha hai lekin verify email redirect toot raha hai
## Reason
Supabase Auth redirect URLs me production domain add nahi kiya.

## Fix
Supabase me:
- Authentication
- URL Configuration

Production URLs add karo.

---

# Problem 14: Maintenance mode on karne par admin bhi block ho gaya
## Expected behavior
Admin ko block nahi hona chahiye.

## Fix
Check karo user role sahi hai ya nahi:
- `staff_admin`
- `super_admin`

Agar role user hai to maintenance usay block karega.

---

# Problem 15: Payment method details wrong show ho rahi hain
## Fix
Admin panel me update karo ya DB me `payment_methods` table update karo.

---

# Problem 16: Branding change save nahi ho rahi
## Reason
Sirf `super_admin` branding change kar sakta hai.

## Fix
Check karo current account role kya hai.

---

# Problem 17: Staff admin ko zyada access chahiye ya kam chahiye
## Fix
Role logic app level par hai.
Agar future me permissions aur granular karni hon to alag permissions table ban sakta hai.
Abhi current model:
- super_admin = full control
- staff_admin = limited admin work

---

# Problem 18: Local me sab chal raha hai, live me issue aa raha hai
## Is order me check karo
1. Netlify env vars
2. Supabase redirect URLs
3. SQL schema run hui ya nahi
4. service role key correct hai ya nahi
5. production site URL correct hai ya nahi
6. super admin role correct hai ya nahi

---

# Best recovery method
Agar bohat confusion ho jaye to yeh reset style use karo:

## Step 1
Local project me:
```bash
npm install
npm run build
```

## Step 2
Supabase new project banao

## Step 3
`supabase/schema.sql` dobara run karo

## Step 4
fresh `.env.local` banao

## Step 5
phir local test karo

## Step 6
phir Netlify deploy karo

---

# Agar aapko phir bhi error aaye
Mujhe yeh 4 cheezen bhejna:
1. exact error text
2. kis step par error aya
3. local ya Netlify par aya
4. screenshot ya copied terminal output

Phir problem jaldi solve ho jayegi.
