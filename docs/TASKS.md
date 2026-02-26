# TASKS — Remaining Work for App Store Release

> Generated 2026-02-25. Current state: **polished client-only demo with fake data — not production-ready.**

---

## Legend

| Tag | Meaning |
|-----|---------|
| **BLOCKING** | App store submission will be rejected without this |
| **REQUIRED** | Needed for a credible v1.0 launch |
| **RECOMMENDED** | Improves quality and maintainability |

---

## 1. Backend & Real Voting System [BLOCKING]

The app currently has **no backend at all**. `generateResults()` in `ResultsScreen.tsx` produces deterministic fake percentages seeded from the city name. Votes are not stored, aggregated, or shared between users.

- [ ] Design and deploy a backend API (e.g. Supabase, Firebase, or custom server)
- [ ] Implement real vote submission endpoint (`POST /vote`)
- [ ] Implement results retrieval endpoint (`GET /results/:city`)
- [ ] Add vote deduplication (one vote per user per day)
- [ ] Implement the midnight reset logic (currently "resets at midnight" is static text in `VoteScreen.tsx:187` with no actual functionality)
- [ ] Replace `generateResults()` with real API calls in `ResultsScreen.tsx:45-54`
- [ ] Add loading states and error handling for network requests
- [ ] Handle offline/poor connectivity gracefully

---

## 2. App Store Configuration [BLOCKING]

`app.json` is missing critical fields required for submission.

- [ ] Add `ios.bundleIdentifier` (e.g. `com.yourname.goingout`)
- [ ] Add `android.package` (e.g. `com.yourname.goingout`)
- [ ] Add `ios.buildNumber` and `android.versionCode`
- [ ] Add `description` field
- [ ] Set up an Expo `owner` account
- [ ] Fix `userInterfaceStyle` — currently `"light"` but onboarding uses dark theme (`#0D0D0D`). Set to `"automatic"` or remove
- [ ] Configure `runtimeVersion` for EAS Updates

---

## 3. EAS Build & Submit Setup [BLOCKING]

No `eas.json` exists. Cannot build native binaries without it.

- [ ] Run `eas build:configure` to generate `eas.json`
- [ ] Set up iOS provisioning profiles and certificates
- [ ] Set up Android keystore
- [ ] Configure `submit` profiles for App Store Connect and Google Play Console
- [ ] Test a development build on a real device

---

## 4. Privacy Policy & Legal [BLOCKING]

Both stores require a privacy policy. None exists.

- [ ] Write a privacy policy covering data collection (city, vote, device info)
- [ ] Host the privacy policy at a public URL
- [ ] Add the URL to `app.json` under `expo.ios.privacyManifests` / privacy URL
- [ ] Write Terms of Service
- [ ] Add a LICENSE file to the repository
- [ ] Add App Tracking Transparency declaration (iOS requires this even if you don't track)

---

## 5. Store Listing Assets [BLOCKING]

No screenshots, descriptions, or marketing assets exist.

- [ ] Create app screenshots for iPhone (6.7", 6.5", 5.5")
- [ ] Create app screenshots for iPad (if `supportsTablet` remains `true`)
- [ ] Create app screenshots for Android (phone + tablet)
- [ ] Write short description (80 chars) and full description (4000 chars)
- [ ] Create feature graphic for Google Play (1024x500)
- [ ] Define keywords / search terms
- [ ] Add support URL and contact email
- [ ] Select appropriate app category (Social Networking / Lifestyle)
- [ ] Complete age rating questionnaire

---

## 6. Error Handling [REQUIRED]

There are zero `try-catch` blocks in the entire codebase. Every `AsyncStorage` call in `App.tsx:19-26` can throw silently.

- [ ] Wrap all AsyncStorage reads/writes in try-catch
- [ ] Add an error boundary component at the root (`App.tsx`)
- [ ] Show user-facing error states for failed operations
- [ ] Add error logging (console + future crash reporting service)

---

## 7. Accessibility [REQUIRED]

No accessibility support exists. Apple reviews for accessibility compliance.

- [ ] Add `accessibilityLabel` to all interactive elements (buttons in `OnboardingScreen.tsx:82,147`, `VoteScreen.tsx:93-110`, `ResultsScreen.tsx:120`)
- [ ] Add `accessibilityRole` to buttons, headers, and text
- [ ] Add `accessibilityHint` for non-obvious actions
- [ ] Ensure touch targets meet minimum 44x44pt (check vote buttons)
- [ ] Support Dynamic Type / font scaling
- [ ] Test with VoiceOver (iOS) and TalkBack (Android)

---

## 8. User Identity & Vote Integrity [REQUIRED]

There is no user identification system. Without it, votes can't be tracked or deduplicated.

- [ ] Generate and persist an anonymous user ID (UUID in AsyncStorage or Expo SecureStore)
- [ ] Send user ID with vote submissions for deduplication
- [ ] Decide whether to add optional accounts (social login, Apple Sign-In — required by Apple if any third-party login is offered)

---

## 9. Dead Code & UI Bugs [REQUIRED]

- [ ] **Render the headline in ResultsScreen** — `getResultHeadline()` at `ResultsScreen.tsx:56-78` generates dynamic headline/subtitle text but the return values are fetched at line 82 and **never rendered**. Only the hardcoded "the city has spoken" shows.
- [ ] **Extract `getCityAbbr()`** — duplicated in `VoteScreen.tsx:17-41` and `ResultsScreen.tsx:17-43`. Move to a shared utility file.
- [ ] Fix custom city input — no validation prevents submitting an empty string

---

## 10. Navigation & UX Gaps [REQUIRED]

- [ ] Add ability to change city without clearing all app data (currently no way to return to onboarding)
- [ ] Add a settings / profile screen
- [ ] Implement the midnight countdown timer (or remove the "resets at midnight" claim from `VoteScreen.tsx:187`)
- [ ] Add a confirmation or undo for vote submission
- [ ] Handle the Android back button properly

---

## 11. Testing [RECOMMENDED]

No test framework is configured. No tests exist.

- [ ] Install Jest and React Native Testing Library
- [ ] Add unit tests for `generateResults()` and `getCityAbbr()`
- [ ] Add component tests for each screen
- [ ] Add integration tests for the onboarding → vote → results flow
- [ ] Add `testID` props to key elements for E2E testing
- [ ] Consider Detox or Maestro for E2E tests on simulators

---

## 12. Code Quality Tooling [RECOMMENDED]

- [ ] Add ESLint with `@react-native/eslint-config`
- [ ] Add Prettier for consistent formatting
- [ ] Add pre-commit hooks (Husky + lint-staged)
- [ ] Add CI pipeline (GitHub Actions) for TypeScript checks and linting

---

## 13. Analytics & Crash Reporting [RECOMMENDED]

No visibility into how the app is used or if it crashes.

- [ ] Integrate crash reporting (Sentry or Bugsnag)
- [ ] Add basic analytics (Firebase Analytics, PostHog, or Amplitude)
- [ ] Track key events: onboarding complete, vote cast, results viewed
- [ ] Add performance monitoring

---

## 14. Polish & Nice-to-Haves [RECOMMENDED]

- [ ] Add share functionality on the results screen (share your city's vibe)
- [ ] Add haptic feedback on vote buttons
- [ ] Add pull-to-refresh on results
- [ ] Add dark mode support across all screens (onboarding is dark, vote/results are light — inconsistent)
- [ ] Add onboarding animation or illustration
- [ ] Consider geolocation-based city detection instead of manual picker
- [ ] Add localization support (i18n) if targeting non-English markets
- [ ] Add push notifications ("Your city is going out tonight!")
- [ ] Optimize assets — favicon is 1.5KB, main icons are ~20KB each

---

## Priority Order

For the fastest path to a submittable v1.0:

1. **App store config** (Section 2) — quick wins, unblocks builds
2. **EAS setup** (Section 3) — unblocks native testing
3. **Backend** (Section 1) — the core missing piece
4. **Error handling** (Section 6) — prevents crashes
5. **Dead code fixes** (Section 9) — quick cleanup
6. **Accessibility** (Section 7) — Apple will review this
7. **Privacy & legal** (Section 4) — must exist before submission
8. **User identity** (Section 8) — needed for vote integrity
9. **Store assets** (Section 5) — last step before clicking "Submit"
10. Everything else improves quality but isn't strictly blocking
