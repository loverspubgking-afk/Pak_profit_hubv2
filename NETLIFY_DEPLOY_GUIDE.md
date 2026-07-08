# Netlify Deploy Guide - Roman English

Yeh file aapko step-by-step batayegi ke site ko **Netlify par live** kaise karna hai.

---

# STEP 1: Local side ready honi chahiye
Deploy se pehle ensure karo ke:
- `npm install` ho chuka hai
- `npm run build` local me pass ho chuka hai
- Supabase project ready hai
- SQL schema run ho chuki hai
- `.env.local` local testing me kaam kar rahi hai

Agar local build pass nahi hoti to deploy mat karo.

---

# STEP 2: GitHub repo banao
Agar repo nahi bana to GitHub par new repo banao.

Phir project root me terminal khol kar:

```bash
git init
git add .
git commit -m "Initial deploy-ready build"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

---

# STEP 3: Netlify par import karo
- Netlify login karo
- **Add new site** par click karo
- **Import from Git** choose karo
- GitHub connect karo
- apna repo select karo

---

# STEP 4: Build settings check karo
Project me `netlify.toml` already diya gaya hai.
Netlify mostly usko detect kar lega.

Agar manual pooche to yeh do:

## Build command
```bash
npm run build
```

## Publish directory
```text
.next
```

Plugin config already file me diya gaya hai.

---

# STEP 5: Environment variables add karo
Netlify me jao:
- **Site configuration**
- **Environment variables**

Yeh 4 add karo:

## Required env vars
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

## Example
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=https://your-site-name.netlify.app
```

### Important
`SUPABASE_SERVICE_ROLE_KEY` ko galat mat paste karna.
Agar yeh wrong hui to server-side actions fail honge.

---

# STEP 6: First deploy run karo
Env vars add karne ke baad:
- deploy trigger karo
- ya redeploy karo

Deploy complete hone do.

---

# STEP 7: Production URLs Supabase me add karo
Ab Supabase dashboard me jao:
- Authentication
- URL Configuration

Production URLs add karo:

```text
https://your-site-name.netlify.app/verify-email
https://your-site-name.netlify.app/login
```

Agar custom domain hai to:

```text
https://yourdomain.com/verify-email
https://yourdomain.com/login
```

---

# STEP 8: Live site open karo
Ab browser me Netlify URL kholo.

Test order:
1. home page
2. signup
3. email verification
4. login
5. dashboard

---

# STEP 9: Super admin promote karo
Agar local par nahi kiya to production signup ke baad:
- Supabase SQL Editor kholo

Run:

```sql
update public.profiles
set role = 'super_admin'
where email = 'your-email@example.com';
```

Phir login karke `/admin` kholo.

---

# STEP 10: Admin panel me live settings update karo
Go-live se pehle yeh update karna zaroori hai:

## Branding
- site name
- tagline
- hero title/subtitle

## Contact
- support email
- WhatsApp
- Telegram

## Business settings
- minimum deposit
- minimum withdrawal
- referral bonus
- welcome bonus
- announcement
- maintenance message

## Plans
- all plan prices
- daily earning
- total payout
- badges

## Payment methods
- EasyPaisa
- JazzCash
- bank
- USDT

---

# STEP 11: Final live testing
Production par yeh full flow test karo:

## User side
- signup
- verify email
- login
- deposit submit
- plan buy
- collect earning
- withdrawal request

## Admin side
- admin login
- deposit approve/reject
- withdrawal approve/reject
- brand settings save
- plan save
- user list open

---

# Agar Netlify build fail ho jaye to kya karo?

## Sab se pehle check karo:
1. kya env vars add ki thi?
2. kya `SUPABASE_SERVICE_ROLE_KEY` sahi hai?
3. kya `NEXT_PUBLIC_SITE_URL` sahi production URL hai?
4. kya schema run ho chuki hai?

## Build logs me agar env related error ho
Netlify logs khol kar error dekhna.
Phir env vars dobara check karo.

## Best fix process
1. env vars recheck
2. save
3. clear cache and redeploy

---

# Agar login / verify deploy par fail ho raha ho
## Usually reason
Supabase me redirect URLs missing hoti hain.

## Fix
Supabase me production URLs add karo.

---

# Agar deposit/withdraw actions fail ho rahi hain
## Usually reason
- service role key missing
- wrong service role key
- schema incomplete

## Fix
- env vars check karo
- SQL schema check karo
- bucket check karo

---

# Agar static pages khul rahi hain lekin dashboard/admin issue de raha hai
## Reason
Auth ya DB issue.

## Fix
- Supabase auth check
- profile role check
- first super admin query run karo

---

# Recommended safe deploy flow
1. Local setup complete
2. Local build pass
3. Supabase schema run
4. GitHub push
5. Netlify import
6. env vars add
7. production redirect URLs add
8. signup + admin promote
9. admin setup complete
10. final business testing
11. public launch

---

# Next file jo aapko parhni chahiye
Agar deploy ke baad koi error aaye to yeh kholo:

## `TROUBLESHOOTING_ROMAN_URDU.md`
