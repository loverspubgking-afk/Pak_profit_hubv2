# Pak Profit Hub

Yeh project **Next.js + Supabase** par based ek **real backend web app** hai.

Isme:
- real signup/login flow
- real Supabase database
- real admin panel
- plans system
- deposit/withdraw workflow
- referral bonus
- welcome bonus
- branding/settings controls
- Netlify deploy support

shamil hai.

---

# Sab se pehle yeh samjho
Yeh project **seedha ZIP upload karke chalne wala static HTML project nahi hai**.
Yeh ek **full-stack web app** hai.

Isko live karne ke liye aapko yeh cheezen karni hongi:

1. Supabase project banana
2. SQL schema run karna
3. Env variables set karna
4. GitHub par code push karna
5. Netlify par deploy karna
6. First admin account banana
7. Admin panel se settings update karna

---

# Important files jo aapko zaroor parhni hain

## 1) Yeh file
- `README.md`

## 2) Supabase setup ki file
- `SUPABASE_SETUP_GUIDE.md`

## 3) Netlify deploy ki file
- `NETLIFY_DEPLOY_GUIDE.md`

## 4) Error aur problem solve karne ki file
- `TROUBLESHOOTING_ROMAN_URDU.md`

## 5) Final testing checklist
- `FINAL_MANUAL_CHECKLIST.md`

---

# Project me kya kya routes hain

- `/`
- `/about`
- `/login`
- `/signup`
- `/verify-email`
- `/dashboard`
- `/plans`
- `/deposit`
- `/withdraw`
- `/referral`
- `/transactions`
- `/leaderboard`
- `/profile`
- `/support`
- `/maintenance`
- `/admin`

---

# Quick overview - business logic

## Plans
- percentage system remove hai
- plans fixed-value par hain
- har plan me:
  - investment amount
  - daily earning
  - duration days
  - total payout

## Collect flow
- har plan ka apna 24-hour collect cycle hai
- agar user ke 2 plans active hain to 2 alag collect actions honge
- missed collect preserve hota hai

## Deposit
- manual admin approval

## Withdraw
- manual admin approval

## Referral
- first approved deposit ke baad referral bonus milta hai
- default bonus editable hai

## Welcome bonus
- verified email ke baad milta hai
- default editable hai

## Roles
- user
- staff_admin
- super_admin

---

# Full step-by-step setup

# STEP 1: Folder ko extract karo
Agar aap ZIP use kar rahe ho:
- `pak-profit-hub.zip` extract karo
- extracted folder ko open karo

Project root me aapko `package.json` nazar aana chahiye.

---

# STEP 2: Node.js install check karo
Aapke system me **Node.js 20** ya uske qareeb version hona chahiye.

Terminal me run karo:

```bash
node -v
npm -v
```

Agar Node install nahi hai to pehle Node.js install karo.

---

# STEP 3: Dependencies install karo
Project folder ke andar ja kar:

```bash
npm install
```

Agar successfully install ho jaye to next step par jao.

---

# STEP 4: Supabase project banao
Supabase dashboard kholo aur:
- New Project banao
- project name do
- strong database password do
- region choose karo
- project create karo

Iska detail `SUPABASE_SETUP_GUIDE.md` me diya hua hai.

---

# STEP 5: Supabase SQL schema run karo
Supabase dashboard me jao:
- SQL Editor kholo
- `supabase/schema.sql` ka pura content copy karo
- SQL Editor me paste karo
- Run karo

Yeh sab tables, roles, settings, plans, bucket waghera create karega.

Agar SQL me error aaye to `TROUBLESHOOTING_ROMAN_URDU.md` kholo.

---

# STEP 6: API keys nikaalo
Supabase dashboard me jao:
- Project Settings
- API

Yahan se yeh values copy karo:
- Project URL
- anon public key
- service_role key

**IMPORTANT:**
- `anon key` public frontend use ke liye hoti hai
- `service_role key` secret hoti hai
- service role key kabhi public share mat karo

---

# STEP 7: .env.local file banao
Project root me `.env.example` ke basis par `.env.local` banao.

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Local testing ke liye `NEXT_PUBLIC_SITE_URL` abhi localhost rahegi.

---

# STEP 8: Local project run karo

```bash
npm run dev
```

Phir browser me kholo:

- `http://localhost:3000`

Agar site open ho jaye to local setup theek hai.

---

# STEP 9: Test signup karo
Ab website par:
- signup page kholo
- ek naya account banao
- email verify karo
- phir login karo

Agar email verification nahi chal rahi to pehle `SUPABASE_SETUP_GUIDE.md` me URL config check karo.

---

# STEP 10: First super admin banao
Jab aap signup kar lo to Supabase me jao:
- SQL Editor kholo

Yeh query chalao:

```sql
update public.profiles
set role = 'super_admin'
where email = 'your-email@example.com';
```

Ab us account se login karke `/admin` kholo.

---

# STEP 11: Admin panel me first settings update karo
Super admin login ke baad:

## Sab se pehle yeh update karo:
- project/site name
- tagline
- hero title
- hero subtitle
- support email
- WhatsApp number
- Telegram URL
- min deposit
- min withdrawal
- referral bonus
- welcome bonus
- announcement text
- maintenance text

## Phir yeh update karo:
- plans values
- payment method details
- branding colors

---

# STEP 12: GitHub par code push karo
Agar live deploy karna hai to project ko GitHub repo me push karo.

Basic commands:

```bash
git init
git add .
git commit -m "Initial Pak Profit Hub setup"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

---

# STEP 13: Netlify par deploy karo
Detailed guide ke liye `NETLIFY_DEPLOY_GUIDE.md` kholo.

Short version:
- Netlify login karo
- New site from Git
- GitHub repo select karo
- env vars add karo
- deploy run karo

---

# STEP 14: Netlify env vars add karo
Netlify me same env vars add karni hain jo `.env.local` me hain:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Production me `NEXT_PUBLIC_SITE_URL` hoga:

```env
NEXT_PUBLIC_SITE_URL=https://your-site-name.netlify.app
```

---

# STEP 15: Supabase me production redirect URLs add karo
Supabase dashboard me jao:
- Authentication
- URL Configuration

Yeh URLs add karo:

```text
http://localhost:3000/verify-email
http://localhost:3000/login
https://your-site-name.netlify.app/verify-email
https://your-site-name.netlify.app/login
```

Agar custom domain use karoge to uske URLs bhi add karo.

---

# STEP 16: Live test karo
Deploy ke baad yeh order me test karo:

1. home page opens
2. signup works
3. email verify hoti hai
4. login works
5. dashboard open hota hai
6. super admin `/admin` open karta hai
7. plans nazar aate hain
8. deposit request submit hoti hai
9. admin approve deposit karta hai
10. wallet update hota hai
11. plan buy hota hai
12. collect button ka flow kaam karta hai
13. withdrawal request submit hoti hai
14. admin approve/reject karta hai
15. referral bonus trigger hota hai

---

# Agar aapko project me changes karne hain

## Branding change
Admin panel se:
- site name
- hero text
- color feel
- general wording

## Plan change
Admin panel se:
- investment amount
- daily earning
- duration
- total payout
- badge

## Bonus change
Admin panel se:
- referral bonus
- welcome bonus

---

# Kya cheezen aapko manually replace karni hongi
Go-live se pehle yeh dummy/default values replace karni hongi:

- support email
- WhatsApp number
- Telegram link
- EasyPaisa details
- JazzCash details
- bank details
- USDT wallet
- brand copy
- announcement text
- final plan values

---

# Recommended testing before public launch
Go-live se pehle yeh zaroor karo:

```bash
npm run build
```

Agar build pass ho jaye to code-level major issue kam honge.

Phir browser testing karo.

---

# Important warning
Agar aapne:
- env vars galat daali
- Supabase schema run nahi ki
- redirect URLs set nahi ki
- first admin promote nahi kiya

To deploy ke baad issues aayenge.

Is liye docs ko step-by-step follow karo.

---

# Next file jo abhi aapko parhni chahiye
Ab next yeh kholo:

## `SUPABASE_SETUP_GUIDE.md`

Usme Supabase ka full step-by-step setup diya hua hai.
