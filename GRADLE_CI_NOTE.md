If your CI step fails with: "./gradlew: No such file or directory" from this directory:
- Use the local helper to ensure a wrapper exists and run the task:
  bash gradle-runner.sh assembleDebug

For real Android builds (not CI placeholder):
  cd tic_tac_toe_frontend
  npm run prebuild:android
  cd android && ./gradlew assembleDebug
