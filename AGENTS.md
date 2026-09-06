# Agent Instructions & Directives

## 1. Small Commits Standard
- Always perform **small, atomic Git commits** for every logical chunk of work (e.g., setting up a package, adding a single schema/route, fixing a bug).
- Do not make massive changes without committing incrementally.
- Write clear, descriptive commit messages adhering to Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`).

## 2. Ponytail Decision Ladder & Skill Rules
- **Always apply the `ponytail` skill mindset** to optimize coding tasks, eliminate bloat, and prevent over-engineering.
- **Minimalist Clean Code**: Prefer concise, readable solutions using native JavaScript/TypeScript and Next.js/React APIs over heavy third-party abstractions.
- **Reuse Existing Patterns**: Use established monorepo patterns and existing standard packages before introducing new dependencies.
- **No Over-Engineering**: Keep architecture simple, direct, and pragmatic.

## 3. Mobile App Architecture & Modular Conventions (`apps/mobile`)
- **Feature-Based Domain Organization**: Place domain features inside `apps/mobile/src/features/<feature-name>/`:
  - `services/`: Pure TypeScript API client calls (e.g., `exercises.service.ts`, `auth.service.ts`).
  - `hooks/`: Business logic, form state, and data fetching hooks (e.g., `useExercises.ts`, `useLoginForm.ts`).
  - `components/`: Atomic Design components (`<FeatureOrganism />`, `<FeatureSection />`).
  - `index.ts`: Feature public exports.
- **Thin Route Layer (`src/app/`)**: Keep Expo Router screens lightweight by rendering the main Organism from the feature domain (e.g., `<ExercisesOrganism />`).
- **Reuse UI Primitives**: ALWAYS reuse shared UI components from `@/components/ui`:
  - `Typography`: Pre-configured Google Fonts (`Inter` for Headers, `Poppins` for Body).
  - `Button`: Motorsport styled button with loading state & press animation.
  - `Input`: Form input with focus highlight, icons, & error text.
  - `Checkbox`: Custom session checkbox.
  - `Badge`: Slanted tag badge (`primary`, `cyan`, `dark`).
  - `ScreenHeader`: Reusable header component for all screens.
- **Environment Driven API**: API endpoints must consume `ApiConfig` from `@/config/api.config.ts` (`EXPO_PUBLIC_API_URL`). Never hardcode backend URLs or IP addresses in source files.
- **Native Safe Area Insets**: Use `useSafeAreaInsets()` for dynamic bottom & top device padding to avoid overlapping system navigation bars.
