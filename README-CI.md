# CI Notes

- CI may invoke `./gradlew` from the repository root.
- A root-level `gradlew` shim forwards to `tic_tac_toe_frontend/android/gradlew`.
- Ensure executable permissions are set. The root `package.json` includes a `postinstall` that runs `chmod +x` on both wrappers.
- Use `npm run gradle:check` at the root to simulate gradle checks in CI.
- Alternatively, call `bash run-gradle.sh assembleDebug` which will bootstrap and execute the wrapper if missing.
- If your CI cannot be changed and insists on calling `./gradlew` directly, add a pre-step: `bash .ci-init.sh` to ensure a root-level gradle shim exists.
- Permission note: Some CI environments drop executable bits. Add a pre-step: `bash .prepare-ci.sh` to set executable permissions before running `./gradlew`.
