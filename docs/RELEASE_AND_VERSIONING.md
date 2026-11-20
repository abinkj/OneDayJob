# Mobile Release & Versioning Playbook (Zoopol)

This document outlines the standard release lifecycle, versioning architecture, and tracking protocols used by high-maturity mobile engineering teams to maintain consistency across **Store Builds (Native)** and **Over-The-Air (OTA) Updates**.

---

## 1. Eliminating "Version Drift" (Single Source of Truth)

### What is "Version Drift"?
Version drift occurs when different files within the codebase fall out of sync with one another. A typical mobile anti-pattern looks like this:
* `app.json` specifies `"version": "1.0.1"`
* `package.json` still states `"version": "1.0.0"`
* `strings.ts` hardcodes `APP_VERSION: "Version 1.0.1"`
* Android `build.gradle` or iOS `Info.plist` has another outdated version tag.

#### Why This Breaks Production:
1. **Misleading Diagnostics & QA**: Customer support and bug reports display the hardcoded string from `strings.ts` rather than the true binary or bundle installed.
2. **Broken OTA Updates**: If `runtimeVersion` drifts away from `version`, EAS Update will silently skip pushing critical bug fixes to affected devices.
3. **Store Submissions Conflicts**: Google Play and App Store review systems flag inconsistent bundle identifiers or duplicate version codes.

---

### How FAANG Eliminates Version Drift

High-maturity engineering teams implement three strict guardrails:

#### Guardrail 1: Establish a Single Canonical File
In this project, **`app.json` is the sole source of truth (SSOT)**:
* `expo.version`: Controls the public store-facing version.
* `expo.runtimeVersion`: Controls the OTA bundle compatibility lock.
* `package.json` is synced to match `app.json` during release.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SINGLE SOURCE OF TRUTH (app.json)                    │
│                                                                        │
│   "version": "1.0.2"             ◄── Store Version (SemVer)            │
│   "runtimeVersion": "1.0.2"       ◄── OTA Compatibility Lock            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌───────────────────────┐                        ┌───────────────────────┐
│   EAS BUILD (Store)   │                        │  EAS UPDATE (OTA Hot) │
│                       │                        │                       │
│ • Compiles Swift/Java │                        │ • Pure JS & Assets    │
│ • Increments build #  │                        │ • Targets matching    │
│ • Submits to Store    │                        │   runtimeVersion only │
└───────────────────────┘                        └───────────────────────┘
```

#### Guardrail 2: Ban Hardcoded Strings in Application Code
Never write version strings manually in translation files or UI components (e.g. `APP_VERSION: "Version 1.0.1"`). 

Instead, read dynamically from the Expo runtime configuration:
```tsx
import Constants from "expo-constants";

// Dynamically extracts from app.json — zero maintenance, zero drift
export const getAppVersionDisplay = (): string => {
  const version = Constants.expoConfig?.version || "1.0.0";
  return `Version ${version}`;
};
```

#### Guardrail 3: CI/CD Enforcement & Automated Version Bumps
FAANG teams automate version increments so engineers never manually search and replace strings across multiple files.
* A single command updates both `app.json` and `package.json`:
  ```json
  "scripts": {
    "bump:patch": "npm version patch && node scripts/sync-version.js",
    "bump:minor": "npm version minor && node scripts/sync-version.js"
  }
  ```
* Continuous Integration (CI) blocks any Pull Request if `app.json` and `package.json` versions do not match.

---

## 2. Why Bare Workflow Requires Manual `runtimeVersion`

In Expo Managed workflow, Expo generates native projects on the fly, allowing policies like `{"policy": "appVersion"}`.

In **Bare Workflow** (where `android/` and `ios/` folders exist in git):
- Native Swift, Kotlin, and C++ code can be modified directly.
- Expo CLI prevents automatic runtime policies to protect against pushing JS updates to incompatible native binaries.
- **Rule**: Whenever you release a new native build with native dependency changes, you must manually update `"runtimeVersion": "X.Y.Z"` in `app.json`.

---

## 3. The Two Release Tracks

### Track A: Over-The-Air (OTA) Hotfix (`eas update`)
* **When to use**: Bug fixes, copy changes, styling updates, logic changes that **do not change native code**.
* **Turnaround**: Minutes (bypasses App Store / Google Play review).
* **Command**:
  ```bash
  # Production channel update
  eas update --channel production --message "Fix: Resolve job listing filter regression"

  # Staging / Preview channel update
  eas update --channel staging --message "Test: Onboarding flow adjustments"
  ```
* **User Experience**:
  - The app launches immediately with cached JS.
  - `useOTAupdates` downloads the new bundle silently.
  - A native prompt offers: `[Later]` or `[Restart]`.
  - Tapping **Restart** reloads the app with the new bundle.

---

### Track B: Native Store Release (`eas build`)
* **When to use**:
  - Upgrading Expo SDK or React Native version.
  - Adding or removing native libraries (e.g. `expo-camera`, payment SDKs).
  - Modifying permissions, splash screens, app icons, or native files.
  - Major feature milestones.
* **Process**:
  1. Increment `"version"` and `"runtimeVersion"` in `app.json` (e.g. `1.0.1` &rarr; `1.0.2`).
  2. Commit the changes and tag git:
     ```bash
     git add app.json
     git commit -m "chore(release): bump version to 1.0.2"
     git tag v1.0.2
     git push origin development --tags
     ```
  3. Trigger EAS Build:
     ```bash
     # Build Android AAB for Google Play
     eas build --platform android --profile production --auto-submit

     # Build iOS IPA for App Store
     eas build --platform ios --profile production --auto-submit
     ```

---

## 4. How FAANG Teams Track & Document Releases

### 1. The Release Matrix (Keep a Changelog)
Maintain a `CHANGELOG.md` at the root of the repository documenting each release:

```markdown
## [1.0.2] - 2026-11-20
### Type: Native Store Release
- **Runtime Version**: 1.0.2
- **Android versionCode**: 4
- **iOS Build**: 4
- **Git Tag**: v1.0.2
- **Changes**:
  - Added new location permissions handling for Android 14.
  - Upgraded payment gateway native SDK.
```

### 2. Semantic Versioning Protocol (SemVer)
- **MAJOR (`X.0.0`)**: Breaking architectural changes, major rebrand, or incompatible backend API migrations requiring forced store update.
- **MINOR (`1.X.0`)**: New features, new screens, backward-compatible native additions (Native Store Build).
- **PATCH (`1.0.X`)**: Bug fixes, UI polishes, small adjustments (Can be deployed via OTA `eas update` as long as native code did not change).

### 3. Dynamic In-App Version Display
Never hardcode the app version in `strings.ts` (e.g. `"Version 1.0.1"`). Instead, display the version dynamically in Settings:
```tsx
import * as Application from "expo-application";
import Constants from "expo-constants";

// The true native version installed from the store
const nativeVersion = Application.nativeApplicationVersion; // e.g. "1.0.1"

// The true build number
const buildNumber = Application.nativeBuildVersion; // e.g. "3"
```
This guarantees the UI will always reflect the exact version installed without manual string editing.
