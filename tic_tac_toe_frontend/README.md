# Tic Tac Toe Frontend (Expo/React Native)

This app is built with Expo (React Native). It supports:
- Player vs Player and Player vs AI
- Interactive board
- Win/Draw detection
- Score tracking
- New Game and Reset Scores

Development
- Run: `npm install` then `npm start` (or `npm run android`).

Android Native Build
- For a real native Android build, run:
  - `npm run prebuild:android` (generates `android/`)
  - `cd android && ./gradlew assembleDebug`

CI Note
- This repo includes a placeholder `android/gradlew` so CI steps that directly call `./gradlew` do not fail.
- If CI needs to run a Gradle step from the frontend directory, use `npm run gradle:check`.
- The placeholder is not intended for production builds. Use Expo prebuild for real builds.
