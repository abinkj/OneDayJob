# Mobile Release & Versioning Playbook (Zoopol)

> **Current Production Version**: `1.0.2`  
> **Runtime Version**: `1.0.2`  
> **Next Release Target**: Native Store Build (Google Play AAB & App Store IPA)

This document outlines the standard release lifecycle, versioning architecture, and tracking protocols used to maintain consistency across **Store Builds (Native)**, **Native In-App Store Updates**, and **Over-The-Air (OTA) Updates**.

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

## 4. Backend Version Gating & Store Update Handshake

To alert installed native binaries (such as `1.0.1`) that a new store version (`1.0.2`) has been published on Google Play, the mobile client executes a lightweight handshake with `onedayjob-api`:

```
┌─────────────────────────────────┐                    ┌──────────────────────────────────┐
│   MOBILE APP (OneDayJob)        │                    │   BACKEND (onedayjob-api)        │
│                                 │                    │                                  │
│   hooks/useStoreUpdateCheck.ts  │                    │   GET /api/app-config            │
│   currentVersion: "1.0.1"       │─── HTTP GET ──────▶│   latest_version: "1.0.2"        │
│                                 │                    │   min_supported_version: "1.0.1" │
│   Compares versions             │◀── JSON Data ──────│   update_type: "SOFT"            │
│   Prompts user to update        │                    └──────────────────────────────────┘
│   Redirects to Play Store       │
└─────────────────────────────────┘
```

### Backend Contract Reference:
* **Backend Endpoint**: `GET /api/app-config`
* **Backend Implementation Docs**: `onedayjob-api/docs/APP_CONFIG_AND_VERSIONING.md`
* **Backend Code Location**: `onedayjob-api/src/services/appConfig.service.ts`

### Operational Workflow for Releasing a New Store Version:
1. When you release `1.0.2` on Google Play, set `LATEST_APP_VERSION=1.0.2` on your backend server.
2. All older clients running `1.0.1` will automatically detect the new version on next launch and prompt the user to update directly on Google Play.

---

## 5. Native In-App Updates (`expo-in-app-updates`)

### SOLID Architecture Overview

The native store update subsystem is built around SOLID design principles:

1. **Single Responsibility Principle (SRP)**:
   - `services/api/inAppUpdateService.ts`: Pure service layer that encapsulates native calls to `expo-in-app-updates`, handles platform checks (Android vs iOS vs Web), sanitizes payloads, and provides concurrency deduplication. It contains no React state or UI logic.
   - `hooks/useFlexibleStoreUpdate.ts`: React presentation and lifecycle hook that manages component state (`isDownloading`, `isDownloaded`, `isUpdateAvailable`), handles `AppState` foreground checks, and provides user prompt interactions.
2. **Open / Closed Principle (OCP)**:
   - Extensible through options (`checkOnMount`, `autoPromptFlexible`, `autoStartFlexible`, custom callbacks) without modifying service internals.
3. **Liskov Substitution Principle (LSP)**:
   - Any class implementing `IInAppUpdateService` (e.g., `InAppUpdateService` or mock services for automated testing) can be substituted seamlessly.
4. **Interface Segregation Principle (ISP)**:
   - Exposes clean, targeted interfaces (`IInAppUpdateService`, `UpdateCheckResult`, `UseFlexibleStoreUpdateOptions`) so consumers only depend on what they need.
5. **Dependency Inversion Principle (DIP)**:
   - The React hook `useFlexibleStoreUpdate` accepts an optional `service?: IInAppUpdateService` parameter (Dependency Injection), depending on an abstraction rather than concrete native modules.

### iOS Configuration (`app.json`)
StoreKit requires numeric App Store ID and optional country code under `ios.infoPlist` and `ios.config`:
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.zoopol1.app",
      "config": {
        "AppStoreID": "6826779182"
      },
      "infoPlist": {
        "AppStoreID": "6826779182",
        "AppStoreCountry": "in"
      }
    }
  }
}
```

### Android In-App Updates
Uses package name `com.zoopol1.app` and Google Play Core In-App Updates library. Flexible updates download silently in the background; when completed, the user is prompted to restart the application.

### Basic Hook Usage
```typescript
import { useFlexibleStoreUpdate } from "../hooks/useFlexibleStoreUpdate";

export default function RootLayout() {
  const {
    isChecking,
    isUpdateAvailable,
    isDownloading,
    isDownloaded,
    startFlexibleUpdate,
    completeUpdate,
  } = useFlexibleStoreUpdate({
    checkOnMount: true,
    checkOnForeground: true,
    autoPromptFlexible: true,
  });
}
```

---

## 6. Release History & Changelog

### [1.0.2] - Native Store Release
* **App Version**: `1.0.2`
* **Runtime Version**: `1.0.2`
* **Target Channels**: `production`, `staging`
* **Key Changes**:
  - Integrated `expo-in-app-updates` with decoupled SOLID service (`inAppUpdateService.ts`) and presentation hook (`useFlexibleStoreUpdate.ts`).
  - Added StoreKit `AppStoreID` (`6826779182`) and `AppStoreCountry` (`in`) configuration to `app.json`.
  - Synced mobile client with backend version gating endpoint (`/api/app-config`).
  - Safe area inset optimizations across layout components and onboarding flows.
  - Updated OTA update handling with AppState foreground resume checks.

### [1.0.1] - Initial Production Baseline
* **App Version**: `1.0.1`
* **Runtime Version**: `1.0.1`
* **Target Channels**: `production`

