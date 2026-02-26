# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Are You Going Out Tonight?" — a React Native (Expo) app where users vote on whether they're going out tonight and see their city's aggregated results. Currently client-only with deterministic fake results (no backend).

## Commands

- `npm start` / `npx expo start` — start Expo dev server
- `npm run ios` — start on iOS simulator
- `npm run android` — start on Android emulator
- `npm run web` — start in browser
- TypeScript check: `npx tsc --noEmit`

No test framework is configured.

## Architecture

**Stack:** Expo SDK 54, React Native 0.81, React 19, TypeScript (strict mode), AsyncStorage for persistence.

**Navigation:** Manual screen state management in `App.tsx` via `useState<Screen>` — no navigation library. The `Screen` type is `'onboarding' | 'vote' | 'results'`.

**Screen flow:** Onboarding (city selection) → Vote (yes/no) → Results (animated bar chart). Onboarding is skipped on return visits via AsyncStorage flags (`onboarded`, `userCity`).

**Key files:**
- `App.tsx` — root component, screen routing, state management
- `screens/OnboardingScreen.tsx` — welcome + city picker (hardcoded `CITIES` list with custom city option)
- `screens/VoteScreen.tsx` — binary vote UI with spring animations
- `screens/ResultsScreen.tsx` — deterministic results generation via `generateResults()` (seeded from city name, no real backend)

**Patterns:**
- `getCityAbbr()` is duplicated in both `VoteScreen.tsx` and `ResultsScreen.tsx`
- All styling uses `StyleSheet.create` with inline platform checks (`Platform.OS === 'ios'`)
- Animations use React Native's `Animated` API throughout
- Dark theme on onboarding (#0D0D0D bg), light theme on vote/results (#FFFFFF bg)
