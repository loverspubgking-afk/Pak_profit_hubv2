# Final Manual Checklist

## Build checks already done locally
- `npm install` completed
- `npm run build` passed
- `npm run build` passed second time
- `npm run build` passed third time

## Manual checks you should do after connecting Supabase

### Public side
- Home page content and buttons
- About page
- Signup page
- Login page
- Verify email page

### User side
- Dashboard
- Plans page
- Deposit page
- Withdraw page
- Referral page
- Transactions page
- Profile page
- Support page
- Leaderboard page

### Admin side
- Admin access using promoted super admin
- Users table visible
- Plan creation works
- Deposit approve/reject works
- Withdrawal approve/reject works
- Branding save works
- Settings save works

## Critical business logic to test
- Welcome bonus only after verified email
- Referral bonus after first approved deposit only
- Multiple plans can be active
- Each plan has separate collect flow
- Missed collect is preserved
- Blocked user cannot continue
- Maintenance mode blocks non-admin users

## Payment details you must replace before public launch
- support email
- WhatsApp number
- Telegram link
- EasyPaisa details
- JazzCash details
- Bank details
- USDT wallet

## Branding you may change from admin panel
- project name
- hero text
- colors
- bonus values
- announcement text
