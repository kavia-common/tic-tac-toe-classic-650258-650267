# tic-tac-toe-classic-650258-650267

This repository contains the Expo/React Native Tic Tac Toe app.

Build notes:
- Development: `cd tic_tac_toe_frontend && npm install && npm start`
- Native (Android): `cd tic_tac_toe_frontend && npm run prebuild:android && cd android && ./gradlew assembleDebug`

CI/Gradle notes:
- Some CI environments directly invoke `./gradlew` from the repo root. A root-level shim is provided which forwards to the frontend wrapper at `tic_tac_toe_frontend/android/gradlew`.
- If your CI runs before npm install, ensure executable permissions are set:
  - `chmod +x ./gradlew`
  - `chmod +x tic_tac_toe_frontend/android/gradlew`
- Alternatively, invoke `bash gradle-bootstrap.sh assembleDebug` which guarantees the wrapper exists.
