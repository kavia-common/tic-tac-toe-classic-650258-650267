#!/usr/bin/env bash
set -e
chmod +x ./gradlew || true
chmod +x tic_tac_toe_frontend/android/gradlew || true
echo "[ensure-gradlew-exec] gradlew files are now executable (if present)."
