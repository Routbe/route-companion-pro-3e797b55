# ROUT roadmap

## In progress
- [x] Claim-root UX, Brevo status, admin audit log, DNS cron (grotendeels al aanwezig)
- [x] Homepage showcase: dual-tier switcher + mobiele compactie
- [x] Admin metrics fix (unieke pending verificaties, totaal profielen)
- [x] Gebruikersdirectory: zoeken op e-mail/alias/datum + IP-locatiebadge (db/24)
- [x] Crashfix: `QrsPanel` sorteren op `created_at` (Date-waarden)
- [x] `.env.example` + `src/lib/env.ts` validatie
- [x] Stripe webhook: checkout.session.completed → pro/verified, account.updated
- [x] Admin widget "Environment & API Health Status"
- [x] Studio sticky/z-index fix + laptop chassis mockup + iframe scrollbars
- [x] Tests claim-root (401, rate limit, 409, audit insert)
- [x] Veiligheidscheck + tsgo

## Adminportaal (nieuw)
- [x] db/28: admin_permissions, user_feature_blocks, legal_first_name/legal_last_name
- [x] Deelrechten (verifiëren, namen, promo's, toestel-data, blokkades, admins)
- [x] Admin kan voornaam/achternaam invullen + gebruikersnaam voornaam.achternaam
- [x] Locatie/toestel/gekoppelde accounts per gebruiker zichtbaar
- [x] Functies blokkeren (tijdelijk of permanent) + handhaving bij profiel opslaan
- [x] Promo-sms: mobiel opent berichten-app, desktop toont QR
- [ ] Cadeaubonnen (koop, factuur, PDF, 3D, gratis fysieke levering BE)
- [ ] Promomail-bezorging verifiëren in productie (Brevo)
