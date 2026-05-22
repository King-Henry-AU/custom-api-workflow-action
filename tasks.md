# Marketplace Go-Live Tasks

**Current state:** Build #3 deployed, distribution set to `marketplace`, functional but not yet submitted for review.

Tasks are ordered by dependency. Complete sections top-to-bottom.

---

## 1. Infrastructure — Backend Must Be Live First

Everything else depends on oauth.kinghenry.au working correctly.

- [x] **Configure OAuth credentials in DigitalOcean** — `custom_api_workflow` entry confirmed present in `HUBSPOT_APPS` env var

- [x] **Backend server is live** — `oauth.kinghenry.au` is responding (HTTP 400 on malformed POST confirms server is up)

- [x] **Verify OAuth flow end-to-end** — confirmed working

- [x] **Verify workflow action endpoint works post-OAuth** — GET https://httpbin.org/get returned `status_code: 200`, `success: true`

- [x] **Set up server monitoring for oauth.kinghenry.au** — UptimeRobot configured, alerts to uptimerobot@kinghenry.au

---

## 2. Legal Pages — Required for Submission

These URLs must be live before creating the app listing. HubSpot will crawl them.

- [x] **Privacy Policy live** at `https://kinghenry.au/privacy-policy` — returns 200

- [x] **Terms of Service live** at `https://kinghenry.au/terms-of-service` — returns 200

- [x] **App page live** at `https://kinghenry.au/apps/custom-api-workflow-action` _(see §3)_

---

## 3. Setup Guide — Required for Submission

HubSpot requires a publicly accessible setup guide URL specific to this integration.

- [x] **App page live** at `https://kinghenry.au/apps/custom-api-workflow-action`

---

## 4. App Icon — Verify and Upload

- [x] **Verify the existing icon meets HubSpot's specs**
  - Confirmed: 800×800px PNG — meets all dimensional requirements

- [x] **Add icon to git**
  - Committed in build #10 prep commit

---

## 5. Code — Clean Up Before Final Upload

- [x] **Commit uncommitted SettingsPage.tsx changes**
  - Committed: replaced invalid `<strong>` tags with `<Text inline format={{fontWeight:'bold'}}>`

- [x] **Run `hs project validate`** — passed with no errors

- [x] **Upload a fresh build**
  - Build #10 uploaded and deployed to portal 49012930

---

## 6. Acquire 3 Active Installs — Hard Requirement

HubSpot requires **3 active, unique installs from accounts not affiliated with your organization** before a listing can go live. "Active" means the app has made OAuth-authenticated API requests within the last 30 days.

- [ ] **Identify 3 beta testers** (contacts, colleagues at other companies, HubSpot community members)
  - Each must be a separate HubSpot production account
  - None can be your own accounts or accounts of your organization

- [ ] **Have each tester install and use the app**
  - Install via OAuth flow
  - Create at least one workflow using the "Custom API Call" action
  - Execute the workflow at least once to generate app activity

- [ ] **Confirm installs are showing as active**
  - Check HubSpot Developer Portal → the app → Installs tab
  - All 3 must show activity within 30 days of submission

---

## 7. App Listing — Create in HubSpot Developer Portal

Done entirely through the HubSpot UI at: Developer Account → App Listings → Create listing

### 7a. Listing Info tab

- [ ] Public app name: `Custom API Workflow Action`
- [ ] Company name: `King Henry`
- [ ] Tagline: ready in `content/app-listing-copy.md` → "Tagline" section
- [ ] Install Button URL: select the OAuth redirect URL from the dropdown
- [ ] Sign-in configuration: does not require a separate partner sign-in (the OAuth flow is self-contained)
- [ ] App icon: upload the 800×800 icon
- [ ] Categories: select up to 2 (suggested: "Productivity" + "Automation")
- [ ] URL path and search terms

### 7b. App Details tab

- [ ] **Demo video**: create a short screen recording (~2–3 min) showing:
  - Installing the app via OAuth
  - Adding the "Custom API Call" action to a workflow
  - Configuring a POST request with bearer token auth
  - Running the workflow and viewing output fields
- [ ] **Screenshots** (up to 8): capture
  1. The "Custom API Call" action in the workflow editor
  2. The auth_type dropdown showing the 4 options
  3. Bearer token fields showing conditional display
  4. Query parameters / custom headers textarea
  5. Output fields (status_code, response_body, success) being used in a branch
  6. The settings page
- [ ] **App overview**: content ready in `content/app-listing-copy.md` → "App Overview" section (~300 words)
- [ ] **Shared data**: document how data flows
  - The app reads workflow enrollment data (contact/company/deal properties) and sends them to external APIs
  - No HubSpot objects are written to by this app
  - Scopes: `oauth`
- [ ] **HubSpot features your app works with**: select "Workflows"
- [ ] **Languages**: English

### 7c. Pricing tab

- [ ] Set currency
- [ ] Add pricing plan(s) — must match what's on kinghenry.au pricing page
  - If free: use "Free" model (only for free-forever or freemium)
  - Link to `https://kinghenry.au/pricing` (or equivalent)

### 7d. App Features tab

- [ ] Add feature: "Custom API Call Workflow Action"
  - Description ready in `content/app-listing-copy.md` → "Feature description" section
  - Add a screenshot

### 7e. Support Info tab

- [ ] Support email: `support@kinghenry.au` ✅ (already in hsmeta)
- [ ] Languages: English
- [ ] Company website: `https://kinghenry.au`
- [ ] Setup documentation URL: `https://kinghenry.au/apps/custom-api-workflow-action`
- [ ] Terms of Service URL: `https://kinghenry.au/terms-of-service`
- [ ] Privacy Policy URL: `https://kinghenry.au/privacy-policy`

### 7f. Testing Info tab

- [ ] **App review instructions** — copy ready in `content/app-listing-copy.md` → "App review instructions" section
- [ ] **Technology Partner Program contacts**: add at least one contact (Main point of contact required)
  - Add: Developer contact, Marketing contact

---

## 8. Review and Submit

- [ ] Open the **Review info** tab in the listing editor
- [ ] Click **Run validation** — resolve all errors
- [ ] Click **Submit for review**
- [ ] Agree to the Technology Partner Program Agreement terms
- [ ] Note: HubSpot will respond within 10 business days

---

## 9. Post-Submission (while waiting for review)

- [ ] Monitor `support@kinghenry.au` for HubSpot reviewer feedback
- [ ] Keep oauth.kinghenry.au online and monitored during review period
- [ ] Do not submit any other apps until this one is approved (HubSpot processes one at a time)
- [ ] Ensure all 3 beta installs remain active (app used at least once in 30 days)

---

## Quick Reference

| Item                              | Status                  | Location                                       |
| --------------------------------- | ----------------------- | ---------------------------------------------- |
| Build #3 deployed                 | ✅ Done                 | HubSpot portal 49012930                        |
| `distribution: marketplace`       | ✅ Done                 | `src/app/app-hsmeta.json`                      |
| OAuth configured                  | ✅ Done                 | app-hsmeta.json                                |
| App icon file                     | ✅ Committed, build #10 | `App-Icon-Workflow-API-Call.png`               |
| SettingsPage.tsx committed        | ✅ Done                 | build #10                                      |
| Build #10 deployed                | ✅ Done                 | HubSpot portal 49012930                        |
| OAuth credentials in DigitalOcean | ✅ Confirmed            | DigitalOcean → HUBSPOT_APPS env var            |
| Privacy Policy page               | ✅ Live                 | `kinghenry.au/privacy-policy`                  |
| Terms of Service page             | ✅ Live                 | `kinghenry.au/terms-of-service`                |
| App page (setup + support)        | ✅ Live                 | `kinghenry.au/apps/custom-api-workflow-action` |
| 3 active installs                 | ❌ Missing              | HubSpot Developer Portal                       |
| App listing created               | ❌ Missing              | HubSpot Developer Portal                       |
| Demo video                        | ❌ Missing              | For app listing                                |
| Screenshots                       | ❌ Missing              | For app listing                                |

---

## Dependency Order Summary

```
Backend working (§1)
  → OAuth credentials configured
    → Legal pages live (§2)
    → Setup guide live (§3)
      → App listing created (§7)
        → Beta installs (§6) [can run in parallel with listing creation]
          → Submit (§8)
```

Do not create the app listing before legal pages and setup guide are live — HubSpot crawls all URLs at submission time.
