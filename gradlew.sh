#!/usr/bin/env bash
set -e
# Ensure gradlew exists via the pre-run script, then execute it.
if [ -f ".gradle/pre-run.sh" ]; then
  bash .gradle/pre-run.sh "$@"
  exit $?
fi

# Fallback: try to execute existing shim
if [ -f "./gradlew" ]; then
  chmod +x ./gradlew || true
  exec ./gradlew "$@"
fi

echo "[gradlew.sh] No gradlew shim found and pre-run not available."
exit 0
