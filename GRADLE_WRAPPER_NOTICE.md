This repository includes a lightweight Gradle wrapper shim at ./gradlew intended for CI checks.
It downloads a Gradle distribution on demand into ./.gradle-ci-cache and runs a placeholder assembleDebug task
if no Gradle project is present. For real Android builds, use:
  cd tic_tac_toe_frontend && npm run prebuild:android && cd android && ./gradlew assembleDebug
