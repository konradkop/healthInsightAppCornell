# Health Insight App Cornell 2025

A React Native mobile app built with Expo and Expo Router.

## Getting Started

These instructions assume you have a working development environment for JavaScript/TypeScript and React Native.

### Prerequisites

- Node.js (LTS version preferred)
- npm (comes with Node.js)
- Android Studio if you want to run on an Android emulator
- A physical Android device with USB debugging enabled if you want to run on a real device

> If you are on macOS, you can also run the app on an iOS simulator with `npm run ios`.

### What if I don't have VS Code, Node, or npm?

- VS Code is optional. You can use any code editor, or just open a terminal in this project folder.
- Install Node.js from https://nodejs.org/ if you do not have it.
- npm is included with Node.js, so installing Node.js will also install npm.
- If you want an editor like VS Code, install it from https://code.visualstudio.com/.

### Install Expo CLI (optional)

This project uses Expo, and you can run it without a global Expo CLI install because the `npm` scripts use the local Expo package.

If you want to install the Expo CLI globally for convenience, run:

```bash
npm install --global expo-cli
```

If you do not want a global install, you can still use:

```bash
npm run start
```

### Install dependencies

From the repository root:

```bash
npm install
```

### Run the app

Start the Expo development server:

```bash
npm run start
```

This will open Expo Dev Tools in your browser.

### Run on Android

If you have an Android emulator running or a device connected, use:

```bash
npm run android
```

### Run on iOS

Only available on macOS with Xcode installed:

```bash
npm run ios
```

### Run on Web

If you want to run the app in a browser:

```bash
npm run web
```

## Useful commands

- `npm run lint` — run Expo linting for the project
- `npm run reset-project` — reset project state using the included script

## Notes for beginners

- Use the Expo Dev Tools window to open the app on a device or emulator.
- If you are new to mobile development, running on the `web` target is the easiest way to start.
- If an Android device does not appear, make sure USB debugging is enabled and that `adb devices` shows your device.
- If you do not have `expo-cli` installed globally, `npm run start` already uses the local Expo package.

## Project structure

- `app/` — Expo Router screens and app pages
- `components/` — reusable UI components
- `contexts/` — React Context providers for authentication, GPS, and HealthKit
- `hooks/` — custom hooks used across the app
- `android/` and `ios/` — native project files for building Android and iOS
- `assets/` — images and other static assets
- `scripts/` — helper scripts such as `reset-project.js`
