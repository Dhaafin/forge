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
  - `components/`: Atomic Design components & domain modals (e.g., `<ExercisesOrganism />`, `<CreateExerciseBottomSheet />`, `<EditExerciseBottomSheet />`, `<DeleteExerciseBottomSheet />`).
  - `index.ts`: Feature public exports.
- **Thin Route Layer (`src/app/`)**: Keep Expo Router screens lightweight by rendering the main Organism from the feature domain (e.g., `<ExercisesOrganism />`).
- **Reuse UI Primitives**: ALWAYS reuse shared UI components from `@/components/ui`:
  - `Typography`: Pre-configured Google Fonts (`Inter` for Headers, `Poppins` for Body).
  - `Button`: Motorsport styled button with loading state & press animation.
  - `Input`: Form input with focus highlight, icons, & error text.
  - `Checkbox`: Custom session checkbox.
  - `Badge`: Slanted tag badge (`primary`, `cyan`, `dark`).
  - `ScreenHeader`: Reusable header component for all screens.
  - `Skeleton`: Reusable animated pulse/shimmer loading placeholder. **Use `<Skeleton>` instead of raw `<ActivityIndicator>` spinners for screen/list loading states.**
  - `FlashMessage`: Modern top toast notification supporting `success`, `error`, `warning`, and `info`. **Use `useFlashMessage()` from `@/ctx/flash-message-context` (e.g. `showSuccess`, `showError`, `showWarning`, `showInfo`) instead of raw `Alert.alert()` for in-app user notifications.**
- **Environment Driven API**: API endpoints must consume `ApiConfig` from `@/config/api.config.ts` (`EXPO_PUBLIC_API_URL`). Never hardcode backend URLs or IP addresses in source files.
- **Native Safe Area Insets**: Use `useSafeAreaInsets()` for dynamic bottom & top device padding to avoid overlapping system navigation bars.

## 4. Backend API Architecture (`apps/web/app/api`)
- **Primary Backend API**: The active backend service for Forge is Next.js API in `apps/web/app/api/`.
- **Ignore FastAPI (`forge-api`)**: Do NOT write, target, or design logic for FastAPI (`forge-api`). `forge-api` is strictly an old reference repository and is not active.
- **CamelCase Schema Standard**: All API request bodies and Zod validation schemas (`apps/web/lib/validations.ts`) use clean camelCase conventions (e.g., `exerciseId`, `setNumber`, `weightKg`, `sequenceOrder`, `durationMinutes`, `startTime`, `endTime`). Mobile app payloads must always send clean camelCase objects.
